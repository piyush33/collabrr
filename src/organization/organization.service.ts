// src/organization/organization.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, JoinPolicy } from './organization.entity';
import { OrganizationMember, OrgRole } from './organization-member.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { UsersService } from 'src/users/users.service'; // to read auth User email

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private memberRepo: Repository<OrganizationMember>,
    @InjectRepository(ProfileUser) private profileRepo: Repository<ProfileUser>,
    private readonly usersService: UsersService, // has User with email
  ) {}

  async getBySlug(slug: string) {
    const org = await this.orgRepo.findOne({ where: { slug } });
    if (!org) throw new NotFoundException('Organization not found');
    return { id: org.id, name: org.name, slug: org.slug };
    // (add joinPolicy/allowedDomains if you want to expose)
  }

  async searchMembers(orgId: number, q = '') {
    const rows = await this.memberRepo.find({
      where: { organization: { id: orgId }, isActive: true },
      relations: ['user'],
      take: 100,
    });
    const filtered = q
      ? rows.filter((r) =>
          [r.user.username, r.user.name]
            .filter(Boolean)
            .some((s) => s!.toLowerCase().includes(q.toLowerCase())),
        )
      : rows;
    return filtered.map((r) => ({
      id: r.user.id,
      username: r.user.username,
      name: r.user.name,
      image: r.user.image,
    }));
  }

  async getMembershipsForUsername(username: string) {
    const user = await this.profileRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('ProfileUser not found');

    const ms = await this.memberRepo.find({
      where: { user: { id: user.id } },
      relations: ['organization'],
      order: { id: 'DESC' },
    });

    return ms.map((m) => ({
      organization: {
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
      },
      role: m.role,
    }));
  }

  async createOrgAsOwner(
    dto: {
      name: string;
      slug: string;
      joinPolicy?: JoinPolicy;
      allowedDomains?: string[];
    },
    requester: { profileUserId?: number; username?: string },
  ) {
    const owner = requester.profileUserId
      ? await this.profileRepo.findOne({
          where: { id: requester.profileUserId },
        })
      : await this.profileRepo.findOne({
          where: { username: requester.username },
        });

    if (!owner) throw new NotFoundException('Requester profile not found');

    const exists = await this.orgRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new BadRequestException('Slug already in use');

    const org = this.orgRepo.create({
      name: dto.name,
      slug: dto.slug,
      joinPolicy: dto.joinPolicy ?? JoinPolicy.INVITE_ONLY,
      allowedDomains: (dto.allowedDomains ?? []).map((d) => d.toLowerCase()),
    });
    const saved = await this.orgRepo.save(org);

    await this.memberRepo.save(
      this.memberRepo.create({
        organization: saved,
        user: owner,
        role: OrgRole.OWNER,
        isActive: true,
      }),
    );

    return { id: saved.id, name: saved.name, slug: saved.slug };
  }

  // --- NEW: Discovery by domain ---
  private extractDomain(email: string) {
    const m = String(email || '')
      .toLowerCase()
      .match(/@([^@]+)$/);
    return m?.[1] || '';
  }

  async discoverByEmail(email: string) {
    const domain = this.extractDomain(email);
    if (!domain) throw new BadRequestException('Invalid email');

    // organizations where joinPolicy=DOMAIN and domain ∈ allowedDomains
    const qb = this.orgRepo.createQueryBuilder('org');
    qb.where('org.joinPolicy = :p', { p: JoinPolicy.DOMAIN }).andWhere(
      ':domain = ANY(org.allowedDomains)',
      { domain },
    );

    const rows = await qb.getMany();
    return rows.map((o) => ({ id: o.id, name: o.name, slug: o.slug }));
  }

  // --- NEW: Join by policy (OPEN/DOMAIN) ---
  async joinOrgByPolicy(
    orgId: number,
    jwtUser: { sub: number; username: string },
  ) {
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');

    // profile user for membership
    const profile = await this.profileRepo.findOne({
      where: { username: jwtUser.username },
    });
    if (!profile) throw new NotFoundException('ProfileUser not found');

    // already a member?
    const already = await this.memberRepo.findOne({
      where: { organization: { id: orgId }, user: { id: profile.id } },
    });
    if (already?.isActive) return { ok: true }; // idempotent

    if (org.joinPolicy === JoinPolicy.INVITE_ONLY) {
      throw new ForbiddenException('This workspace requires an invitation');
    }

    if (org.joinPolicy === JoinPolicy.OPEN) {
      // anyone with an account can join
      await this.memberRepo.save(
        this.memberRepo.create({
          organization: org,
          user: profile,
          role: OrgRole.MEMBER,
          isActive: true,
        }),
      );
      return { ok: true };
    }

    if (org.joinPolicy === JoinPolicy.DOMAIN) {
      // verify email domain against org.allowedDomains
      const authUser = await this.usersService.findOneByUsernameOrEmail(
        jwtUser.username,
      );
      const email = authUser?.email;
      const domain = this.extractDomain(email || '');
      if (!domain)
        throw new ForbiddenException('Email not present for domain join');
      const ok = (org.allowedDomains || [])
        .map((d) => d.toLowerCase())
        .includes(domain);
      if (!ok)
        throw new ForbiddenException(
          'Your email domain is not allowed for this workspace',
        );

      await this.memberRepo.save(
        this.memberRepo.create({
          organization: org,
          user: profile,
          role: OrgRole.MEMBER,
          isActive: true,
        }),
      );
      return { ok: true };
    }

    throw new ForbiddenException('Unsupported join policy');
  }
}
