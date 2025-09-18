import { Visibility } from '../homefeed.entity';
export declare class CreateHomefeedDto {
    title?: string;
    description?: string;
    image?: string;
    picture?: string;
    text?: string;
    weblink?: string;
    category?: string;
    visibility?: Visibility;
    layerId?: number;
    layerKey?: number;
    teamId?: number;
    allowedMemberIds?: number[];
    lock?: boolean;
}
