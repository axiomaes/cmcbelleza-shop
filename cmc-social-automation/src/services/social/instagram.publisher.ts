import axios from 'axios';
import { env } from '../../config/env.js';
import { PublishInput, PublishResult, SocialPublisher, SocialPlatform } from './social.types.js';
import { MetaTokenService } from '../meta-token.service.js';

export class InstagramPublisher implements SocialPublisher {
  readonly platform: SocialPlatform = 'instagram';
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';
  private readonly tokenService = new MetaTokenService();

  async publish(input: PublishInput): Promise<PublishResult> {
    try {
      console.log(`[InstagramPublisher] Iniciando publicación para producto: ${input.productName}`);

      // Obtener el Token dinámico de Base de Datos
      const token = await this.tokenService.getActiveToken();

      // 1. Crear el Contenedor de Media
      const containerResponse = await axios.post(
        `${this.baseUrl}/${env.INSTAGRAM_BUSINESS_ID}/media`,
        null,
        {
          params: {
            image_url: input.imageUrl,
            caption: input.caption,
            access_token: token
          }
        }
      );

      const creationId = containerResponse.data.id;

      if (!creationId) {
        throw new Error('No se recibió un creation_id de la Meta API.');
      }

      // Pequeña espera de seguridad para que Meta procese la imagen
      // (Recomendación de mejores prácticas, aunque suele ser asíncrono el éxito del paso 2)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. Publicar el Contenedor
      const publishResponse = await axios.post(
        `${this.baseUrl}/${env.INSTAGRAM_BUSINESS_ID}/media_publish`,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: token
          }
        }
      );

      const postId = publishResponse.data.id;

      return {
        platform: this.platform,
        success: true,
        externalPostId: postId
      };

    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido';
      console.error('[InstagramPublisher] Error fatal:', errorMessage);
      
      return {
        platform: this.platform,
        success: false,
        error: errorMessage
      };
    }
  }
}
