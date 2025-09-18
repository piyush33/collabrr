// src/profileusers/profileusers.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileUser } from './profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Follower, Following } from './follower.entity';
import { FollowerDto, FollowingDto } from 'src/dto/profileuser.dto';
import { Organization } from 'src/organization/organization.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';

@Injectable()
export class ProfileusersService {
  constructor(
    @InjectRepository(ProfileUser)
    private usersRepository: Repository<ProfileUser>,
    @InjectRepository(ProfileFeedItem)
    private profileFeedRepository: Repository<ProfileFeedItem>,
    @InjectRepository(Follower)
    private followersRepository: Repository<Follower>,
    @InjectRepository(Following)
    private followingRepository: Repository<Following>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private orgMemberRepository: Repository<OrganizationMember>,
  ) {}

  // ---------- helpers ----------
  private async getUser(username: string) {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  private async getOrg(orgId: number) {
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }
  private async assertMember(orgId: number, userId: number) {
    const m = await this.orgMemberRepository.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
        isActive: true,
      },
    });
    if (!m)
      throw new ForbiddenException('User is not a member of this organization');
  }

  // ---------- profile ----------
  async findOne(orgId: number, username: string): Promise<ProfileUser> {
    const user = await this.getUser(username);
    // Optional: only expose profile if the subject is in this org.
    await this.assertMember(orgId, user.id);

    // You can choose which relations to expose; below is light.
    return this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['created', 'reposted', 'liked', 'saved'],
    });
  }

  async update(
    orgId: number,
    username: string,
    updateUserDto: Partial<ProfileUser>,
  ): Promise<ProfileUser> {
    const user = await this.getUser(username);
    await this.assertMember(orgId, user.id);

    Object.assign(user, updateUserDto);
    const savedUser = await this.usersRepository.save(user);

    return savedUser;
  }

  // Overloads
  async create(userDto: Partial<ProfileUser>): Promise<ProfileUser>;
  async create(
    orgId: number | null,
    userDto: Partial<ProfileUser>,
  ): Promise<ProfileUser>;

  // Impl
  async create(
    arg1: number | Partial<ProfileUser> | null,
    arg2?: Partial<ProfileUser>,
  ): Promise<ProfileUser> {
    // Resolve parameters
    const orgId = typeof arg1 === 'number' || arg1 === null ? arg1 : null;
    const userDto: Partial<ProfileUser> =
      typeof arg1 === 'object' && arg1 !== null
        ? arg1
        : (arg2 as Partial<ProfileUser>);

    if (!userDto?.username || !userDto?.name) {
      throw new BadRequestException('username and name are required');
    }

    // your existing logic
    const user = this.usersRepository.create(userDto);
    const savedUser = await this.usersRepository.save(user);

    // Optionally use orgId later if you want auto-join behavior
    // if (orgId) { ... }

    return savedUser;
  }

  // ---------- followers ----------
  async addFollower(
    orgId: number,
    username: string,
    followerDto: FollowerDto,
  ): Promise<FollowerDto> {
    const [org, user] = await Promise.all([
      this.getOrg(orgId),
      this.getUser(username),
    ]);
    await this.assertMember(orgId, user.id);

    const row = this.followersRepository.create({ ...followerDto });
    (row as any).organization = org; // requires org field on Follower
    row.user = user;

    await this.followersRepository.save(row);
    return this.toFollowerDto(row);
  }

  async addFollowing(
    orgId: number,
    username: string,
    followingDto: FollowingDto,
  ): Promise<FollowingDto> {
    const [org, user] = await Promise.all([
      this.getOrg(orgId),
      this.getUser(username),
    ]);
    await this.assertMember(orgId, user.id);

    const row = this.followingRepository.create({ ...followingDto });
    (row as any).organization = org; // requires org field on Following
    row.user = user;

    await this.followingRepository.save(row);
    return this.toFollowingDto(row);
  }

  async removeFollowing(
    orgId: number,
    username: string,
    followingId: number,
  ): Promise<void> {
    const [org, user] = await Promise.all([
      this.getOrg(orgId),
      this.getUser(username),
    ]);
    await this.assertMember(orgId, user.id);

    const following = await this.followingRepository.findOne({
      where: {
        id: followingId,
        user: { id: user.id },
        organization: { id: org.id } as any,
      },
    });
    if (!following) throw new NotFoundException('Following not found');

    await this.followingRepository.delete(following.id);
  }

  async removeFollower(
    orgId: number,
    username: string,
    followerId: number,
  ): Promise<void> {
    const [org, user] = await Promise.all([
      this.getOrg(orgId),
      this.getUser(username),
    ]);
    await this.assertMember(orgId, user.id);

    const follower = await this.followersRepository.findOne({
      where: {
        id: followerId,
        user: { id: user.id },
        organization: { id: org.id } as any,
      },
    });
    if (!follower) throw new NotFoundException('Follower not found');

    await this.followersRepository.delete(follower.id);
  }

  async getFollowers(orgId: number, username: string): Promise<FollowerDto[]> {
    const [org, user] = await Promise.all([
      this.getOrg(orgId),
      this.getUser(username),
    ]);
    await this.assertMember(orgId, user.id);

    const rows = await this.followersRepository.find({
      where: { user: { id: user.id }, organization: { id: org.id } as any },
      order: { id: 'DESC' },
    });
    return rows.map(this.toFollowerDto);
  }

  async getFollowing(orgId: number, username: string): Promise<FollowingDto[]> {
    const [org, user] = await Promise.all([
      this.getOrg(orgId),
      this.getUser(username),
    ]);
    await this.assertMember(orgId, user.id);

    const rows = await this.followingRepository.find({
      where: { user: { id: user.id }, organization: { id: org.id } as any },
      order: { id: 'DESC' },
    });
    return rows.map(this.toFollowingDto);
  }

  async updateFollowerStatus(
    orgId: number,
    username: string,
    followerId: number,
    isFollowing: boolean,
  ): Promise<FollowerDto> {
    const [org, user] = await Promise.all([
      this.getOrg(orgId),
      this.getUser(username),
    ]);
    await this.assertMember(orgId, user.id);

    const follower = await this.followersRepository.findOne({
      where: {
        id: followerId,
        user: { id: user.id },
        organization: { id: org.id } as any,
      },
    });
    if (!follower) throw new NotFoundException('Follower not found');

    follower.isFollowing = isFollowing;
    const updated = await this.followersRepository.save(follower);
    return this.toFollowerDto(updated);
  }

  // ---------- mapping ----------
  private toFollowerDto = (row: Follower): FollowerDto => ({
    id: row.id,
    username: row.username,
    name: row.name,
    image: row.image,
    isFollowing: row.isFollowing,
  });

  private toFollowingDto = (row: Following): FollowingDto => ({
    id: row.id,
    username: row.username,
    name: row.name,
    image: row.image,
  });
}
