import { Controller, Post, Param, Get, Delete } from '@nestjs/common';
import { RepostService } from './repost.service';
import { Repost } from './repost.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';

@Controller('reposts')
export class RepostController {
    constructor(private readonly repostService: RepostService) { }

    @Post('homefeed/:username/:homefeedItemId')
    async repostItem(@Param('username') username: string, @Param('homefeedItemId') homefeedItemId: number): Promise<ProfileUser> {
        return this.repostService.repostItem(username, homefeedItemId);
    }

    @Get('homefeed/:username/:homefeedItemId')
    async hasReposted(@Param('username') username: string, @Param('homefeedItemId') homefeedItemId: number): Promise<{ hasReposted: boolean }> {
        const hasReposted = await this.repostService.hasReposted(username, homefeedItemId);
        return { hasReposted };
    }

    @Delete('homefeed/:username/:homefeedItemId')
    async unRepostHomefeedItem(
        @Param('username') username: string,
        @Param('homefeedItemId') homefeedItemId: number,
    ): Promise<void> {
        console.log(`Received request to unlike homefeed item. Username: ${username}, HomefeedItemId: ${homefeedItemId}`);
        await this.repostService.unRepostItem(username, homefeedItemId);
    }
}
