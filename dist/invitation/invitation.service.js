"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const invitation_entity_1 = require("./invitation.entity");
const organization_entity_1 = require("../organization/organization.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const linked_card_layer_entity_1 = require("../homefeed/linked-card-layer.entity");
const layer_member_entity_1 = require("../homefeed/layer-member.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const config_1 = require("@nestjs/config");
let InvitationService = class InvitationService {
    constructor(invRepo, orgRepo, orgMemRepo, layerRepo, layerMemRepo, profileRepo, cfg, resendClient) {
        this.invRepo = invRepo;
        this.orgRepo = orgRepo;
        this.orgMemRepo = orgMemRepo;
        this.layerRepo = layerRepo;
        this.layerMemRepo = layerMemRepo;
        this.profileRepo = profileRepo;
        this.cfg = cfg;
        this.resendClient = resendClient;
    }
    appOrigin() {
        return this.cfg.get('APP_ORIGIN') || 'http://localhost:3000';
    }
    emailFrom() {
        return this.cfg.get('EMAIL_FROM') || 'noreply@example.com';
    }
    token(len = 24) {
        return (0, crypto_1.randomBytes)(len).toString('hex');
    }
    expiry(hours = 168) {
        const d = new Date();
        d.setHours(d.getHours() + hours);
        return d;
    }
    async assertOrgAdminOrOwner(orgId, userId) {
        const m = await this.orgMemRepo.findOne({
            where: {
                organization: { id: orgId },
                user: { id: userId },
                isActive: true,
            },
        });
        if (!m || ![organization_member_entity_1.OrgRole.OWNER, organization_member_entity_1.OrgRole.ADMIN].includes(m.role)) {
            throw new common_1.ForbiddenException('Only org owner/admin can manage org invites');
        }
    }
    async assertLayerMemberOrOrgAdmin(layerId, userId) {
        const layer = await this.layerRepo.findOne({
            where: { id: layerId },
            relations: ['organization'],
        });
        if (!layer)
            throw new common_1.NotFoundException('Layer not found');
        const orgM = await this.orgMemRepo.findOne({
            where: {
                organization: { id: layer.organization.id },
                user: { id: userId },
                isActive: true,
            },
        });
        if (orgM && [organization_member_entity_1.OrgRole.OWNER, organization_member_entity_1.OrgRole.ADMIN].includes(orgM.role))
            return layer;
        const lm = await this.layerMemRepo.findOne({
            where: { layer: { id: layerId }, user: { id: userId } },
        });
        if (!lm)
            throw new common_1.ForbiddenException('Not a member of this layer');
        return layer;
    }
    async ensureOrgMember(orgId, user, role = organization_member_entity_1.OrgRole.MEMBER) {
        let m = await this.orgMemRepo.findOne({
            where: { organization: { id: orgId }, user: { id: user.id } },
        });
        if (!m) {
            m = this.orgMemRepo.create({
                organization: { id: orgId },
                user,
                role,
                isActive: true,
            });
            await this.orgMemRepo.save(m);
        }
        else if (!m.isActive) {
            m.isActive = true;
            await this.orgMemRepo.save(m);
        }
        return m;
    }
    async ensureLayerMember(layerId, user) {
        let lm = await this.layerMemRepo.findOne({
            where: { layer: { id: layerId }, user: { id: user.id } },
        });
        if (!lm) {
            lm = this.layerMemRepo.create({
                layer: { id: layerId },
                user,
                isActive: true,
            });
            await this.layerMemRepo.save(lm);
        }
        else if (!lm.isActive) {
            lm.isActive = true;
            await this.layerMemRepo.save(lm);
        }
        return lm;
    }
    async sendInviteEmail(email, token, scope, org, layer) {
        const ctaUrl = `${this.appOrigin()}?t=${encodeURIComponent(token)}`;
        const subject = scope === invitation_entity_1.InviteScope.ORG
            ? `Join ${org?.name} on Opinio^nth`
            : `Join the layer “${layer?.key}” in ${org?.name}`;
        const html = `
      <div style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;">
        <h2 style="margin:0 0 12px;font-weight:700;">${subject}</h2>
        <p style="margin:0 0 16px;color:#333;">
          You’ve been invited ${scope === invitation_entity_1.InviteScope.ORG
            ? `to the workspace <b>${org?.name}</b>.`
            : `to the layer <b>${layer?.key}</b> in <b>${org?.name}</b>.`}
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
        }
        catch (e) {
            console.error('[invite email] send failed:', e);
        }
    }
    async createOrgInvite(orgId, inviterUserId, dto) {
        await this.assertOrgAdminOrOwner(orgId, inviterUserId);
        const org = await this.orgRepo.findOne({ where: { id: orgId } });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        const inv = this.invRepo.create({
            scope: invitation_entity_1.InviteScope.ORG,
            organization: org,
            email: dto.email.toLowerCase(),
            invitedBy: { id: inviterUserId },
            token: this.token(),
            expiresAt: this.expiry(dto.expiresInHours),
            status: invitation_entity_1.InviteStatus.PENDING,
        });
        const saved = await this.invRepo.save(inv);
        await this.sendInviteEmail(saved.email, saved.token, saved.scope, org, undefined);
        return saved;
    }
    async createLayerInvite(layerId, inviterUserId, dto) {
        const layer = await this.assertLayerMemberOrOrgAdmin(layerId, inviterUserId);
        const inv = this.invRepo.create({
            scope: invitation_entity_1.InviteScope.LAYER,
            organization: layer.organization,
            layer,
            email: dto.email.toLowerCase(),
            invitedBy: { id: inviterUserId },
            token: this.token(),
            expiresAt: this.expiry(dto.expiresInHours),
            status: invitation_entity_1.InviteStatus.PENDING,
        });
        const saved = await this.invRepo.save(inv);
        await this.sendInviteEmail(saved.email, saved.token, saved.scope, layer.organization, layer);
        return saved;
    }
    async listOrgInvites(orgId) {
        return this.invRepo.find({
            where: { organization: { id: orgId } },
            order: { id: 'DESC' },
        });
    }
    async listLayerInvites(layerId) {
        return this.invRepo.find({
            where: { layer: { id: layerId } },
            order: { id: 'DESC' },
        });
    }
    async revoke(inviteId, requesterUserId) {
        const inv = await this.invRepo.findOne({ where: { id: inviteId } });
        if (!inv)
            throw new common_1.NotFoundException('Invite not found');
        if (inv.status !== invitation_entity_1.InviteStatus.PENDING)
            throw new common_1.BadRequestException('Only pending invites can be revoked');
        const orgId = inv.organization?.id;
        if (orgId) {
            await this.assertOrgAdminOrOwner(orgId, requesterUserId).catch(async () => {
                if (inv.invitedBy?.id !== requesterUserId)
                    throw new common_1.ForbiddenException();
            });
        }
        else if (inv.layer?.id) {
            await this.assertLayerMemberOrOrgAdmin(inv.layer.id, requesterUserId).catch(() => {
                if (inv.invitedBy?.id !== requesterUserId)
                    throw new common_1.ForbiddenException();
            });
        }
        inv.status = invitation_entity_1.InviteStatus.REVOKED;
        return this.invRepo.save(inv);
    }
    async resend(inviteId, requesterUserId, hours = 168) {
        const inv = await this.invRepo.findOne({
            where: { id: inviteId },
            relations: ['organization', 'layer'],
        });
        if (!inv)
            throw new common_1.NotFoundException('Invite not found');
        if (inv.status !== invitation_entity_1.InviteStatus.PENDING)
            throw new common_1.BadRequestException('Only pending invites can be resent');
        const orgId = inv.organization?.id;
        if (orgId) {
            await this.assertOrgAdminOrOwner(orgId, requesterUserId).catch(async () => {
                if (inv.invitedBy?.id !== requesterUserId)
                    throw new common_1.ForbiddenException();
            });
        }
        else if (inv.layer?.id) {
            await this.assertLayerMemberOrOrgAdmin(inv.layer.id, requesterUserId).catch(() => {
                if (inv.invitedBy?.id !== requesterUserId)
                    throw new common_1.ForbiddenException();
            });
        }
        inv.token = this.token();
        inv.expiresAt = this.expiry(hours);
        const saved = await this.invRepo.save(inv);
        await this.sendInviteEmail(saved.email, saved.token, saved.scope, saved.organization, saved.layer);
        return saved;
    }
    async previewByToken(token) {
        const now = new Date();
        const inv = await this.invRepo.findOne({
            where: { token, status: invitation_entity_1.InviteStatus.PENDING, expiresAt: (0, typeorm_2.MoreThan)(now) },
            relations: ['organization', 'layer'],
        });
        if (!inv)
            throw new common_1.NotFoundException('Invite not found or expired');
        return inv;
    }
    async accept(token, acceptorProfileUserId) {
        const inv = await this.previewByToken(token);
        const user = await this.profileRepo.findOne({
            where: { id: acceptorProfileUserId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (inv.scope === invitation_entity_1.InviteScope.ORG) {
            await this.ensureOrgMember(inv.organization.id, user, organization_member_entity_1.OrgRole.MEMBER);
        }
        else if (inv.scope === invitation_entity_1.InviteScope.LAYER) {
            await this.ensureOrgMember(inv.organization.id, user, organization_member_entity_1.OrgRole.GUEST);
            await this.ensureLayerMember(inv.layer.id, user);
        }
        else {
            throw new common_1.BadRequestException('Unsupported invite scope');
        }
        inv.status = invitation_entity_1.InviteStatus.ACCEPTED;
        await this.invRepo.save(inv);
        return { ok: true };
    }
};
exports.InvitationService = InvitationService;
exports.InvitationService = InvitationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invitation_entity_1.Invitation)),
    __param(1, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(2, (0, typeorm_1.InjectRepository)(organization_member_entity_1.OrganizationMember)),
    __param(3, (0, typeorm_1.InjectRepository)(linked_card_layer_entity_1.LinkedCardLayer)),
    __param(4, (0, typeorm_1.InjectRepository)(layer_member_entity_1.LayerMember)),
    __param(5, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(7, (0, common_1.Optional)()),
    __param(7, (0, common_1.Inject)('RESEND_CLIENT')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService, Function])
], InvitationService);
//# sourceMappingURL=invitation.service.js.map