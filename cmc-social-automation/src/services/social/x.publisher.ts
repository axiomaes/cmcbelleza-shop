import { PublishInput, PublishResult, SocialPublisher, SocialPlatform } from './social.types.js';

export class XPublisher implements SocialPublisher {
  readonly platform: SocialPlatform = 'x';

  async publish(input: PublishInput): Promise<PublishResult> {
    console.log(`[XPublisher] Simulación para ${input.productName}. No implementado.`);
    return {
      platform: this.platform,
      success: false,
      error: 'Módulo de X no implementado en MVP'
    };
  }
}
