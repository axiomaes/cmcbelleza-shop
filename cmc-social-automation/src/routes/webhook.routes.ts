import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { validateWebhookSecret, isValidProductForCampaign } from '../utils/validators.js';
import { PublicationService } from '../services/publication.service.js';
import { ProductSetupService } from '../services/product-setup.service.js';

const publicationService = new PublicationService();
const productSetupService = new ProductSetupService();

export async function webhookRoutes(fastify: FastifyInstance) {
  
  // Webhook nativo para Campañas de Publicación Social (FB / IG)
  fastify.post('/cmc-featured-campaign', async (request: FastifyRequest, reply: FastifyReply) => {
    
    // 1. Seguridad
    if (!validateWebhookSecret(request)) {
      request.log.warn('Intento de acceso no autorizado al webhook.');
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const body = request.body as any;

    // 2. Validación de Integridad del Producto
    const validation = isValidProductForCampaign(body);

    if (!validation.valid) {
      request.log.info(`Petición descartada: ${validation.reason}`);
      // Retornamos 200 para que WooCommerce no reintente eternamente, ya que es una condición de negocio esperada
      return reply.status(200).send({
        status: 'ignored',
        reason: validation.reason
      });
    }

    try {
      // 3. Ejecutar Flujo
      const result = await publicationService.processCampaign(validation.data!);
      
      return reply.status(result.success ? 200 : 500).send(result);

    } catch (error: any) {
      request.log.error(error, 'Error inesperado procesando campaña');
      return reply.status(500).send({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });

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
