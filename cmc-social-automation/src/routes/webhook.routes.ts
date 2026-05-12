import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { validateWebhookSecret, isValidProductForCampaign } from '../utils/validators.js';
import { PublicationService } from '../services/publication.service.js';

const publicationService = new PublicationService();

export async function webhookRoutes(fastify: FastifyInstance) {
  
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

  // Endpoint de Salud (Liveness Check para Coolify)
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'cmc-social-automation' };
  });
}
