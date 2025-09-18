import { Repository } from 'typeorm';
import { Homefeed } from './homefeed.entity';
import { UserInteraction } from './user-interaction.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { TeamMember } from 'src/organization/team-member.entity';
import { TeamCardAccess } from 'src/organization/team-card-access.entity';
import { Team } from 'src/organization/team.entity';
import { LinkedCardLayer } from './linked-card-layer.entity';
import { LayerMember } from './layer-member.entity';
import { Organization } from 'src/organization/organization.entity';
import { CreateHomefeedDto } from './dto/create-homefeed.dto';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { NotificationService } from 'src/notification/notification.service';
export declare class HomefeedService {
    private readonly homefeedRepository;
    private readonly userInteractionRepository;
    private readonly profileUserRepository;
    private readonly orgMemberRepo;
    private readonly teamMemberRepo;
    private readonly teamCardAccessRepo;
    private readonly teamRepo;
    private readonly layerRepo;
    private readonly layerMemberRepo;
    private readonly orgRepo;
    private readonly notifications;
    constructor(homefeedRepository: Repository<Homefeed>, userInteractionRepository: Repository<UserInteraction>, profileUserRepository: Repository<ProfileUser>, orgMemberRepo: Repository<OrganizationMember>, teamMemberRepo: Repository<TeamMember>, teamCardAccessRepo: Repository<TeamCardAccess>, teamRepo: Repository<Team>, layerRepo: Repository<LinkedCardLayer>, layerMemberRepo: Repository<LayerMember>, orgRepo: Repository<Organization>, notifications: NotificationService);
    private getOrgMembership;
    private restrictGuestToMyLayers;
    private loadUser;
    private assertOrgMembership;
    private resolveOrUpsertLayer;
    private applyVisibilityClause;
    private lockLayerAndEnsureMembers;
    findAll(activeOrgId: number, username: string): Promise<Homefeed[]>;
    findOne(activeOrgId: number, id: number, username: string): Promise<Homefeed>;
    create(orgId: number, username: string, dto: CreateHomefeedDto, opts?: {
        allowedMemberIds?: number[];
    }): Promise<Homefeed>;
    update(activeOrgId: number, id: number, username: string, patch: Partial<Homefeed>): Promise<void>;
    remove(activeOrgId: number, id: number, username: string): Promise<void>;
    getHomeFeed(activeOrgId: number, username: string, limit?: number, opts?: {
        layerIds?: number[];
        layerKeys?: string[];
        onlyLayered?: boolean;
    }): Promise<Homefeed[]>;
    private fetchRandomItemsBasedOnUserPreferences;
    getLayerFeed(activeOrgId: number, username: string, layerId: number, limit?: number): Promise<Homefeed[]>;
}
