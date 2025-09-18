// src/profileusers/profileusers.controller.ts
import {
  Controller,
  Get,
  Param,
  Put,
  Post,
  Body,
  Delete,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfileusersService } from './profileusers.service';
import { ProfileUser } from './profileuser.entity';
import { FollowerDto, FollowingDto } from 'src/dto/profileuser.dto';

// @UseGuards(JwtAuthGuard)  // when you wire auth
@Controller('orgs/:orgId/profileusers')
export class ProfileusersController {
  constructor(private readonly usersService: ProfileusersService) {}

  @Get(':username')
  findOne(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
  ): Promise<ProfileUser> {
    return this.usersService.findOne(orgId, username);
  }

  @Post()
  create(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() createUserDto: Partial<ProfileUser>,
  ): Promise<ProfileUser> {
    // Org join is usually handled elsewhere (invites). We still accept orgId for symmetry.
    return this.usersService.create(orgId, createUserDto);
  }

  @Put(':username')
  update(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Body() updateUserDto: Partial<ProfileUser>,
  ): Promise<ProfileUser> {
    return this.usersService.update(orgId, username, updateUserDto);
  }

  // ----- Followers / Following (scoped to :orgId) -----

  @Post(':username/followers')
  async addFollower(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Body() followerDto: FollowerDto,
  ): Promise<FollowerDto> {
    return this.usersService.addFollower(orgId, username, followerDto);
  }

  @Post(':username/following')
  async addFollowing(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Body() followingDto: FollowingDto,
  ): Promise<FollowingDto> {
    return this.usersService.addFollowing(orgId, username, followingDto);
  }

  @Get(':username/followers')
  async getFollowers(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
  ): Promise<FollowerDto[]> {
    return this.usersService.getFollowers(orgId, username);
  }

  @Get(':username/following')
  async getFollowing(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
  ): Promise<FollowingDto[]> {
    return this.usersService.getFollowing(orgId, username);
  }

  @Delete(':username/following/:followingId')
  async removeFollowing(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Param('followingId', ParseIntPipe) followingId: number,
  ): Promise<void> {
    return this.usersService.removeFollowing(orgId, username, followingId);
  }

  @Delete(':username/followers/:followerId')
  async removeFollower(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Param('followerId', ParseIntPipe) followerId: number,
  ): Promise<void> {
    return this.usersService.removeFollower(orgId, username, followerId);
  }

  @Patch(':username/followers/:followerId')
  async updateFollowerStatus(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Param('followerId', ParseIntPipe) followerId: number,
    @Body('isFollowing') isFollowing: boolean,
  ): Promise<FollowerDto> {
    return this.usersService.updateFollowerStatus(
      orgId,
      username,
      followerId,
      isFollowing,
    );
  }
}
