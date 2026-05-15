import { checkExistingPublication, recordPublication } from '../db/queries.js';
import { InstagramPublisher } from './social/instagram.publisher.js';
import { FacebookPublisher } from './social/facebook.publisher.js';
import { WCProductPayload } from '../utils/validators.js';
import { generateInstagramCaption, generateFacebookCaption } from '../utils/caption.js';
import { SocialPublisher } from './social/social.types.js';

export class PublicationService {
  // Arquitectura modular y extensible de publicadores
  private readonly publishers: SocialPublisher[] = [
    new InstagramPublisher(),
    new FacebookPublisher()
  ];

  async processCampaign(product: WCProductPayload) {
    console.log(`[PublicationService] Evaluando producto #${product.id} - ${product.name}`);

    const activeTasks: Array<{
      pub: SocialPublisher;
      caption: string;
    }> = [];

    // 1. Evaluar individualmente la publicación para cada plataforma disponible
    for (const pub of this.publishers) {
      const alreadyPublished = await checkExistingPublication(product.id, pub.platform);
      
      if (alreadyPublished) {
        console.log(`[PublicationService] Ignorado en ${pub.platform}. Ya publicado anteriormente.`);
        continue;
      }

      // 2. Generar Caption específico por plataforma
      let caption = '';
      if (pub.platform === 'instagram') {
        caption = generateInstagramCaption(product.name, product.price, product.permalink);
      } else if (pub.platform === 'facebook') {
        caption = generateFacebookCaption(product.name, product.price, product.description);
      } else {
        // Fallback seguro genérico
        caption = `${product.name} - ${product.permalink}`;
      }

      activeTasks.push({ pub, caption });
    }

    // Condición de parada temprana si ya se procesaron todas las plataformas activas
    if (activeTasks.length === 0) {
      console.log(`[PublicationService] Campaña omitida. Producto ya publicado en todas las plataformas.`);
      return {
        success: true,
        status: 'skipped',
        message: 'El producto ya ha sido publicado anteriormente en todas las redes sociales configuradas.'
      };
    }

    const imageUrl = (product.images && product.images.length > 0) ? product.images[0].src : '';

    // 3. Ejecutar Publicaciones Paralelas con Aislamiento de Fallos y Etiquetado de Plataforma
    console.log(`[PublicationService] Iniciando ejecución paralela para ${activeTasks.length} plataformas...`);

    // Mapeamos cada tarea a una promesa auto-contenida que retorna siempre su propio 'platform' y estado
    const executionPromises = activeTasks.map(async ({ pub, caption }) => {
      try {
        const res = await pub.publish({
          productId: product.id,
          productName: product.name,
          caption: caption,
          imageUrl: imageUrl,
          permalink: product.permalink
        });
        
        return {
          platform: pub.platform,
          success: res.success,
          externalPostId: res.externalPostId,
          error: res.error
        };
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        return {
          platform: pub.platform,
          success: false,
          error: `Excepción en ejecutor: ${errorMsg}`
        };
      }
    });

    // Promise.all es 100% seguro aquí porque cada promesa en el array maneja internamente su try/catch
    const results = await Promise.all(executionPromises);

    // 4. Recopilar, registrar en base de datos e informar
    const processedSummary: any[] = [];

    for (const res of results) {
      // Guardar en Historial de forma individual (relacional por filas en registro_social_media)
      await recordPublication({
        productId: product.id,
        productName: product.name,
        platform: res.platform,
        status: res.success ? 'published' : 'failed',
        externalPostId: res.externalPostId,
        errorMessage: res.error
      });

      processedSummary.push({
        platform: res.platform,
        success: res.success,
        postId: res.externalPostId,
        error: res.error
      });

      if (res.success) {
        console.log(`[PublicationService] ${res.platform.toUpperCase()}: Publicado con éxito ✅ (ID: ${res.externalPostId})`);
      } else {
        console.error(`[PublicationService] ${res.platform.toUpperCase()}: Error capturado ❌ -> ${res.error}`);
      }
    }

    // Evaluamos el estado general de la campaña (éxito si al menos una publicación funcionó)
    const overallSuccess = processedSummary.some(s => s.success === true);

    return {
      success: true, // El proceso de orquestación se completó sin bloquearse
      status: 'completed',
      hasAnySuccess: overallSuccess,
      platformsProcessed: processedSummary
    };
  }
}
