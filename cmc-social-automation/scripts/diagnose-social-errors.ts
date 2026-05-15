import { query } from '../src/db/index.js';

async function diagnose() {
  console.log('\n============================================================');
  console.log('🔍 INICIANDO AUDITORÍA DEL SISTEMA DE PUBLICACIÓN AUTOMÁTICA 🔍');
  console.log('============================================================\n');

  // 1. Comprobación de tokens de acceso de Meta (Facebook/Instagram)
  console.log('--- [AUDITORÍA 1] Estado de Tokens de Autenticación (meta_tokens) ---');
  try {
    const tokenResult = await query(
      `SELECT id, token_type, expires_at, page_id, status, created_at FROM meta_tokens ORDER BY created_at DESC LIMIT 5`
    );

    if (tokenResult.rowCount === 0) {
      console.log('⚠️ ADVERTENCIA CRÍTICA: No se encontraron registros en la tabla "meta_tokens".');
      console.log('👉 El sistema puede estar usando variables de entorno de respaldo si existen en .env.');
    } else {
      console.log(`✅ Encontrados ${tokenResult.rowCount} registros de tokens.`);
      console.table(tokenResult.rows);
      
      const activeToken = tokenResult.rows.find((r: any) => r.status === 'ACTIVE');
      if (!activeToken) {
        console.log('⚠️ ALERTA: ¡No hay ningún token activo (STATUS = "ACTIVE") en la base de datos!');
      } else {
        console.log(`ℹ️ Token activo actual: ID ${activeToken.id} de tipo "${activeToken.token_type}".`);
        if (activeToken.expires_at && new Date(activeToken.expires_at) < new Date()) {
          console.log('🚨 ERROR CRÍTICO: ¡El token marcado como ACTIVO ya ha EXPIRADO!');
        }
      }
    }
  } catch (error: any) {
    console.error('❌ ERROR al consultar la tabla meta_tokens:', error.message);
  }

  console.log('\n--- [AUDITORÍA 2] Historial Reciente de Publicaciones (registro_social_media) ---');
  try {
    const logsResult = await query(
      `SELECT product_id, LEFT(product_name, 30) as product, platform, status, LEFT(error_message, 100) as error, created_at 
       FROM registro_social_media 
       ORDER BY created_at DESC 
       LIMIT 15`
    );

    if (logsResult.rowCount === 0) {
      console.log('ℹ️ No se han registrado intentos de publicación aún en esta base de datos.');
    } else {
      console.log(`✅ Encontrados ${logsResult.rowCount} intentos de publicación recientes:\n`);
      console.table(logsResult.rows);
      
      const failures = logsResult.rows.filter((r: any) => r.status === 'failed');
      if (failures.length > 0) {
        console.log('\n🛑 ANÁLISIS DETALLADO DE ERRORES DETECTADOS:');
        const errorCounts = new Map();
        
        failures.forEach((f: any, idx: number) => {
          console.log(`\n❌ Fallo #${idx + 1} | Producto: "${f.product}" | Plataforma: ${f.platform.toUpperCase()}`);
          console.log(`👉 Error: ${f.error || 'Desconocido/Sin mensaje'}`);
        });
      } else {
        console.log('\n🎉 ¡No se detectaron registros fallidos en los últimos 15 intentos!');
      }
    }
  } catch (error: any) {
    console.error('❌ ERROR al consultar la tabla registro_social_media:', error.message);
  }

  console.log('\n============================================================');
  console.log('🏁 FIN DE LA AUDITORÍA DEL SISTEMA SOCIAL 🏁');
  console.log('============================================================\n');
  
  process.exit(0);
}

diagnose().catch(error => {
  console.error('Catastrophic diagnostic failure:', error);
  process.exit(1);
});
