import axios from 'axios';

async function triggerTest() {
  console.log('============================================================');
  console.log('🧪 LANZANDO SIMULACIÓN DE WEBHOOK CON CATEGORÍA TRIGGER 🧪');
  console.log('============================================================\n');

  // Configuración de conexión producción
  const API_URL = 'http://mfqgcbiab0gessny8g87rxsk.91.98.239.40.sslip.io/api/webhook/woocommerce';
  const WEBHOOK_SECRET = 'cmc_98745jhXkP2_secure_meta_hook_2026';

  const testId = 987000 + Math.floor(Math.random() * 999);

  const payload = {
    id: testId,
    name: `CMC Automator Test #${testId}`,
    price: '149.99',
    regular_price: '199.99',
    permalink: 'https://cmcbelleza.shop/en/tienda',
    featured: false, // PROBAMOS QUE YA NO IMPORTA QUE SEA FALSO
    categories: [
      {
        id: 741,
        name: 'Publish to Social',
        slug: 'publish-to-social'
      }
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
        id: 1234
      }
    ],
    description: '<p>Simulación robusta del nuevo trigger por categorización "Publish to Social" y auto-borrado nativo.</p>'
  };

  console.log(`📤 Enviando Payload simulado al microservicio...`);
  console.log(`👉 ID Producto de Prueba: ${payload.id}`);
  console.log(`👉 URL de Destino: ${API_URL}`);

  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET
      },
      timeout: 25000 // Dar tiempo a Meta Graph API para responder
    });

    console.log('\n🎉 ¡DISPARO EJECUTADO DE FORMA EXITOSA! 🎉');
    console.log('------------------------------------------------------------');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('------------------------------------------------------------\n');
    
  } catch (error: any) {
    console.error('\n❌ El disparo simulado devolvió un error:', error.response?.data || error.message);
    console.log('ℹ️ Si devolvió 404 o Connection Refused, Coolify podría estar en medio del swap del contenedor. Reintenta en 30s.');
  }

  console.log('============================================================');
  process.exit(0);
}

triggerTest().catch(console.error);
