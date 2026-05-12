import { checkExistingPublication, recordPublication } from '../db/queries.js';
import { InstagramPublisher } from './social/instagram.publisher.js';
import { WCProductPayload } from '../utils/validators.js';
import { generateInstagramCaption } from '../utils/caption.js';

export class PublicationService {
  // En el MVP, instanciamos directamente Instagram. 
  // Futuro: Recibir array de Publishers en constructor para escalado fácil.
  private instagramPublisher = new InstagramPublisher();

  async processCampaign(product: WCProductPayload) {
    const platform = this.instagramPublisher.platform;

    console.log(`[PublicationService] Evaluando producto #${product.id} - ${product.name}`);

    // 1. Verificar duplicados
    const alreadyPublished = await checkExistingPublication(product.id, platform);
    if (alreadyPublished) {
      console.log(`[PublicationService] Ignorado. Ya publicado anteriormente en ${platform}`);
      return {
        success: false,
        status: 'skipped',
        message: 'Producto ya fue publicado previamente en esta plataforma.'
      };
    }

    // 2. Generar Material
    const caption = generateInstagramCaption(product.name, product.price, product.permalink);
    const imageUrl = product.images[0].src;

    // 3. Publicar
    const result = await this.instagramPublisher.publish({
      productId: product.id,
      productName: product.name,
      caption: caption,
      imageUrl: imageUrl,
      permalink: product.permalink
    });

    // 4. Guardar en Historial
    await recordPublication({
      productId: product.id,
      productName: product.name,
      platform: platform,
      status: result.success ? 'published' : 'failed',
      externalPostId: result.externalPostId,
      errorMessage: result.error
    });

    console.log(`[PublicationService] Finalizado con éxito=${result.success} para ${platform}`);

    return {
      success: result.success,
      status: result.success ? 'completed' : 'error',
      message: result.success ? 'Publicación exitosa' : result.error,
      postId: result.externalPostId
    };
  }
}
