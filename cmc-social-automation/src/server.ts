import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import { env } from './config/env.js';
import { pool } from './db/index.js';
import { initDatabase as setupSchema } from './db/queries.js';
import { webhookRoutes } from './routes/webhook.routes.js';
import { metaAdminRoutes } from './routes/meta-admin.routes.js';
import { MetaTokenService } from './services/meta-token.service.js';

// Crear servidor con Logger nativo Pino optimizado para producción
const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info'
  }
});

const tokenService = new MetaTokenService();

// Plugins de seguridad básica
await fastify.register(helmet);

// Registrar Rutas
await fastify.register(webhookRoutes);
await fastify.register(metaAdminRoutes);

const start = async () => {
  try {
    // 1. Asegurar esquema de base de datos
    fastify.log.info('Conectando y verificando esquema de base de datos...');
    await setupSchema();
    fastify.log.info('✅ Base de datos lista.');

    // 2. Lógica de Token Meta al Arranque (Tarea 4: Log en arranque y asegurar permanencia)
    fastify.log.info('Inicializando comprobación de Token Meta...');
    try {
      const status = await tokenService.refreshTokenIfNeeded();
      fastify.log.info(`✅ Diagnóstico inicial de Token completado: [${status.status}] ${status.message}`);
    } catch (tokenErr: any) {
      // Log de error obligatorio, no crashear ejecución
      fastify.log.error(`❌ Error NO CRÍTICO durante el aprovisionamiento del token: ${tokenErr.message}`);
    }

    // 3. Tarea 4: Configurar daemon daemon de refresco cada 24 horas (Cron job interno)
    const intervalMs = 24 * 60 * 60 * 1000; // 24 horas exactas
    setInterval(async () => {
      fastify.log.info('⏰ [CRON DE FILS DE TIEMPO] Iniciando verificación automática diaria de expiración de Token Meta.');
      const report = await tokenService.refreshTokenIfNeeded();
      fastify.log.info(`⏰ [CRON COMPLETADO] Resultado: [${report.status}] ${report.message}`);
    }, intervalMs);

    fastify.log.info('✅ Cron Job de refresco Meta activo (ejecución cada 24h).');

    // 4. Iniciar escucha
    const host = env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    await fastify.listen({ port: env.PORT, host });
    
    fastify.log.info(`🚀 Servidor cmc-social-automation corriendo en el puerto ${env.PORT}`);

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Manejo de cierre ordenado (Graceful Shutdown)
const closeGracefully = async (signal: string) => {
  fastify.log.info(`Recibido ${signal}. Cerrando servidor...`);
  await fastify.close();
  await pool.end();
  fastify.log.info('Conexiones cerradas. Saliendo.');
  process.exit(0);
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

start();
