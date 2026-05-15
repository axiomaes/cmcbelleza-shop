import { WordPressService } from '../src/services/wordpress.service.js';

const wp = new WordPressService();

const PRODUCT_IDS = [2089, 2091, 2092, 2094];

async function getCategoryBySlug(slug: string) {
  const response = await wp.client.get('/wp/v2/product_cat', {
    params: { slug }
  });
  if (response.data && response.data.length > 0) {
    return response.data[0].id;
  }
  throw new Error(`Categoría con slug "${slug}" no encontrada en WordPress.`);
}

async function main() {
  console.log('=== INICIANDO AUTO-VINCULACIÓN DE PRODUCTOS SPOCKET EN/ES ===\n');

  try {
    // 1. Obtener IDs de Categorías dinámicamente
    console.log('📡 Obteniendo IDs de categorías "bags" y "bags-en"...');
    const bagsEsId = await getCategoryBySlug('bags');
    const bagsEnId = await getCategoryBySlug('bags-en');
    console.log(`✅ Categoría ES (bags): ID ${bagsEsId}`);
    console.log(`✅ Categoría EN (bags-en): ID ${bagsEnId}\n`);

    for (const esId of PRODUCT_IDS) {
      console.log(`------------------------------------------------------------`);
      console.log(`📦 [PROCESANDO PRODUCTO] ID Origen: ${esId}`);
      console.log(`------------------------------------------------------------`);

      // A. Fetch de datos de WooCommerce para el producto original
      console.log(`  - Obteniendo detalles de WooCommerce...`);
      const prodResponse = await wp.client.get(`/wc/v3/products/${esId}`);
      const esProduct = prodResponse.data;
      
      console.log(`  🔹 Título: "${esProduct.name}"`);
      console.log(`  🔹 Precio Actual: "${esProduct.price || '0'}"`);

      // B. Actualizar el producto original: Asignar categoría ES "bags" y fijar idioma "es"
      console.log(`  - Asignando categoría "bags" y limpiando categorías antiguas en el producto ES...`);
      await wp.client.post(`/wc/v3/products/${esId}`, {
        categories: [{ id: bagsEsId }]
      });

      console.log(`  - Forzando idioma "es" en Polylang para ID ${esId}...`);
      await wp.client.post(`/wp/v2/product/${esId}`, {
        lang: 'es'
      });

      // C. Verificar si ya existe una traducción vinculada para evitar duplicar si el script se re-ejecuta
      console.log(`  - Comprobando vinculaciones de traducción previas...`);
      const verifyRes = await wp.client.get(`/wp/v2/product/${esId}`);
      const existingTranslations = verifyRes.data.translations || {};
      
      if (existingTranslations.en && existingTranslations.en !== esId) {
        console.log(`  ⚠️ El producto ya tiene una traducción vinculada en EN (ID: ${existingTranslations.en}).`);
        console.log(`  - Asegurando que la traducción EN tenga asignada la categoría "bags-en"...`);
        await wp.client.post(`/wc/v3/products/${existingTranslations.en}`, {
          categories: [{ id: bagsEnId }]
        });
        console.log(`  ✅ Tradución existente sincronizada. Saltando creación.`);
        continue;
      }

      // D. Crear la versión EN en WooCommerce
      console.log(`  - Creando nuevo clon del producto para la versión EN...`);
      // Limpiar imágenes para copiarlas de forma limpia (reducimos a los atributos necesarios)
      const clonedImages = esProduct.images.map((img: any) => ({
        src: img.src,
        name: img.name,
        alt: img.alt
      }));

      const newEnProductPayload = {
        name: esProduct.name, // El título ya viene en inglés
        slug: `${esProduct.slug}-en`,
        status: 'publish',
        type: esProduct.type || 'simple',
        description: esProduct.description,
        short_description: esProduct.short_description,
        regular_price: esProduct.regular_price || '19.99', // Fallback de seguridad si el precio es vacío
        sale_price: esProduct.sale_price || '',
        categories: [{ id: bagsEnId }],
        images: clonedImages,
        meta_data: [
          { key: '_pll_language', value: 'en' }
        ]
      };

      const createRes = await wp.client.post('/wc/v3/products', newEnProductPayload);
      const enId = createRes.data.id;
      console.log(`  🎉 ¡Clon EN creado con éxito! ID: ${enId}`);

      // E. Vincular mediante Polylang
      console.log(`  - Vinculando idiomas en Polylang (ES ID: ${esId} <-> EN ID: ${enId})...`);
      
      // 1. Marcar el nuevo producto explícitamente como inglés en Polylang
      await wp.client.post(`/wp/v2/product/${enId}`, {
        lang: 'en'
      });

      // 2. Ejecutar la unión de traducciones
      await wp.client.post(`/wp/v2/product/${esId}`, {
        translations: {
          es: esId,
          en: enId
        }
      });

      console.log(`  ✅ ¡Vinculación Polylang de producto completada!`);
    }

    console.log(`\n============================================================`);
    console.log(`🔍 VERIFICACIÓN: Solicitando productos en inglés (lang=en)...`);
    console.log(`============================================================`);
    const verifyEn = await wp.client.get('/wc/v3/products', {
      params: {
        lang: 'en',
        per_page: 5
      }
    });

    if (verifyEn.data && verifyEn.data.length > 0) {
      console.log(`✅ Encontrados ${verifyEn.data.length} productos en EN:`);
      verifyEn.data.forEach((p: any) => {
        console.log(`  👉 [ID: ${p.id}] ${p.name} | Categorías: ${p.categories.map((c: any) => c.name).join(', ')}`);
      });
    } else {
      console.warn(`⚠️ No se devolvieron productos al filtrar por lang=en. Puede que la caché de WooCommerce tarde en refrescar.`);
    }

  } catch (error: any) {
    const details = error.response?.data?.message || error.message;
    console.error(`\n❌ Error crítico durante la ejecución:`, details);
    if (error.response?.data) {
      console.error('Detalles de API:', JSON.stringify(error.response.data));
    }
  }

  console.log('\n🏁 PROCESO FINALIZADO.');
}

main().catch(console.error);
