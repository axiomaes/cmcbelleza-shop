import { WordPressService } from '../src/services/wordpress.service.js';

const wp = new WordPressService();

// ============================================================================
// TRADUCCIÓN EXACTA PARA LA POLÍTICA DE ELIMINACIÓN DE DATOS (1946)
// ============================================================================
const getDataDeletionEnContent = (rawEs: string): string => {
  let en = rawEs;

  // 1. Título y Párrafo de Introducción
  en = en.replace(
    /<h2>Política de Eliminación de Datos<\/h2>/g,
    '<h2>Data Deletion Policy</h2>'
  );
  en = en.replace(
    /En cumplimiento con las políticas de Meta \(Facebook e Instagram\)\s*\n\s*y el Reglamento General de Protección de Datos \(RGPD\),\s*\n\s*CMC Belleza ofrece a sus usuarios el derecho a solicitar\s*\n\s*la eliminación de sus datos personales\./g,
    'In compliance with Meta\'s policies (Facebook and Instagram) and the General Data Protection Regulation (GDPR), CMC Belleza offers its users the right to request the deletion of their personal data.'
  );

  // 2. Qué datos podemos tener
  en = en.replace(
    /<h2>¿Qué datos podemos tener sobre ti\?<\/h2>/g,
    '<h2>What data do we have about you?</h2>'
  );
  en = en.replace(
    /Si has utilizado el inicio de sesión con Facebook o Instagram\s*\n\s*en nuestra plataforma, podemos tener acceso a:/g,
    'If you have used the Facebook or Instagram login on our platform, we may have access to:'
  );

  // Saneamiento de marcadores de la lista de datos
  en = en.replace(/<li>Jonatan Garcia Planas<\/li>/g, '<li>Full Name</li>');
  en = en.replace(/<li>soporte@cmcbelleza\.shop<\/li>/g, '<li>Email Address</li>');
  en = en.replace(/<li>ID de usuario de Facebook\/Instagram<\/li>/g, '<li>Facebook/Instagram User ID</li>');
  en = en.replace(/<li>Foto de perfil pública<\/li>/g, '<li>Public profile picture</li>');

  // 3. Cómo solicitar
  en = en.replace(
    /<h2>Cómo solicitar la eliminación de tus datos<\/h2>/g,
    '<h2>How to request your data deletion</h2>'
  );
  en = en.replace(
    /Tienes tres formas de solicitar la eliminación\s*\n\s*de tus datos personales:/g,
    'You have three ways to request the deletion of your personal data:'
  );

  // Opción 1
  en = en.replace(/<h3>Opción 1 — Desde Facebook<\/h3>/g, '<h3>Option 1 — Via Facebook</h3>');
  en = en.replace(/<li>Ve a tu cuenta de Facebook<\/li>/g, '<li>Go to your Facebook account</li>');
  en = en.replace(/<li>Accede a Configuración y privacidad → Configuración<\/li>/g, '<li>Go to Settings & Privacy → Settings</li>');
  en = en.replace(/<li>Selecciona Aplicaciones y sitios web<\/li>/g, '<li>Select Apps and Websites</li>');
  en = en.replace(/<li>Busca CMC Belleza y haz clic en Eliminar<\/li>/g, '<li>Search for CMC Belleza and click Remove</li>');
  en = en.replace(/<li>Confirma la eliminación<\/li>/g, '<li>Confirm the removal</li>');

  // Opción 2
  en = en.replace(/<h3>Opción 2 — Por correo electrónico<\/h3>/g, '<h3>Option 2 — Via Email</h3>');
  en = en.replace(
    /Envía un correo a\s*\n\s*<a href="mailto:soporte@cmcbelleza\.shop">soporte@cmcbelleza\.shop<\/a>\s*\n\s*con el asunto "Solicitud de eliminación de datos"\s*\n\s*indicando tu nombre completo y el ID de usuario\s*\n\s*o correo asociado a tu cuenta\./g,
    'Send an email to <a href="mailto:soporte@cmcbelleza.shop">soporte@cmcbelleza.shop</a> with the subject "Data Deletion Request" indicating your full name and the user ID or email associated with your account.'
  );

  // Opción 3
  en = en.replace(/<h3>Opción 3 — Por teléfono<\/h3>/g, '<h3>Option 3 — Via Phone</h3>');
  en = en.replace(
    /Contacta con nosotros en el número\s*\n\s*<a href="tel:\[TELEFONO_CLIENTE\]">\[TELEFONO_CLIENTE\]<\/a>\s*\n\s*en horario de lunes a viernes de 9:00 a 18:00h\./g,
    'Contact us at [PENDIENTE] or via customer service hours (Monday to Friday, 9:00 AM to 6:00 PM CET).'
  );

  // 4. Plazo
  en = en.replace(/<h2>Plazo de eliminación<\/h2>/g, '<h2>Deletion period</h2>');
  en = en.replace(
    /Una vez recibida tu solicitud, procederemos a eliminar\s*\n\s*todos tus datos personales en un plazo máximo de 30 días,\s*\n\s*conforme a lo establecido en el RGPD\./g,
    'Once your request is received, we will proceed to delete all your personal data within a maximum of 30 days, in accordance with the GDPR.'
  );

  // 5. Confirmación
  en = en.replace(/<h2>Confirmación<\/h2>/g, '<h2>Confirmation</h2>');
  en = en.replace(
    /Te enviaremos un correo de confirmación una vez que\s*\n\s*tus datos hayan sido eliminados correctamente\./g,
    'We will send you a confirmation email once your data has been successfully deleted.'
  );

  // 6. Responsable
  en = en.replace(/<h2>Responsable del tratamiento<\/h2>/g, '<h2>Data Controller</h2>');
  en = en.replace(/Calle Kaustrasse,7/g, 'Kaustrasse 7');

  return en;
};

