import { Controller, Post, Param, Get, Delete } from '@nestjs/common';
import { LikeService } from './like.service';
import { Like } from './like.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';

@Controller('likes')
export class LikeController {
    constructor(private readonly likeService: LikeService) { }

    @Post('homefeed/:username/:homefeedItemId')
    async likeItem(@Param('username') username: string, @Param('homefeedItemId') homefeedItemId: number): Promise<ProfileUser> {
        return this.likeService.likeItem(username, homefeedItemId);
    }

    @Get('homefeed/:username/:homefeedItemId')
    async hasLiked(@Param('username') username: string, @Param('homefeedItemId') homefeedItemId: number): Promise<{ hasLiked: boolean }> {
        const hasLiked = await this.likeService.hasLiked(username, homefeedItemId);
        return { hasLiked };
    }

    @Delete('homefeed/:username/:homefeedItemId')
    async unlikeHomefeedItem(
        @Param('username') username: string,
        @Param('homefeedItemId') homefeedItemId: number,
    ): Promise<void> {
        console.log(`Received request to unlike homefeed item. Username: ${username}, HomefeedItemId: ${homefeedItemId}`);
        await this.likeService.unlikeItem(username, homefeedItemId);
    }
}
