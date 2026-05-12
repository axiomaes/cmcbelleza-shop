export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'x';

export interface PublishInput {
  productId: number | string;
  productName: string;
  caption: string;
  imageUrl: string;
  permalink: string;
}

export interface PublishResult {
  platform: SocialPlatform;
  success: boolean;
  externalPostId?: string;
  error?: string;
}

export interface SocialPublisher {
  readonly platform: SocialPlatform;
  publish(input: PublishInput): Promise<PublishResult>;
}
