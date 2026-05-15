import { WordPressService } from '../src/services/wordpress.service.js';

const wp = new WordPressService();

async function main() {
  console.log('=== INICIANDO EJECUCIÓN DE VINCULACIÓN DINÁMICA DE CATEGORÍAS ===\n');

  const categoryMappings = [
    { es_slug: 'wigs', en_slug: 'wigs-en' },
    { es_slug: 'bags', en_slug: 'bags-en' },
    { es_slug: 'jewelry', en_slug: 'jewelry-en' },
    { es_slug: 'clothing', en_slug: 'clothing-en' },
    { es_slug: 'accesorios-de-belleza', en_slug: 'beauty-accessories' }
  ];

  for (const mapping of categoryMappings) {
    console.log(`\nBuscando IDs para mapeo de slug ES: "${mapping.es_slug}" y EN: "${mapping.en_slug}"...`);

    let es_id = null;
    let en_id = null;

    try {
      // 1. Obtener ID de la categoría española
      const searchES = await wp.client.get('/wp/v2/product_cat', { params: { slug: mapping.es_slug } });
      if (searchES.data && searchES.data.length > 0) {
        es_id = searchES.data[0].id;
        console.log(`  ✅ Categoría ES encontrada. ID: ${es_id}`);
      } else {
        console.error(`  ❌ Categoría ES con slug "${mapping.es_slug}" no encontrada.`);
        continue;
      }

      // 2. Obtener ID de la categoría inglesa
      const searchEN = await wp.client.get('/wp/v2/product_cat', { params: { slug: mapping.en_slug } });
      if (searchEN.data && searchEN.data.length > 0) {
        en_id = searchEN.data[0].id;
        console.log(`  ✅ Categoría EN encontrada. ID: ${en_id}`);
      } else {
        console.error(`  ❌ Categoría EN con slug "${mapping.en_slug}" no encontrada.`);
        continue;
      }

      // 3. Asignar idiomas y vincular
      console.log(`  - Asignando lang "es" a ID ${es_id}...`);
      await wp.client.post(`/wp/v2/product_cat/${es_id}`, { lang: 'es' });
      
      console.log(`  - Asignando lang "en" a ID ${en_id}...`);
      await wp.client.post(`/wp/v2/product_cat/${en_id}`, { lang: 'en' });

      console.log(`  - Vinculando ambas categorías via Polylang...`);
      const linkRes = await wp.client.post(`/wp/v2/product_cat/${es_id}`, {
        translations: {
          es: es_id,
          en: en_id
        }
      });
      
      console.log(`  🎉 ¡Mapeo "${mapping.es_slug}" <-> "${mapping.en_slug}" completado con éxito!`);
    } catch (err: any) {
      console.error(`  ❌ Error procesando mapeo: ${err.response?.data?.message || err.message}`);
    }
  }

  console.log('\n=== PROCESO COMPLETADO CON ÉXITO ===');
}

main().catch(console.error);
