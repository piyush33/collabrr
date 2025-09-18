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
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("./organization.entity");
const organization_member_entity_1 = require("./organization-member.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const users_service_1 = require("../users/users.service");
let OrganizationService = class OrganizationService {
    constructor(orgRepo, memberRepo, profileRepo, usersService) {
        this.orgRepo = orgRepo;
        this.memberRepo = memberRepo;
        this.profileRepo = profileRepo;
        this.usersService = usersService;
    }
    async getBySlug(slug) {
        const org = await this.orgRepo.findOne({ where: { slug } });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        return { id: org.id, name: org.name, slug: org.slug };
    }
    async searchMembers(orgId, q = '') {
        const rows = await this.memberRepo.find({
            where: { organization: { id: orgId }, isActive: true },
            relations: ['user'],
            take: 100,
        });
        const filtered = q
            ? rows.filter((r) => [r.user.username, r.user.name]
                .filter(Boolean)
                .some((s) => s.toLowerCase().includes(q.toLowerCase())))
            : rows;
        return filtered.map((r) => ({
            id: r.user.id,
            username: r.user.username,
            name: r.user.name,
            image: r.user.image,
        }));
    }
    async getMembershipsForUsername(username) {
        const user = await this.profileRepo.findOne({ where: { username } });
        if (!user)
            throw new common_1.NotFoundException('ProfileUser not found');
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
    async createOrgAsOwner(dto, requester) {
        const owner = requester.profileUserId
            ? await this.profileRepo.findOne({
                where: { id: requester.profileUserId },
            })
            : await this.profileRepo.findOne({
                where: { username: requester.username },
            });
        if (!owner)
            throw new common_1.NotFoundException('Requester profile not found');
        const exists = await this.orgRepo.findOne({ where: { slug: dto.slug } });
        if (exists)
            throw new common_1.BadRequestException('Slug already in use');
        const org = this.orgRepo.create({
            name: dto.name,
            slug: dto.slug,
            joinPolicy: dto.joinPolicy ?? organization_entity_1.JoinPolicy.INVITE_ONLY,
            allowedDomains: (dto.allowedDomains ?? []).map((d) => d.toLowerCase()),
        });
        const saved = await this.orgRepo.save(org);
        await this.memberRepo.save(this.memberRepo.create({
            organization: saved,
            user: owner,
            role: organization_member_entity_1.OrgRole.OWNER,
            isActive: true,
        }));
        return { id: saved.id, name: saved.name, slug: saved.slug };
    }
    extractDomain(email) {
        const m = String(email || '')
            .toLowerCase()
            .match(/@([^@]+)$/);
        return m?.[1] || '';
    }
    async discoverByEmail(email) {
        const domain = this.extractDomain(email);
        if (!domain)
            throw new common_1.BadRequestException('Invalid email');
        const qb = this.orgRepo.createQueryBuilder('org');
        qb.where('org.joinPolicy = :p', { p: organization_entity_1.JoinPolicy.DOMAIN }).andWhere(':domain = ANY(org.allowedDomains)', { domain });
        const rows = await qb.getMany();
        return rows.map((o) => ({ id: o.id, name: o.name, slug: o.slug }));
    }
    async joinOrgByPolicy(orgId, jwtUser) {
        const org = await this.orgRepo.findOne({ where: { id: orgId } });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        const profile = await this.profileRepo.findOne({
            where: { username: jwtUser.username },
        });
        if (!profile)
            throw new common_1.NotFoundException('ProfileUser not found');
        const already = await this.memberRepo.findOne({
            where: { organization: { id: orgId }, user: { id: profile.id } },
        });
        if (already?.isActive)
            return { ok: true };
        if (org.joinPolicy === organization_entity_1.JoinPolicy.INVITE_ONLY) {
            throw new common_1.ForbiddenException('This workspace requires an invitation');
        }
        if (org.joinPolicy === organization_entity_1.JoinPolicy.OPEN) {
            await this.memberRepo.save(this.memberRepo.create({
                organization: org,
                user: profile,
                role: organization_member_entity_1.OrgRole.MEMBER,
                isActive: true,
            }));
            return { ok: true };
        }
        if (org.joinPolicy === organization_entity_1.JoinPolicy.DOMAIN) {
            const authUser = await this.usersService.findOneByUsernameOrEmail(jwtUser.username);
            const email = authUser?.email;
            const domain = this.extractDomain(email || '');
            if (!domain)
                throw new common_1.ForbiddenException('Email not present for domain join');
            const ok = (org.allowedDomains || [])
                .map((d) => d.toLowerCase())
                .includes(domain);
            if (!ok)
                throw new common_1.ForbiddenException('Your email domain is not allowed for this workspace');
            await this.memberRepo.save(this.memberRepo.create({
                organization: org,
                user: profile,
                role: organization_member_entity_1.OrgRole.MEMBER,
                isActive: true,
            }));
            return { ok: true };
        }
        throw new common_1.ForbiddenException('Unsupported join policy');
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(1, (0, typeorm_1.InjectRepository)(organization_member_entity_1.OrganizationMember)),
    __param(2, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map