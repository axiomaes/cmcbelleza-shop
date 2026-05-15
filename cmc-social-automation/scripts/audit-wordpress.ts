import { WordPressService } from '../src/services/wordpress.service.js';

const wp = new WordPressService();

async function fetchAll(endpoint: string) {
  let allItems: any[] = [];
  let page = 1;
  let totalPages = 1;
  
  try {
    do {
      const res = await wp.client.get(endpoint, {
        params: {
          per_page: 100,
          page: page,
          status: 'publish'
        }
      });
      allItems = allItems.concat(res.data);
      totalPages = parseInt(res.headers['x-wp-totalpages'] || '1', 10);
      page++;
    } while (page <= totalPages);
  } catch (err: any) {
    console.error(`Error fetching from ${endpoint}: ${err.message}`);
  }
  
  return allItems;
}

async function main() {
  console.log('=== INICIANDO AUDITORÍA DE CONTENIDO EN WORDPRESS ===\n');
  
  // 1. Auditar Páginas
  console.log('Consultando páginas...');
  const pages = await fetchAll('/wp/v2/pages');
  console.log(`Encontradas ${pages.length} páginas publicadas.`);
  
  const missingPageTranslations: any[] = [];
  pages.forEach((p: any) => {
    const lang = p.lang;
    const trans = p.translations || {};
    const hasES = !!trans.es;
    const hasEN = !!trans.en;
    
    if (!hasES || !hasEN) {
      missingPageTranslations.push({
        id: p.id,
        title: p.title.rendered,
        slug: p.slug,
        lang: lang,
        missing: !hasES ? 'es' : 'en'
      });
    }
  });
  
  console.log(`\nPáginas con traducciones incompletas: ${missingPageTranslations.length}`);
  missingPageTranslations.forEach(p => {
    console.log(`- [ID ${p.id}] ${p.title} (${p.slug}) - Idioma actual: ${p.lang.toUpperCase()}, Falta: ${p.missing.toUpperCase()}`);
  });

  // 2. Auditar Posts (Blog)
  console.log('\nConsultando entradas del blog (posts)...');
  const posts = await fetchAll('/wp/v2/posts');
  console.log(`Encontrados ${posts.length} posts publicados.`);
  
  const missingPostTranslations: any[] = [];
  posts.forEach((p: any) => {
    const lang = p.lang;
    const trans = p.translations || {};
    const hasES = !!trans.es;
    const hasEN = !!trans.en;
    
    if (!hasES || !hasEN) {
      missingPostTranslations.push({
        id: p.id,
        title: p.title.rendered,
        slug: p.slug,
        lang: lang,
        missing: !hasES ? 'es' : 'en'
      });
    }
  });
  
  console.log(`\nEntradas de blog con traducciones incompletas: ${missingPostTranslations.length}`);
  missingPostTranslations.forEach(p => {
    console.log(`- [ID ${p.id}] ${p.title} (${p.slug}) - Idioma actual: ${p.lang.toUpperCase()}, Falta: ${p.missing.toUpperCase()}`);
  });

  // 3. Auditar Categorías
  console.log('\nConsultando categorías...');
  const categories = await fetchAll('/wp/v2/categories');
  console.log(`Encontradas ${categories.length} categorías.`);
  
  const missingCatTranslations: any[] = [];
  categories.forEach((c: any) => {
    // Las categorías a veces no tienen polylang habilitado de la misma forma o usan un endpoint diferente, veamos si tienen lang.
    const lang = c.lang;
    const trans = c.translations || {};
    const hasES = !!trans.es;
    const hasEN = !!trans.en;
    
    if (lang && (!hasES || !hasEN)) {
      missingCatTranslations.push({
        id: c.id,
        name: c.name,
        slug: c.slug,
        lang: lang,
        missing: !hasES ? 'es' : 'en'
      });
    }
  });
  
  console.log(`\nCategorías con traducciones incompletas: ${missingCatTranslations.length}`);
  missingCatTranslations.forEach(c => {
    console.log(`- [ID ${c.id}] ${c.name} (${c.slug}) - Idioma actual: ${c.lang.toUpperCase()}, Falta: ${c.missing.toUpperCase()}`);
  });

  // 4. Auditar Productos
  console.log('\nConsultando productos...');
  const products = await fetchAll('/wp/v2/product');
  console.log(`Encontrados ${products.length} productos.`);
  
  const missingProdTranslations: any[] = [];
  products.forEach((p: any) => {
    const lang = p.lang;
    const trans = p.translations || {};
    const hasES = !!trans.es;
    const hasEN = !!trans.en;
    
    if (lang && (!hasES || !hasEN)) {
      missingProdTranslations.push({
        id: p.id,
        name: p.title?.rendered || 'Sin título',
        slug: p.slug,
        lang: lang,
        missing: !hasES ? 'es' : 'en'
      });
    }
  });
  
  console.log(`\nProductos con traducciones incompletas: ${missingProdTranslations.length}`);
  missingProdTranslations.forEach(p => {
    console.log(`- [ID ${p.id}] ${p.name} (${p.slug}) - Idioma actual: ${p.lang.toUpperCase()}, Falta: ${p.missing.toUpperCase()}`);
  });

  // 5. Auditar Categorías de Producto (WooCommerce)
  console.log('\nConsultando categorías de producto (WooCommerce)...');
  const prodCats = await fetchAll('/wp/v2/product_cat');
  console.log(`Encontradas ${prodCats.length} categorías de producto.`);
  
  prodCats.forEach((c: any) => {
    console.log(`  -> Categoría real: ID ${c.id} | Nombre: "${c.name}" | Slug: "${c.slug}" | Idioma: ${(c.lang || 'N/A').toUpperCase()}`);
  });
  
  const missingProdCatTranslations: any[] = [];
  prodCats.forEach((c: any) => {
    const lang = c.lang;
    const trans = c.translations || {};
    const hasES = !!trans.es;
    const hasEN = !!trans.en;
    
    if (lang && (!hasES || !hasEN)) {
      missingProdCatTranslations.push({
        id: c.id,
        name: c.name,
        slug: c.slug,
        lang: lang,
        missing: !hasES ? 'es' : 'en'
      });
    }
  });
  
  console.log(`\nCategorías de producto con traducciones incompletas: ${missingProdCatTranslations.length}`);
  missingProdCatTranslations.forEach(c => {
    console.log(`- [ID ${c.id}] ${c.name} (${c.slug}) - Idioma actual: ${c.lang.toUpperCase()}, Falta: ${c.missing.toUpperCase()}`);
  });
  
  console.log('\n=== FIN DE AUDITORÍA WORDPRESS ===');
}

main().catch(console.error);
