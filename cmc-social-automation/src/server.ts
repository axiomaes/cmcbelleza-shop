import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import { env } from './config/env.js';
import { pool } from './db/index.js';
import { initDatabase as setupSchema } from './db/queries.js';
import { webhookRoutes } from './routes/webhook.routes.js';

// Crear servidor con Logger nativo Pino optimizado para producción
const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info'
  }
});

// Plugins de seguridad básica
await fastify.register(helmet);

// Registrar Rutas
await fastify.register(webhookRoutes);

const start = async () => {
  try {
    // 1. Asegurar esquema de base de datos
    fastify.log.info('Conectando y verificando esquema de base de datos...');
    await setupSchema();
    fastify.log.info('✅ Base de datos lista.');

    // 2. Iniciar escucha
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
