import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

// Inicializar el pool de conexiones
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Configuraciones recomendadas para producción ligera
  max: 5, // Máximo de conexiones concurrentes bajo, ideal para microservicio simple
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Manejador global de errores en el pool para evitar crash inesperado
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // Logging ligero en desarrollo
  if (env.NODE_ENV === 'development') {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }
  return res;
}
