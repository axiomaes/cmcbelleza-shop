// scripts/verify_polylang_fix.js
// Ejecuta: node scripts/verify_polylang_fix.js

async function verifyFix() {
  const key = 'ck_4d5bbae898fb0b5299e2557b6af59d7ed8bbbcb1';
  const secret = 'cs_0956fb8d278c2d7e584029709ea6f690d353b364';
  const basicAuth = Buffer.from(`${key}:${secret}`).toString('base64');
  
  console.log('====================================================');
  console.log('🔍 INICIANDO PRUEBAS DE VERIFICACIÓN - POLYLANG REST');
  console.log('====================================================\n');
  
  // --------------------------------------------------------
  // TEST 1: Verificar filtrado de Páginas por idioma
  // --------------------------------------------------------
  let test1Pass = false;
  let idsEsStr = '';
  let idsEnStr = '';
  try {
    const resEs = await fetch('https://api.cmcbelleza.shop/wp-json/wp/v2/pages?lang=es&per_page=20');
    const pagesEs = await resEs.json();
    const resEn = await fetch('https://api.cmcbelleza.shop/wp-json/wp/v2/pages?lang=en&per_page=20');
    const pagesEn = await resEn.json();
    
    const idsEs = Array.isArray(pagesEs) ? pagesEs.map(p => p.id) : [];
    const idsEn = Array.isArray(pagesEn) ? pagesEn.map(p => p.id) : [];
    
    idsEsStr = idsEs.join(', ') || 'Ninguno';
    idsEnStr = idsEn.join(', ') || 'Ninguno';
    
    // Si el fix funciona, los listados de IDs ya no deberían coincidir al 100% si hay contenido en ambos idiomas
    const areEqual = idsEs.length === idsEn.length && idsEs.every((v,i) => v === idsEn[i]);
    test1Pass = !areEqual;
    
    console.log(`TEST 1: ${test1Pass ? '✅ PASADO' : '❌ FALLIDO (Devuelve los mismos IDs)'}`);
    console.log(`-> IDs en Español (ES): ${idsEsStr}`);
    console.log(`-> IDs en Inglés (EN): ${idsEnStr}\n`);
  } catch (e) {
    console.log('TEST 1: ❌ ERROR EN CONSULTA: ' + e.message + '\n');
  }

  // --------------------------------------------------------
  // TEST 2: Verificar filtrado de Productos por idioma
  // --------------------------------------------------------
  let test2Pass = false;
  let prodEsStr = '';
  let prodEnStr = '';
  try {
    const resWcEs = await fetch('https://api.cmcbelleza.shop/wp-json/wc/v3/products?lang=es', {
      headers: { 'Authorization': `Basic ${basicAuth}` }
    });
    const prodEs = await resWcEs.json();
    
    const resWcEn = await fetch('https://api.cmcbelleza.shop/wp-json/wc/v3/products?lang=en', {
      headers: { 'Authorization': `Basic ${basicAuth}` }
    });
    const prodEn = await resWcEn.json();
    
    const idsPEs = Array.isArray(prodEs) ? prodEs.map(p => p.id) : [];
    const idsPEn = Array.isArray(prodEn) ? prodEn.map(p => p.id) : [];
    
    prodEsStr = idsPEs.join(', ') || 'Ninguno';
    prodEnStr = idsPEn.join(', ') || 'Ninguno';
    
    const areProdEqual = idsPEs.length === idsPEn.length && idsPEs.every((v,i) => v === idsPEn[i]);
    test2Pass = !areProdEqual;
    
    console.log(`TEST 2: ${test2Pass ? '✅ PASADO' : '❌ FALLIDO (Catálogo mezclado)'}`);
    console.log(`-> IDs Productos (ES): ${prodEsStr}`);
    console.log(`-> IDs Productos (EN): ${prodEnStr}\n`);
  } catch (e) {
    console.log('TEST 2: ❌ ERROR EN CONSULTA: ' + e.message + '\n');
  }

  // --------------------------------------------------------
  // TEST 3: Existencia de campo 'translations'
  // --------------------------------------------------------
  try {
    const res = await fetch('https://api.cmcbelleza.shop/wp-json/wp/v2/pages?per_page=1');
    const data = await res.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const page = data[0];
      const hasTranslations = page.hasOwnProperty('translations');
      console.log(`TEST 3: ${hasTranslations ? '✅ PASADO' : '❌ FALLIDO (Falta campo en JSON)'}`);
      if (hasTranslations) {
        console.log('-> Estructura detectada:', JSON.stringify(page.translations, null, 2));
      } else {
        console.log('-> No se encontró el campo `translations` en el objeto página.');
      }
    } else {
      console.log('TEST 3: ❌ FALLIDO (No se pudo consultar páginas)');
    }
  } catch (e) {
    console.log('TEST 3: ❌ ERROR DE CONECTIVIDAD: ' + e.message);
  }
  
  console.log('\n====================================================');
  console.log(`🏁 ESTADO FINAL DE LA API: ${ (test1Pass && test2Pass) ? '🟢 100% OPERATIVA (FIX COMPLETADO)' : '🟡 ACCIÓN PENDIENTE' }`);
  console.log('====================================================');
}

verifyFix();
