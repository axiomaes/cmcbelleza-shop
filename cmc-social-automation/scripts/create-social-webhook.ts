import axios from 'axios';

async function createSocialWebhook() {
  console.log('==========================================================');
  console.log('🔗 REGISTRANDO WEBHOOK WOOCOMMERCE HACIA EL MICROSERVICIO 🔗');
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

  const webhookPayload = {
    name: 'CMC Social Publish Trigger',
    topic: 'product.updated',
    delivery_url: 'http://mfqgcbiab0gessny8g87rxsk.91.98.239.40.sslip.io/api/webhook/woocommerce',
    secret: 'cmc_98745jhXkP2_secure_meta_hook_2026',
    status: 'active'
  };

  try {
    console.log('📤 Enviando POST a /wc/v3/webhooks...');
    const res = await client.post('/wc/v3/webhooks', webhookPayload);
    
    console.log('\n🎉 ¡WEBHOOK REGISTRADO CON ÉXITO! 🎉');
    console.log(`👉 Nombre: "${res.data.name}"`);
    console.log(`👉 Evento (Topic): "${res.data.topic}"`);
    console.log(`👉 URL de Entrega: "${res.data.delivery_url}"`);
    console.log(`👉 ID DEL WEBHOOK: ${res.data.id} ✅`);
    
  } catch (error: any) {
    console.error('\n❌ Error al registrar el webhook:', error.response?.data || error.message);
  }

  console.log('\n==========================================================');
  process.exit(0);
}

createSocialWebhook().catch(console.error);
