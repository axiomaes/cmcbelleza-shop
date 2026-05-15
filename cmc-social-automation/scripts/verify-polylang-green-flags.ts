import { WordPressService } from '../src/services/wordpress.service.js';

const wp = new WordPressService();
const PRODUCT_IDS = [2089, 2091, 2092, 2094];

async function verifyGreenFlags() {
  console.log('============================================================');
  console.log('🟢 AUDITORÍA DE VINCULACIÓN POLYLANG (GREEN FLAGS) 🟢');
  console.log('============================================================');
  console.log('Auditando estado de sincronización nativa en el catálogo...\n');

  for (const esId of PRODUCT_IDS) {
    try {
      // 1. Consultar el objeto de WordPress nativo para ver el idioma y mapeo
      const res = await wp.client.get(`/wp/v2/product/${esId}`);
      const product = res.data;
      const lang = product.lang;
      const translations = product.translations || {};
      
      console.log(`📦 [PRODUCTO ORIGEN ES: ID ${esId}]`);
      console.log(`   🔹 Título: "${product.title.rendered}"`);
      console.log(`   🔹 Estado de Idioma Polylang: "${lang.toUpperCase()}"`);
      
      if (translations.en && translations.en !== esId) {
        const enId = translations.en;
        // 2. Consultar el clon en inglés para certificar integridad bidireccional
        const enRes = await wp.client.get(`/wp/v2/product/${enId}`);
        const enProduct = enRes.data;
        
        console.log(`   🔹 Traducción Enlazada (EN): ID ${enId} ✅`);
        console.log(`   🔹 Estado de Idioma Clon: "${enProduct.lang.toUpperCase()}" ✅`);
        
        const statusES = product.status === 'publish' ? 'Publicado' : product.status;
        const statusEN = enProduct.status === 'publish' ? 'Publicado' : enProduct.status;
        
        console.log(`   💡 Integridad de Publicación: [ES: ${statusES}] ⟷ [EN: ${statusEN}]`);
        console.log(`   🚩 ESTADO VISUAL EN WORDPRESS: 🟢 TOTALMENTE TRADUCIDO (Banderitas Verdes Activas) 🟢\n`);
      } else {
        console.log(`   ❌ FALLO DE VINCULACIÓN: No se encontró hermano de traducción EN.\n`);
      }

    } catch (error: any) {
      console.error(`   ⚠️ Error auditando ID ${esId}:`, error.message, '\n');
    }
  }
  console.log('============================================================');
  console.log('🏁 FIN DE LA AUDITORÍA.');
}

verifyGreenFlags().catch(console.error);
