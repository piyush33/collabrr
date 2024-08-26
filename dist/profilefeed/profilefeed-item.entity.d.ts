import { ProfileUser } from '../profileusers/profileuser.entity';
import { Like } from '../like/like.entity';
import { Repost } from '../repost/repost.entity';
import { Save } from '../save/save.entity';
export declare class ProfileFeedItem {
    id: number;
    username: string;
    title: string;
    description: string;
    image: string;
    picture: string;
    text: string;
    parent: string;
    weblink: string;
    userCreated: ProfileUser;
    userReposted: ProfileUser;
    userLiked: ProfileUser;
    userSaved: ProfileUser;
    likes: Like[];
    reposts: Repost[];
    saves: Save[];
}
