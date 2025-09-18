// src/invitation/invitation.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { randomBytes } from 'crypto';

import { Invitation, InviteScope, InviteStatus } from './invitation.entity';
import { Organization } from 'src/organization/organization.entity';
import {
  OrganizationMember,
  OrgRole,
} from 'src/organization/organization-member.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

import { CreateLayerInviteDto, CreateOrgInviteDto } from './invitation.dtos';
import type { Resend as ResendClient } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation) private invRepo: Repository<Invitation>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private orgMemRepo: Repository<OrganizationMember>,
    @InjectRepository(LinkedCardLayer)
    private layerRepo: Repository<LinkedCardLayer>,
    @InjectRepository(LayerMember)
    private layerMemRepo: Repository<LayerMember>,
    @InjectRepository(ProfileUser) private profileRepo: Repository<ProfileUser>,

    private readonly cfg: ConfigService,
    @Optional()
    @Inject('RESEND_CLIENT')
    private readonly resendClient: ResendClient | null,
  ) {}

  private appOrigin() {
    return this.cfg.get<string>('APP_ORIGIN') || 'http://localhost:3000';
  }
  private emailFrom() {
    return this.cfg.get<string>('EMAIL_FROM') || 'noreply@example.com';
  }

  // ---------- helpers ----------
  private token(len = 24) {
    return randomBytes(len).toString('hex'); // 48 chars
  }
  private expiry(hours = 168) {
    // default 7 days
    const d = new Date();
    d.setHours(d.getHours() + hours);
    return d;
  }
  private async assertOrgAdminOrOwner(orgId: number, userId: number) {
    const m = await this.orgMemRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
        isActive: true,
      },
    });
    if (!m || ![OrgRole.OWNER, OrgRole.ADMIN].includes(m.role)) {
      throw new ForbiddenException(
        'Only org owner/admin can manage org invites',
      );
    }
  }
  private async assertLayerMemberOrOrgAdmin(layerId: number, userId: number) {
    const layer = await this.layerRepo.findOne({
      where: { id: layerId },
      relations: ['organization'],
    });
    if (!layer) throw new NotFoundException('Layer not found');
    // org-admin shortcut
    const orgM = await this.orgMemRepo.findOne({
      where: {
        organization: { id: layer.organization.id },
        user: { id: userId },
        isActive: true,
      },
    });
    if (orgM && [OrgRole.OWNER, OrgRole.ADMIN].includes(orgM.role))
      return layer;

    // otherwise must be layer member
    const lm = await this.layerMemRepo.findOne({
      where: { layer: { id: layerId }, user: { id: userId } },
    });
    if (!lm) throw new ForbiddenException('Not a member of this layer');
    return layer;
  }
  private async ensureOrgMember(
    orgId: number,
    user: ProfileUser,
    role: OrgRole = OrgRole.MEMBER,
  ) {
    let m = await this.orgMemRepo.findOne({
      where: { organization: { id: orgId }, user: { id: user.id } },
    });
    if (!m) {
      m = this.orgMemRepo.create({
        organization: { id: orgId } as any,
        user,
        role,
        isActive: true,
      });
      await this.orgMemRepo.save(m);
    } else if (!m.isActive) {
      m.isActive = true;
      await this.orgMemRepo.save(m);
    }
    return m;
  }
  private async ensureLayerMember(layerId: number, user: ProfileUser) {
    let lm = await this.layerMemRepo.findOne({
      where: { layer: { id: layerId }, user: { id: user.id } },
    });
    if (!lm) {
      lm = this.layerMemRepo.create({
        layer: { id: layerId } as any,
        user,
        isActive: true, // <-- important
      });
      await this.layerMemRepo.save(lm);
    } else if (!lm.isActive) {
      lm.isActive = true;
      await this.layerMemRepo.save(lm);
    }
    return lm;
  }

  private async sendInviteEmail(
    email: string,
    token: string,
    scope: InviteScope,
    org?: Organization,
    layer?: LinkedCardLayer,
  ) {
    const ctaUrl = `${this.appOrigin()}?t=${encodeURIComponent(token)}`;
    const subject =
      scope === InviteScope.ORG
        ? `Join ${org?.name} on Opinio^nth`
        : `Join the layer “${layer?.key}” in ${org?.name}`;

    const html = `
      <div style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;">
        <h2 style="margin:0 0 12px;font-weight:700;">${subject}</h2>
        <p style="margin:0 0 16px;color:#333;">
          You’ve been invited ${
            scope === InviteScope.ORG
              ? `to the workspace <b>${org?.name}</b>.`
              : `to the layer <b>${layer?.key}</b> in <b>${org?.name}</b>.`
          }
        </p>
        <p style="margin:0 0 20px;color:#333;">Click to accept:</p>
        <p><a href="${ctaUrl}" style="background:#6d28d9;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;">Accept invite</a></p>
        <p style="margin-top:20px;color:#666;font-size:12px;">Or paste: ${ctaUrl}</p>
      </div>
    `;

    if (!this.resendClient) {
      console.log(`[invite][dev] would email to=${email} url=${ctaUrl}`);
      return;
    }
    try {
      await this.resendClient.emails.send({
        from: this.emailFrom(),
        to: email,
        subject,
        html,
      });
    } catch (e) {
      console.error('[invite email] send failed:', e);
    }
  }
  // ---------- create ----------
  async createOrgInvite(
    orgId: number,
    inviterUserId: number,
    dto: CreateOrgInviteDto,
  ) {
    await this.assertOrgAdminOrOwner(orgId, inviterUserId);

    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');

    // If already a member, short-circuit
    // (Optional: check by email → depends on your User table; we skip here)

    const inv = this.invRepo.create({
      scope: InviteScope.ORG,
      organization: org,
      email: dto.email.toLowerCase(),
      invitedBy: { id: inviterUserId } as ProfileUser,
      token: this.token(),
      expiresAt: this.expiry(dto.expiresInHours),
      status: InviteStatus.PENDING,
    });
    const saved = await this.invRepo.save(inv);
    await this.sendInviteEmail(
      saved.email,
      saved.token,
      saved.scope,
      org,
      undefined,
    );
    return saved;
  }

  async createLayerInvite(
    layerId: number,
    inviterUserId: number,
    dto: CreateLayerInviteDto,
  ) {
    const layer = await this.assertLayerMemberOrOrgAdmin(
      layerId,
      inviterUserId,
    );
    const inv = this.invRepo.create({
      scope: InviteScope.LAYER,
      organization: layer.organization, // store org for easy filtering
      layer,
      email: dto.email.toLowerCase(),
      invitedBy: { id: inviterUserId } as ProfileUser,
      token: this.token(),
      expiresAt: this.expiry(dto.expiresInHours),
      status: InviteStatus.PENDING,
    });
    const saved = await this.invRepo.save(inv);
    await this.sendInviteEmail(
      saved.email,
      saved.token,
      saved.scope,
      layer.organization,
      layer,
    );
    return saved;
  }

  // ---------- list ----------
  async listOrgInvites(orgId: number) {
    return this.invRepo.find({
      where: { organization: { id: orgId } },
      order: { id: 'DESC' },
    });
  }
  async listLayerInvites(layerId: number) {
    return this.invRepo.find({
      where: { layer: { id: layerId } },
      order: { id: 'DESC' },
    });
  }

  // ---------- revoke / resend ----------
  async revoke(inviteId: number, requesterUserId: number) {
    const inv = await this.invRepo.findOne({ where: { id: inviteId } });
    if (!inv) throw new NotFoundException('Invite not found');
    if (inv.status !== InviteStatus.PENDING)
      throw new BadRequestException('Only pending invites can be revoked');

    // Permission: org admin/owner or same inviter
    const orgId = inv.organization?.id;
    if (orgId) {
      await this.assertOrgAdminOrOwner(orgId, requesterUserId).catch(
        async () => {
          if (inv.invitedBy?.id !== requesterUserId)
            throw new ForbiddenException();
        },
      );
    } else if (inv.layer?.id) {
      await this.assertLayerMemberOrOrgAdmin(
        inv.layer.id,
        requesterUserId,
      ).catch(() => {
        if (inv.invitedBy?.id !== requesterUserId)
          throw new ForbiddenException();
      });
    }

    inv.status = InviteStatus.REVOKED;
    return this.invRepo.save(inv);
  }

  async resend(inviteId: number, requesterUserId: number, hours = 168) {
    const inv = await this.invRepo.findOne({
      where: { id: inviteId },
      relations: ['organization', 'layer'],
    });
    if (!inv) throw new NotFoundException('Invite not found');
    if (inv.status !== InviteStatus.PENDING)
      throw new BadRequestException('Only pending invites can be resent');

    // same permission logic as revoke
    const orgId = inv.organization?.id;
    if (orgId) {
      await this.assertOrgAdminOrOwner(orgId, requesterUserId).catch(
        async () => {
          if (inv.invitedBy?.id !== requesterUserId)
            throw new ForbiddenException();
        },
      );
    } else if (inv.layer?.id) {
      await this.assertLayerMemberOrOrgAdmin(
        inv.layer.id,
        requesterUserId,
      ).catch(() => {
        if (inv.invitedBy?.id !== requesterUserId)
          throw new ForbiddenException();
      });
    }

    inv.token = this.token();
    inv.expiresAt = this.expiry(hours);
    const saved = await this.invRepo.save(inv);
    await this.sendInviteEmail(
      saved.email,
      saved.token,
      saved.scope,
      saved.organization,
      saved.layer,
    );
    return saved;
  }

  // ---------- accept ----------
  async previewByToken(token: string) {
    const now = new Date();
    const inv = await this.invRepo.findOne({
      where: { token, status: InviteStatus.PENDING, expiresAt: MoreThan(now) },
      relations: ['organization', 'layer'],
    });
    if (!inv) throw new NotFoundException('Invite not found or expired');
    return inv;
  }

  /**
   * Accept an invite as the current ProfileUser.
   * (Optionally enforce email match with your Auth User table.)
   */
  async accept(token: string, acceptorProfileUserId: number) {
    const inv = await this.previewByToken(token);
    const user = await this.profileRepo.findOne({
      where: { id: acceptorProfileUserId },
    });
    if (!user) throw new NotFoundException('User not found');

    if (inv.scope === InviteScope.ORG) {
      await this.ensureOrgMember(inv.organization!.id, user, OrgRole.MEMBER);
    } else if (inv.scope === InviteScope.LAYER) {
      // 1) add minimal org membership so org-scoped endpoints pass
      await this.ensureOrgMember(inv.organization!.id, user, OrgRole.GUEST); // <-- new
      // 2) add to the layer
      await this.ensureLayerMember(inv.layer!.id, user); // <-- ensures isActive
    } else {
      throw new BadRequestException('Unsupported invite scope');
    }

    inv.status = InviteStatus.ACCEPTED;
    await this.invRepo.save(inv);
    return { ok: true };
  }
}
