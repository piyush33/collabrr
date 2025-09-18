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
exports.ProfileusersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profileuser_entity_1 = require("./profileuser.entity");
const profilefeed_item_entity_1 = require("../profilefeed/profilefeed-item.entity");
const follower_entity_1 = require("./follower.entity");
const organization_entity_1 = require("../organization/organization.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
let ProfileusersService = class ProfileusersService {
    constructor(usersRepository, profileFeedRepository, followersRepository, followingRepository, orgRepository, orgMemberRepository) {
        this.usersRepository = usersRepository;
        this.profileFeedRepository = profileFeedRepository;
        this.followersRepository = followersRepository;
        this.followingRepository = followingRepository;
        this.orgRepository = orgRepository;
        this.orgMemberRepository = orgMemberRepository;
        this.toFollowerDto = (row) => ({
            id: row.id,
            username: row.username,
            name: row.name,
            image: row.image,
            isFollowing: row.isFollowing,
        });
        this.toFollowingDto = (row) => ({
            id: row.id,
            username: row.username,
            name: row.name,
            image: row.image,
        });
    }
    async getUser(username) {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async getOrg(orgId) {
        const org = await this.orgRepository.findOne({ where: { id: orgId } });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        return org;
    }
    async assertMember(orgId, userId) {
        const m = await this.orgMemberRepository.findOne({
            where: {
                organization: { id: orgId },
                user: { id: userId },
                isActive: true,
            },
        });
        if (!m)
            throw new common_1.ForbiddenException('User is not a member of this organization');
    }
    async findOne(orgId, username) {
        const user = await this.getUser(username);
        await this.assertMember(orgId, user.id);
        return this.usersRepository.findOne({
            where: { id: user.id },
            relations: ['created', 'reposted', 'liked', 'saved'],
        });
    }
    async update(orgId, username, updateUserDto) {
        const user = await this.getUser(username);
        await this.assertMember(orgId, user.id);
        Object.assign(user, updateUserDto);
        const savedUser = await this.usersRepository.save(user);
        return savedUser;
    }
    async create(arg1, arg2) {
        const orgId = typeof arg1 === 'number' || arg1 === null ? arg1 : null;
        const userDto = typeof arg1 === 'object' && arg1 !== null
            ? arg1
            : arg2;
        if (!userDto?.username || !userDto?.name) {
            throw new common_1.BadRequestException('username and name are required');
        }
        const user = this.usersRepository.create(userDto);
        const savedUser = await this.usersRepository.save(user);
        return savedUser;
    }
    async addFollower(orgId, username, followerDto) {
        const [org, user] = await Promise.all([
            this.getOrg(orgId),
            this.getUser(username),
        ]);
        await this.assertMember(orgId, user.id);
        const row = this.followersRepository.create({ ...followerDto });
        row.organization = org;
        row.user = user;
        await this.followersRepository.save(row);
        return this.toFollowerDto(row);
    }
    async addFollowing(orgId, username, followingDto) {
        const [org, user] = await Promise.all([
            this.getOrg(orgId),
            this.getUser(username),
        ]);
        await this.assertMember(orgId, user.id);
        const row = this.followingRepository.create({ ...followingDto });
        row.organization = org;
        row.user = user;
        await this.followingRepository.save(row);
        return this.toFollowingDto(row);
    }
    async removeFollowing(orgId, username, followingId) {
        const [org, user] = await Promise.all([
            this.getOrg(orgId),
            this.getUser(username),
        ]);
        await this.assertMember(orgId, user.id);
        const following = await this.followingRepository.findOne({
            where: {
                id: followingId,
                user: { id: user.id },
                organization: { id: org.id },
            },
        });
        if (!following)
            throw new common_1.NotFoundException('Following not found');
        await this.followingRepository.delete(following.id);
    }
    async removeFollower(orgId, username, followerId) {
        const [org, user] = await Promise.all([
            this.getOrg(orgId),
            this.getUser(username),
        ]);
        await this.assertMember(orgId, user.id);
        const follower = await this.followersRepository.findOne({
            where: {
                id: followerId,
                user: { id: user.id },
                organization: { id: org.id },
            },
        });
        if (!follower)
            throw new common_1.NotFoundException('Follower not found');
        await this.followersRepository.delete(follower.id);
    }
    async getFollowers(orgId, username) {
        const [org, user] = await Promise.all([
            this.getOrg(orgId),
            this.getUser(username),
        ]);
        await this.assertMember(orgId, user.id);
        const rows = await this.followersRepository.find({
            where: { user: { id: user.id }, organization: { id: org.id } },
            order: { id: 'DESC' },
        });
        return rows.map(this.toFollowerDto);
    }
    async getFollowing(orgId, username) {
        const [org, user] = await Promise.all([
            this.getOrg(orgId),
            this.getUser(username),
        ]);
        await this.assertMember(orgId, user.id);
        const rows = await this.followingRepository.find({
            where: { user: { id: user.id }, organization: { id: org.id } },
            order: { id: 'DESC' },
        });
        return rows.map(this.toFollowingDto);
    }
    async updateFollowerStatus(orgId, username, followerId, isFollowing) {
        const [org, user] = await Promise.all([
            this.getOrg(orgId),
            this.getUser(username),
        ]);
        await this.assertMember(orgId, user.id);
        const follower = await this.followersRepository.findOne({
            where: {
                id: followerId,
                user: { id: user.id },
                organization: { id: org.id },
            },
        });
        if (!follower)
            throw new common_1.NotFoundException('Follower not found');
        follower.isFollowing = isFollowing;
        const updated = await this.followersRepository.save(follower);
        return this.toFollowerDto(updated);
    }
};
exports.ProfileusersService = ProfileusersService;
exports.ProfileusersService = ProfileusersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(1, (0, typeorm_1.InjectRepository)(profilefeed_item_entity_1.ProfileFeedItem)),
    __param(2, (0, typeorm_1.InjectRepository)(follower_entity_1.Follower)),
    __param(3, (0, typeorm_1.InjectRepository)(follower_entity_1.Following)),
    __param(4, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(5, (0, typeorm_1.InjectRepository)(organization_member_entity_1.OrganizationMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProfileusersService);
//# sourceMappingURL=profileusers.service.js.map