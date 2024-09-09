import { Actor } from '../actor/actor.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
export declare class Activity {
    id: number;
    type: string;
    object: any;
    target: any;
    actor: Actor;
    homeFeed: Homefeed;
    published: Date;
}
