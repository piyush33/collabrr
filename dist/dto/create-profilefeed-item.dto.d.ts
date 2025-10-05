import { Phase, RoleType } from 'src/common/enums/content-metadata.enum';
export declare class CreateProfileFeedItemDto {
    id?: number;
    username?: string;
    title?: string;
    description?: string;
    image?: string;
    picture?: string;
    text?: string;
    layerKey?: number;
    feedItemId?: number;
    homefeedItemId?: number;
    phase?: Phase | null;
    roleTypes: RoleType[];
}
