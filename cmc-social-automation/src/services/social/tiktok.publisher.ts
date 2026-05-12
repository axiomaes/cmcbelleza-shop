import { PublishInput, PublishResult, SocialPublisher, SocialPlatform } from './social.types.js';

export class TikTokPublisher implements SocialPublisher {
  readonly platform: SocialPlatform = 'tiktok';

  async publish(input: PublishInput): Promise<PublishResult> {
    console.log(`[TikTokPublisher] Simulación para ${input.productName}. No implementado.`);
    return {
      platform: this.platform,
      success: false,
      error: 'Módulo de TikTok no implementado en MVP'
    };
  }
}
