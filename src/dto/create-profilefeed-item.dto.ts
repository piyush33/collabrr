export class CreateProfileFeedItemDto {
  // existing fields...
  id?: number;
  username?: string;
  title?: string;
  description?: string;
  image?: string;
  picture?: string;
  text?: string;
  layerKey?: number;

  /** When feedType is liked|reposted|saved, point to an existing item */
  feedItemId?: number;
}
