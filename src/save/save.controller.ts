import { Controller, Post, Param, Get, Delete } from '@nestjs/common';
import { SaveService } from './save.service';
import { Save } from './save.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';

@Controller('saves')
export class SaveController {
    constructor(private readonly saveService: SaveService) { }

    @Post('homefeed/:username/:homefeedItemId')
    async saveItem(@Param('username') username: string, @Param('homefeedItemId') homefeedItemId: number): Promise<ProfileUser> {
        return this.saveService.saveItem(username, homefeedItemId);
    }

    @Get('homefeed/:username/:homefeedItemId')
    async hasSaved(@Param('username') username: string, @Param('homefeedItemId') homefeedItemId: number): Promise<{ hasSaved: boolean }> {
        const hasSaved = await this.saveService.hasSaved(username, homefeedItemId);
        return { hasSaved };
    }

    @Delete('homefeed/:username/:homefeedItemId')
    async unSaveHomefeedItem(
        @Param('username') username: string,
        @Param('homefeedItemId') homefeedItemId: number,
    ): Promise<void> {
        console.log(`Received request to unlike homefeed item. Username: ${username}, HomefeedItemId: ${homefeedItemId}`);
        await this.saveService.unSaveItem(username, homefeedItemId);
    }
}
