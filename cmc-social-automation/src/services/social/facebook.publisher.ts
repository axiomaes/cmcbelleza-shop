import axios from 'axios';
import { env } from '../../config/env.js';
import { PublishInput, PublishResult, SocialPublisher, SocialPlatform } from './social.types.js';
import { MetaTokenService } from '../meta-token.service.js';

export class FacebookPublisher implements SocialPublisher {
  readonly platform: SocialPlatform = 'facebook';
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';
  private readonly tokenService = new MetaTokenService();

  async publish(input: PublishInput): Promise<PublishResult> {
    try {
      console.log(`[FacebookPublisher] Iniciando publicación para producto: ${input.productName}`);

      // Obtener el Token dinámico de Base de Datos
      const token = await this.tokenService.getActiveToken();

      // Publicar imagen con caption directamente en el Feed de la página de Facebook
      // Endpoint: POST /{page-id}/photos
      const response = await axios.post(
        `${this.baseUrl}/${env.META_PAGE_ID}/photos`,
        {
          url: input.imageUrl,
          caption: input.caption,
          access_token: token
        }
      );

      const postId = response.data.id;

      if (!postId) {
        throw new Error('No se recibió un ID de post de la API de Facebook.');
      }

      return {
        platform: this.platform,
        success: true,
        externalPostId: postId
      };

    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido';
      console.error('[FacebookPublisher] Error fatal:', errorMessage);
      
      return {
        platform: this.platform,
        success: false,
        error: errorMessage
      };
    }
  }
}
