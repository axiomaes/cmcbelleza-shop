import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { validateWebhookSecret, isValidProductForCampaign } from '../utils/validators.js';
import { PublicationService } from '../services/publication.service.js';
import { ProductSetupService } from '../services/product-setup.service.js';
import { WordPressService } from '../services/wordpress.service.js';
import { env } from '../config/env.js';

const publicationService = new PublicationService();
const productSetupService = new ProductSetupService();
const wordpressService = new WordPressService();

// Lógica compartida para el disparador de publicación en Redes Sociales
async function handleSocialCampaignRequest(request: FastifyRequest, reply: FastifyReply) {
  // 1. Seguridad
  if (!validateWebhookSecret(request)) {
    request.log.warn('Intento de acceso no autorizado al webhook.');
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const body = request.body as any;

  // 2. Validación de Integridad del Producto (Verifica si posee la categoría trigger)
  const validation = isValidProductForCampaign(body);

  if (!validation.valid) {
    request.log.info(`Petición descartada: ${validation.reason}`);
    // Retornamos 200 para que WooCommerce no reintente eternamente
    return reply.status(200).send({
      status: 'ignored',
      reason: validation.reason
    });
  }

  try {
    const product = validation.data!;
    request.log.info(`🚀 Iniciando publicación para producto #${product.id} con categoría trigger.`);

    // 3. Ejecutar Publicación (Instagram & Facebook)
    const result = await publicationService.processCampaign(product);
    
    // 4. Retirar la categoría del producto para prevenir ejecuciones en bucle o republicaciones
    try {
      request.log.info(`🧹 Retirando categoría de disparo '${env.SOCIAL_PUBLISH_CATEGORY_SLUG}' del producto #${product.id}...`);
      const removed = await wordpressService.removeCategoryFromProduct(product.id, env.SOCIAL_PUBLISH_CATEGORY_SLUG);
      
      if (removed) {
        request.log.info(`✅ Categoría retirada con éxito del producto #${product.id}`);
      } else {
        request.log.info(`ℹ️ La categoría ya no estaba asignada en el producto #${product.id}`);
      }
    } catch (cleanupErr: any) {
      request.log.error(cleanupErr, `🚨 Fallo no-bloqueante al intentar remover la categoría trigger del producto #${product.id}`);
      // No fallamos la petición del webhook para que WooCommerce no reintente, pero lo dejamos logueado
    }

    return reply.status(result.success ? 200 : 500).send({
      ...result,
      cleanup: 'executed'
    });

  } catch (error: any) {
    request.log.error(error, 'Error inesperado procesando campaña social');
    return reply.status(500).send({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}

export async function webhookRoutes(fastify: FastifyInstance) {
  
  // Webhook legacy (Mantener por retrocompatibilidad con workflows de n8n previos)
  fastify.post('/cmc-featured-campaign', handleSocialCampaignRequest);

  // Nuevo Webhook Nativo solicitado para integración directa de WordPress a Fastify
  fastify.post('/api/webhook/woocommerce', handleSocialCampaignRequest);

  // ⚡ Pipeline Automático Spocket -> Bilingüe
  fastify.post('/api/products/setup-bilingual', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    
    if (!body || !body.product_id || typeof body.product_id !== 'number') {
      request.log.warn(`[SetupBilingual] Petición rechazada: Body incorrecto o falta product_id.`);
      return reply.status(400).send({
        success: false,
        message: 'Falta el atributo obligatorio "product_id" (debe ser numérico).'
      });
    }

    try {
      const result = await productSetupService.setupBilingualProduct(body.product_id);
      
      return reply.status(result.success ? 200 : 500).send(result);

    } catch (error: any) {
      request.log.error(error, `Error inesperado en setup-bilingual para producto ${body.product_id}`);
      return reply.status(500).send({
        success: false,
        error: 'Error inesperado del microservicio',
        message: error.message
      });
    }
  });

  // Endpoint de Salud (Liveness Check para Coolify)
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'cmc-social-automation' };
  });
}
