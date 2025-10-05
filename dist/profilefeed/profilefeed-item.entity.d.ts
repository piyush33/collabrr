import { ProfileUser } from '../profileusers/profileuser.entity';
import { Like } from '../like/like.entity';
import { Repost } from '../repost/repost.entity';
import { Save } from '../save/save.entity';
import { Organization } from 'src/organization/organization.entity';
import { Team } from 'src/organization/team.entity';
import { Homefeed } from 'src/homefeed/homefeed.entity';
import { Phase, RoleType } from 'src/common/enums/content-metadata.enum';
declare enum Visibility {
    ORG = "org",
    LAYER = "layer",
    PRIVATE = "private",
    TEAM = "team"
}
export declare class ProfileFeedItem {
    id: number;
    username: string;
    title: string;
    description: string;
    image: string;
    picture: string;
    text: string;
    layerKey: number;
    category: string;
    weblink: string;
    lock: boolean;
    privacy: boolean;
    visibility: Visibility;
    team?: Team;
    organization: Organization;
    userCreated: ProfileUser;
    userReposted: ProfileUser;
    userLiked: ProfileUser;
    userSaved: ProfileUser;
    likes: Like[];
    reposts: Repost[];
    saves: Save[];
    homefeedItem?: Homefeed;
    phase?: Phase | null;
    roleTypes: RoleType[];
}
export {};
