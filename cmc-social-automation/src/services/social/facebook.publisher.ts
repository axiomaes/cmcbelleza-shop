import { PublishInput, PublishResult, SocialPublisher, SocialPlatform } from './social.types.js';

export class FacebookPublisher implements SocialPublisher {
  readonly platform: SocialPlatform = 'facebook';

  async publish(input: PublishInput): Promise<PublishResult> {
    console.log(`[FacebookPublisher] Simulación para ${input.productName}. No implementado.`);
    return {
      platform: this.platform,
      success: false,
      error: 'Módulo de Facebook no implementado en MVP'
    };
  }
}
