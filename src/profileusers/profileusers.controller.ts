import { Controller, Get, Param, Put, Post, Body, Delete, Patch } from '@nestjs/common';
import { ProfileusersService } from './profileusers.service';
import { ProfileUser } from './profileuser.entity';
import { FollowerDto, FollowingDto } from 'src/dto/profileuser.dto';


@Controller('profileusers')
export class ProfileusersController {
    constructor(private readonly usersService: ProfileusersService) { }

    @Get(':username')
    findOne(@Param('username') username: string): Promise<ProfileUser> {
        return this.usersService.findOne(username);
    }

    @Post()
    create(@Body() createUserDto: Partial<ProfileUser>): Promise<ProfileUser> {
        return this.usersService.create(createUserDto);
    }

    @Put(':username')
    update(@Param('username') username: string, @Body() updateUserDto: Partial<ProfileUser>): Promise<ProfileUser> {
        return this.usersService.update(username, updateUserDto);
    }

    @Post(':username/followers')
    async addFollower(@Param('username') username: string, @Body() followerDto: FollowerDto): Promise<FollowerDto> {
        return this.usersService.addFollower(username, followerDto);
    }

    @Post(':username/following')
    async addFollowing(@Param('username') username: string, @Body() followingDto: FollowingDto): Promise<FollowingDto> {
        return this.usersService.addFollowing(username, followingDto);
    }
    @Get(':username/followers')
    async getFollowers(@Param('username') username: string): Promise<FollowerDto[]> {
        return this.usersService.getFollowers(username);
    }

    @Get(':username/following')
    async getFollowing(@Param('username') username: string): Promise<FollowingDto[]> {
        return this.usersService.getFollowing(username);
    }
    @Delete(':username/following/:followingId')
    async removeFollowing(
        @Param('username') username: string,
        @Param('followingId') followingId: number
    ): Promise<void> {
        return this.usersService.removeFollowing(username, followingId);
    }
    @Delete(':username/followers/:followerId')
    async removeFollower(
        @Param('username') username: string,
        @Param('followerId') followerId: number
    ): Promise<void> {
        return this.usersService.removeFollower(username, followerId);
    }

    @Patch(':username/followers/:followerId')
    async updateFollowerStatus(
        @Param('username') username: string,
        @Param('followerId') followerId: number,
        @Body('isFollowing') isFollowing: boolean
    ): Promise<FollowerDto> {
        return this.usersService.updateFollowerStatus(username, followerId, isFollowing);
    }
}
