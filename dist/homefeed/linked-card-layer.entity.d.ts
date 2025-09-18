import { Organization } from 'src/organization/organization.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { Homefeed } from './homefeed.entity';
import { LayerMember } from './layer-member.entity';
export declare class LinkedCardLayer {
    id: number;
    organization: Organization;
    createdBy?: ProfileUser;
    key: number;
    title?: string;
    description?: string;
    cards: Homefeed[];
    isLocked: boolean;
    members: LayerMember[];
    createdAt: Date;
}
