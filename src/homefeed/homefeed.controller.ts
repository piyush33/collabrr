import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { HomefeedService } from './homefeed.service';
import { Homefeed } from './homefeed.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

//@UseGuards(JwtAuthGuard)
@Controller('homefeed')
export class HomefeedController {
    constructor(private readonly homefeedService: HomefeedService) { }

    @Get()
    findAll(): Promise<Homefeed[]> {
        return this.homefeedService.findAll();
    }

    @Get(':username')
    getHomeFeed(@Param('username') username: string): Promise<Homefeed[]> {
        return this.homefeedService.getHomeFeed(username);
    }

    @Get(':id')
    findOne(@Param('id') id: number): Promise<Homefeed> {
        return this.homefeedService.findOne(id);
    }

    @Post(':username')
    create(@Param('username') username: string, @Body() homefeed: Homefeed): Promise<Homefeed> {
        return this.homefeedService.create(homefeed, username);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() homefeed: Homefeed): Promise<void> {
        return this.homefeedService.update(id, homefeed);
    }

    @Delete(':id')
    remove(@Param('id') id: number): Promise<void> {
        return this.homefeedService.remove(id);
    }


}
