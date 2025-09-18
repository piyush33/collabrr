// src/organization/organization.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrganizationService } from './organization.service';
import { CreateOrgDto } from './dto/create-org.dto';

@Controller()
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get('orgs/slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.orgService.getBySlug(slug);
  }

  @Get('organizations/memberships/:username')
  async getMemberships(@Param('username') username: string) {
    return this.orgService.getMembershipsForUsername(username);
  }

  // Create org; requester becomes OWNER
  @UseGuards(JwtAuthGuard)
  @Post('orgs')
  async createOrg(@Body() dto: CreateOrgDto, @Req() req: any) {
    const profileUserId: number | undefined = req.user?.profileUserId;
    const username: string | undefined = req.user?.username;
    return this.orgService.createOrgAsOwner(dto, { profileUserId, username });
  }

  // NEW: Discover orgs by email (domain)
  @UseGuards(JwtAuthGuard)
  @Get('orgs/discover')
  async discoverByEmail(@Query('email') email: string) {
    return this.orgService.discoverByEmail(email);
  }

  // NEW: Join org (respects joinPolicy)
  @UseGuards(JwtAuthGuard)
  @Post('orgs/:orgId/join')
  async joinOrg(@Param('orgId') orgId: number, @Req() req: any) {
    return this.orgService.joinOrgByPolicy(+orgId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orgs/:orgId/members')
  async listMembers(@Param('orgId') orgId: number, @Query('q') q?: string) {
    return this.orgService.searchMembers(orgId, q); // return [{id,username,name,image}]
  }
}
