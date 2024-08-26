import { Controller, Get, Param, Put, Body, Post, UseGuards, Delete } from '@nestjs/common';
import { ProfileFeedService } from './profilefeed.service';
import { ProfileFeedItemDto } from '../dto/profilefeed-item.dto';
import { CreateProfileFeedItemDto } from '../dto/create-profilefeed-item.dto';
import { ProfileFeedItem } from './profilefeed-item.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

//@UseGuards(JwtAuthGuard)
@Controller('profilefeed')
export class ProfileFeedController {
    constructor(private readonly profileFeedService: ProfileFeedService) { }

    @Get()
    async findAll(): Promise<ProfileFeedItem[]> {
        return this.profileFeedService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<ProfileFeedItem> {
        return this.profileFeedService.findOne(id);
    }

    @Get(':username/:feedType')
    async findAllByFeedType(@Param('username') username: string, @Param('feedType') feedType: string): Promise<ProfileFeedItemDto[]> {
        return this.profileFeedService.findAllByFeedType(username, feedType);
    }

    @Post(':username/:feedType')
    async create(
        @Param('username') username: string,
        @Param('feedType') feedType: string,
        @Body() createFeedItemDto: CreateProfileFeedItemDto,
    ): Promise<ProfileFeedItemDto> {
        return this.profileFeedService.create(username, createFeedItemDto, feedType);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateFeedItemDto: Partial<CreateProfileFeedItemDto>): Promise<ProfileFeedItemDto> {
        return this.profileFeedService.update(id, updateFeedItemDto);
    }

    @Delete(':username/:feedType/:id')
    async deleteProfileFeedItem(
        @Param('username') username: string,
        @Param('feedType') feedType: string,
        @Param('id') id: number
    ): Promise<void> {
        await this.profileFeedService.delete(username, id, feedType);
    }
}
