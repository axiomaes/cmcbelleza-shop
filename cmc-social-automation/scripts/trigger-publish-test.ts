import { PublicationService } from '../src/services/publication.service.js';
import { WCProductPayload } from '../src/utils/validators.js';
import { query } from '../src/db/index.js';

async function main() {
  console.log('=== INICIANDO TEST DE PUBLICACIÓN SOCIAL AUTOMÁTICA (IG & FB) ===\n');

  // 1. Verificar Conectividad de PostgreSQL
  console.log('--- COMPROBACIÓN 1: Base de Datos ---');
  try {
    const dbTest = await query('SELECT NOW()');
    console.log(`✅ PostgreSQL conectado con éxito. Timestamp: ${dbTest.rows[0].now}`);
  } catch (err: any) {
    console.warn(`⚠️ ADVERTENCIA: No se pudo conectar a PostgreSQL. Detalles: ${err.message}`);
    console.warn(`👉 Si estás en local sin DB, el servicio usará el fallback de token en ENV y no podrá guardar historial.`);
  }

  // 2. Crear Producto Ficticio Destacado para Prueba
  const testProductId = 999000 + Math.floor(Math.random() * 999); // ID aleatorio para evitar colisión de deduplicación si se re-ejecuta
  
  const dummyProduct: WCProductPayload = {
    id: testProductId,
    name: `Peluca Premium de Prueba #${testProductId}`,
    price: '299.99',
    regular_price: '349.99',
    permalink: 'https://cmcbelleza.shop/en/tienda',
    featured: true,
    description: '<p>Esta es una descripción de prueba con <strong>HTML en negrita</strong> para comprobar la sanitización nativa y el límite estricto de caracteres en el caption final de Facebook.</p>',
    images: [
      { 
        src: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80', // Imagen pública real de Unsplash para que Meta no falle procesándola
        id: 1
      }
    ]
  };

  console.log(`\n--- COMPROBACIÓN 2: Orquestando Campaña para Producto #${dummyProduct.id} ---`);
  console.log(`Nombre: "${dummyProduct.name}"`);
  console.log(`Imagen: ${dummyProduct.images[0].src}`);
  
  const service = new PublicationService();
  
  try {
    const result = await service.processCampaign(dummyProduct);
    
    console.log('\n--- RESULTADO DE LA ORQUESTACIÓN ---');
    console.log(JSON.stringify(result, null, 2));

    if (result.status === 'completed') {
      console.log('\n🎉 ¡Orquestador ejecutado! Revisa los logs superiores para confirmar los IDs de publicación reales.');
      
      // 3. Si hubo éxito y la base de datos está disponible, volcar la fila guardada
      try {
        console.log('\n--- COMPROBACIÓN 3: Verificando registro en PostgreSQL ---');
        const dbResult = await query(
          `SELECT * FROM registro_social_media WHERE product_id = $1 ORDER BY created_at DESC`,
          [testProductId]
        );

        if (dbResult.rowCount && dbResult.rowCount > 0) {
          console.log(`✅ Se encontraron ${dbResult.rowCount} filas registradas en la base de datos:`);
          dbResult.rows.forEach(row => {
            console.log(`  [${row.platform.toUpperCase()}] Status: ${row.status} | ExtPostID: ${row.external_post_id || 'N/A'} | Error: ${row.error_message || 'N/A'}`);
          });
        } else {
          console.log('ℹ️ No se encontraron registros devueltos (posiblemente se falló la escritura o la base de datos es local dummy).');
        }
      } catch (e) {
        // Silenciar error de query si ya falló antes
      }
    }

  } catch (err: any) {
    console.error('\n❌ Fallo catastrófico durante el test:', err.message);
  }

  console.log('\n=== FIN DE LA EJECUCIÓN DEL TEST ===');
  // Asegurar cierre de pool si existe
  process.exit(0);
}

main().catch(console.error);
