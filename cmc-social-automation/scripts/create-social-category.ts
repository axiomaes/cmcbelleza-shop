import axios from 'axios';

async function createSocialCategory() {
  console.log('==========================================================');
  console.log('🏷️ CREANDO CATEGORÍA DE DISPARO SOCIAL EN WOOCOMMERCE 🏷️');
  console.log('==========================================================\n');

  // Usar credenciales reales de producción obtenidas
  const WP_API_URL = 'https://api.cmcbelleza.shop/wp-json';
  const WP_ADMIN_USER = 'jota';
  const WP_APP_PASSWORD = '3Lwk XWKF vnDz VHEX udi1 O5Bg';

  const auth = Buffer.from(`${WP_ADMIN_USER}:${WP_APP_PASSWORD}`).toString('base64');

  const client = axios.create({
    baseURL: WP_API_URL,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  const categoryPayload = {
    name: 'Publish to Social',
    slug: 'publish-to-social',
    description: 'Productos asignados a esta categoría serán publicados automáticamente en Instagram y Facebook.'
  };

  try {
    console.log('📤 Enviando POST a /wc/v3/products/categories...');
    const res = await client.post('/wc/v3/products/categories', categoryPayload);
    
    console.log('\n🎉 ¡CATEGORÍA CREADA CON ÉXITO! 🎉');
    console.log(`👉 Nombre: "${res.data.name}"`);
    console.log(`👉 Slug: "${res.data.slug}"`);
    console.log(`👉 ID DE CATEGORÍA: ${res.data.id} ✅`);
    
  } catch (error: any) {
    if (error.response?.data?.code === 'term_exists') {
      console.log('\nℹ️ La categoría ya existe en el sistema.');
      console.log(`👉 ID DE CATEGORÍA EXISTENTE: ${error.response.data.data.resource_id} ✅`);
    } else {
      console.error('\n❌ Error al crear la categoría:', error.response?.data || error.message);
    }
  }

  console.log('\n==========================================================');
  process.exit(0);
}

createSocialCategory().catch(console.error);
