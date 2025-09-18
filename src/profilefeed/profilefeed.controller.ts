// src/profilefeed/profilefeed.controller.ts
import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Post,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProfileFeedService } from './profilefeed.service';
import { ProfileFeedItemDto } from '../dto/profilefeed-item.dto';
import { CreateProfileFeedItemDto } from '../dto/create-profilefeed-item.dto';
import { ProfileFeedItem } from './profilefeed-item.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/profilefeed')
export class ProfileFeedController {
  constructor(private readonly profileFeedService: ProfileFeedService) {}

  @Get()
  async findAll(
    @Param('orgId', ParseIntPipe) orgId: number,
  ): Promise<ProfileFeedItem[]> {
    return this.profileFeedService.findAll(orgId);
  }

  @Get('item/:id')
  async findOne(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProfileFeedItem> {
    return this.profileFeedService.findOne(orgId, id);
  }

  @Get(':username/:feedType')
  async findAllByFeedType(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') subjectUsername: string,
    @Param('feedType') feedType: string,
    @Req() req: any,
  ): Promise<ProfileFeedItemDto[]> {
    const viewerUsername = req.user.username;
    return this.profileFeedService.findAllByFeedType(
      Number(orgId),
      subjectUsername,
      feedType,
      viewerUsername,
    );
  }

  @Post(':username/:feedType')
  async create(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Param('feedType') feedType: string,
    @Body() createFeedItemDto: CreateProfileFeedItemDto,
  ): Promise<ProfileFeedItemDto> {
    return this.profileFeedService.create(
      orgId,
      username,
      createFeedItemDto,
      feedType,
    );
  }

  @Put('item/:id')
  async update(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeedItemDto: Partial<CreateProfileFeedItemDto>,
  ): Promise<ProfileFeedItemDto> {
    return this.profileFeedService.update(orgId, id, updateFeedItemDto);
  }

  @Delete(':username/:feedType/:id')
  async deleteProfileFeedItem(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Param('feedType') feedType: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.profileFeedService.delete(orgId, username, id, feedType);
  }
}
