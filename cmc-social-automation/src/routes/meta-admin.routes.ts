import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { MetaTokenService } from '../services/meta-token.service.js';

const tokenService = new MetaTokenService();

export async function metaAdminRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/meta/refresh-token
   * Endpoint seguro y manual para disparar la regeneración o validación de tokens.
   */
  fastify.post('/api/meta/refresh-token', async (request: FastifyRequest, reply: FastifyReply) => {
    
    // Validar cabecera de seguridad
    const providedKey = request.headers['x-api-key'] || request.headers['authorization'];
    
    if (!providedKey || providedKey !== env.META_TOKEN_REFRESH_API_KEY) {
      request.log.warn('[MetaAdmin] Rechazada petición de refresco por credencial inválida.');
      return reply.status(401).send({ 
        success: false, 
        error: 'Acceso no autorizado. Token de API inválido.' 
      });
    }

    const requestQuery = request.query as { force?: string };
    const forceExec = requestQuery.force === 'true';

    request.log.info(`[MetaAdmin] Ejecutando ciclo de refresco manual (Parámetro force: ${forceExec})`);

    // Invocar la lógica de refresco en el servicio
    const report = await tokenService.refreshTokenIfNeeded(forceExec);
    
    const returnCode = report.status === 'ERROR' ? 500 : 200;
    
    return reply.status(returnCode).send({
      success: report.status !== 'ERROR',
      data: report
    });
  });
}
