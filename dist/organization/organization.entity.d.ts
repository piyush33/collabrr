import { Homefeed } from 'src/homefeed/homefeed.entity';
import { OrganizationMember } from './organization-member.entity';
import { ProfileFeedItem } from 'src/profilefeed/profilefeed-item.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';
export declare enum JoinPolicy {
    INVITE_ONLY = "invite_only",
    DOMAIN = "domain",
    OPEN = "open"
}
export declare class Organization {
    id: number;
    slug: string;
    name: string;
    joinPolicy: JoinPolicy;
    allowedDomains: string[];
    members: OrganizationMember[];
    posts: Homefeed[];
    profilePosts: ProfileFeedItem[];
    layers: LinkedCardLayer[];
}
