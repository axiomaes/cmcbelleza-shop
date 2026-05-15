import { WordPressService } from '../src/services/wordpress.service.js';

const wp = new WordPressService();

async function getLatestProducts() {
  try {
    // Traer los 5 productos más recientes de la tienda ordenados por fecha de creación descendente
    const response = await wp.client.get('/wc/v3/products', {
      params: {
        orderby: 'date',
        order: 'desc',
        per_page: 5
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ [Monitor] Error al obtener productos de WooCommerce:', error.message);
    return [];
  }
}

async function monitor() {
  console.clear();
  console.log('================================================================');
  console.log('🛒  INICIANDO MONITOR DE IMPORTACIÓN DE PRODUCTOS (SPOCKET)  🛒');
  console.log('================================================================');
  console.log(`📡 Conectado a: ${process.env.WP_API_URL || 'https://api.cmcbelleza.shop/wp-json'}`);
  console.log('🕒 Frecuencia: Escaneo continuo cada 10 segundos. Presiona CTRL+C para salir.\n');

  let knownProductIds: Set<number> = new Set();
  let isFirstRun = true;

  const runScan = async () => {
    const now = new Date().toLocaleTimeString();
    const products = await getLatestProducts();

    if (products.length === 0) {
      console.log(`[${now}] ℹ️ No se obtuvieron productos. Esperando el siguiente ciclo...`);
      return;
    }

    // Extraer IDs actuales
    const currentIds = new Set(products.map((p: any) => p.id));

    // Si es la primera ejecución, registrar los actuales y mostrarlos
    if (isFirstRun) {
      console.log(`📊 [ESTADO ACTUAL] Últimos 5 productos en catálogo:\n`);
      products.forEach((p: any, index: number) => {
        console.log(`  ${index + 1}. [ID: ${p.id}] ${p.name}`);
        console.log(`     💰 Precio: ${p.price || '0'}€ | ⭐ Destacado: ${p.featured ? 'SÍ ✅' : 'NO ❌'}`);
        console.log(`     📅 Creado: ${p.date_created} | 🌐 Estado: ${p.status.toUpperCase()}\n`);
        knownProductIds.add(p.id);
      });
      isFirstRun = false;
      console.log('--- ESCUCHANDO ACTIVAMENTE IMPORTACIONES ---');
    } else {
      // Buscar IDs nuevos
      let newCount = 0;
      for (const p of products) {
        if (!knownProductIds.has(p.id)) {
          console.log(`\n🎉 [${now}] ¡¡NUEVO PRODUCTO DETECTADO DESDE SPOCKET!! 🎉`);
          console.log(`----------------------------------------------------------------`);
          console.log(`🔹 ID: ${p.id}`);
          console.log(`🔹 NOMBRE: "${p.name}"`);
          console.log(`🔹 PRECIO: ${p.price} €`);
          console.log(`🔹 DESTACADO: ${p.featured ? 'SÍ! (Disparará automatización social) 🔥' : 'No ⏹️'}`);
          console.log(`🔹 CATEGORÍAS: ${p.categories.map((c: any) => c.name).join(', ')}`);
          console.log(`🔹 IMÁGENES: ${p.images.length} cargadas`);
          console.log(`🔹 ESTADO: ${p.status}`);
          console.log(`🔹 DESCRIPCIÓN LARGO: ${p.description ? p.description.length : 0} chars`);
          console.log(`----------------------------------------------------------------\n`);
          knownProductIds.add(p.id);
          newCount++;
        }
      }

      if (newCount === 0) {
        process.stdout.write(`.`); // Imprime puntos de latido para mostrar actividad sin saturar consola
      }
    }
  };

  // Disparar primer escaneo inmediatamente
  await runScan();

  // Bucle de intervalos
  const interval = setInterval(runScan, 10000);

  // Limpieza ordenada al cerrar
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n\n🏁 Monitorización detenida. ¡Feliz importación! 🏁');
    process.exit(0);
  });
}

monitor().catch(console.error);