// ============================================================================
// CONTENIDO FIJO DE RESEÑAS
// ============================================================================
const getReviewsEnContent = (): string => {
  return `<!-- wp:html -->
<h2>Our Agreement With You</h2>
<p>At CMC Belleza we work to offer you a clear, simple and honest shopping experience, taking care of every detail from product selection to delivery.</p>
<!-- /wp:html -->`;
};

// ============================================================================
// FLUJO PRINCIPAL
// ============================================================================
async function run() {
  console.log('🛒 Iniciando creación de traducciones EN para páginas WooCommerce y Eliminación de Datos...\n');

  const connTest = await wp.testConnection();
  if (!connTest.success) {
    console.error(`❌ Error de conectividad WordPress: ${connTest.error}`);
    process.exit(1);
  }
  console.log(`✅ Autenticación establecida como: ${connTest.username}\n`);

  // Configuración del lote de páginas WooCommerce y soporte legal
  const wooTranslationsConfig = [
    {
      esId: 1000,
      enTitle: 'Shop',
      enSlug: 'shop',
      builder: async () => "" // WooCommerce gestiona el contenido
    },
    {
      esId: 6,
      enTitle: 'Shopping Cart',
      enSlug: 'cart',
      builder: async () => "" // WooCommerce gestiona el contenido
    },
    {
      esId: 7,
      enTitle: 'Checkout',
      enSlug: 'checkout',
      builder: async () => "" // WooCommerce gestiona el contenido
    },
    {
      esId: 8,
      enTitle: 'My Account',
      enSlug: 'my-account',
      builder: async () => "" // WooCommerce gestiona el contenido
    },
    {
      esId: 1001,
      enTitle: 'Reviews',
      enSlug: 'reviews',
      builder: async () => getReviewsEnContent()
    },
    {
      esId: 1946,
      enTitle: 'Data Deletion Policy',
      enSlug: 'data-deletion-policy',
      builder: async () => {
        console.log('[FETCH] Obteniendo estructura de Política de Eliminación de Datos (ID 1946)...');
        const res = await wp.client.get('/wp/v2/pages/1946?context=edit');
        return getDataDeletionEnContent(res.data.content.raw);
      }
    }
  ];

  for (const page of wooTranslationsConfig) {
    console.log(`\n-----------------------------------------------------------------`);
    console.log(`[PROCESANDO] "${page.enTitle}" (Origen ES ID: ${page.esId})`);
    console.log(`-----------------------------------------------------------------`);

    try {
      // 1. Generar el contenido traducido
      const enContent = await page.builder();

      // 2. Verificar existencia para idempotencia
      console.log(`[REST] Comprobando si existe traducción EN con slug "${page.enSlug}"...`);
      const searchRes = await wp.client.get(`/wp/v2/pages?slug=${page.enSlug}&lang=en`);
      
      let targetId = null;

      if (searchRes.data && searchRes.data.length > 0) {
        targetId = searchRes.data[0].id;
        console.log(`⚠️ Encontrada página EN existente (ID: ${targetId}). Actualizando contenido...`);
        
        await wp.client.post(`/wp/v2/pages/${targetId}`, {
          content: enContent,
          title: page.enTitle,
          status: 'publish',
          lang: 'en',
          meta: {
            _pll_language: 'en'
          }
        });
        console.log(`✅ Página actualizada exitosamente.`);
      } else {
        console.log(`[REST] Creando nueva página EN en WordPress...`);
        const createRes = await wp.client.post('/wp/v2/pages', {
          title: page.enTitle,
          slug: page.enSlug,
          status: 'publish',
          content: enContent,
          lang: 'en',
          meta: {
            _pll_language: 'en'
          }
        });

        targetId = createRes.data.id;
        console.log(`✅ Página creada exitosamente con ID: ${targetId}`);
      }

      // 3. Vincular hermanos Polylang nativos (Vía Plugin v1.0.4)
      console.log(`[REST] Sincronizando traducciones en Polylang (ES ID ${page.esId} <-> EN ID ${targetId})...`);
      
      await wp.client.post(`/wp/v2/pages/${targetId}`, {
        translations: {
          es: page.esId,
          en: targetId
        }
      });

      console.log(`✅ Vinculación Polylang completada.`);
      console.log(`🔗 Enlace: https://cmcbelleza.shop/en/${page.enSlug}`);

    } catch (error: any) {
      const errDetails = error.response?.data?.message || error.message;
      console.error(`❌ Fallo en la traducción de "${page.enTitle}": ${errDetails}`);
    }
  }

  console.log('\n🏁 Proceso finalizado con éxito.');
}

run();
