import { WordPressService } from '../src/services/wordpress.service.js';

const wp = new WordPressService();

// ============================================================================
// TRADUCCIONES EXACTAS PARA EL CONTENIDO RAW DE CONTACTO (985)
// ============================================================================
const getContactEnContent = (rawEs: string): string => {
  let en = rawEs;

  // 1. Títulos y cabeceras del bloque Kadence
  en = en.replace(
    /<h2 class="kt-adv-heading985_dbb8f1-bc wp-block-kadence-advancedheading" data-kb-block="kb-adv-heading985_dbb8f1-bc">Contacto<\/h2>/g,
    '<h2 class="kt-adv-heading985_dbb8f1-bc wp-block-kadence-advancedheading" data-kb-block="kb-adv-heading985_dbb8f1-bc">Contact</h2>'
  );

  en = en.replace(
    /¿Tienes alguna duda o necesitas más información sobre nuestros productos\?<br>Estamos aquí para ayudarte y acompañarte en lo que necesites\./g,
    'Do you have any questions or need more information about our products?<br>We are here to help and accompany you with whatever you need.'
  );

  en = en.replace(
    /¿Tienes alguna pregunta\?<br>Contáctanos!/g,
    'Do you have any questions?<br>Contact us!'
  );

  en = en.replace(
    /En <strong>CMC Belleza<\/strong> queremos que tu experiencia sea clara y sencilla\./g,
    'At <strong>CMC Belleza</strong> we want your experience to be clear and simple.'
  );

  en = en.replace(
    /Si necesitas información sobre nuestros productos, envíos o procesos, no dudes en ponerte en contacto con nosotros\./g,
    'If you need information about our products, shipping or processes, do not hesitate to contact us.'
  );

  en = en.replace(
    /Nuestro equipo te responderá lo antes posible para ayudarte a elegir con tranquilidad los productos que mejor encajen contigo\./g,
    'Our team will respond as soon as possible to help you choose the products that best fit you with ease.'
  );

  en = en.replace(
    /Descubre novedades, consejos y lanzamientos siguiendo a CMC Belleza en nuestras redes sociales/g,
    'Discover news, tips and launches by following CMC Belleza on our social networks'
  );

  en = en.replace(
    /Siguenos:/g,
    'Follow us:'
  );

  // 2. Localización de Formulario Kadence (placeholders y etiquetas de schema json)
  en = en.replace(/"placeholder":"Tu nombre"/g, '"placeholder":"Your name"');
  en = en.replace(/placeholder="Tu nombre"/g, 'placeholder="Your name"');

  en = en.replace(/"placeholder":"Correo Electronico"/g, '"placeholder":"Email"');
  en = en.replace(/placeholder="Correo Electronico"/g, 'placeholder="Email"');

  en = en.replace(/"placeholder":"Telefono"/g, '"placeholder":"Phone"');
  en = en.replace(/placeholder="Telefono"/g, 'placeholder="Phone"');

  en = en.replace(/"placeholder":"Comentario"/g, '"placeholder":"Subject"');
  en = en.replace(/placeholder="Comentario"/g, 'placeholder="Subject"');

  en = en.replace(/"placeholder":"Tu mensaje"/g, '"placeholder":"Your message"');
  en = en.replace(/placeholder="Tu mensaje"/g, 'placeholder="Your message"');

  // 3. InfoBoxes de pie de página (Correo, Dirección, Teléfono)
  en = en.replace(
    /<h6 class="kt-blocks-info-box-title">Correo<\/h6>/g,
    '<h6 class="kt-blocks-info-box-title">Email</h6>'
  );

  en = en.replace(
    /<h6 class="kt-blocks-info-box-title">DIreccion<\/h6>/g,
    '<h6 class="kt-blocks-info-box-title">Address</h6>'
  );
  
  en = en.replace(
    /<p class="kt-blocks-info-box-text">Appenzell, SUIZA<\/p>/g,
    '<p class="kt-blocks-info-box-text">Appenzell, Switzerland</p>'
  );

  return en;
};

// ============================================================================
// CONSTRUCCIÓN DE CONTENIDO BLOG (1779)
// ============================================================================
const getBlogEnContent = (): string => {
  return `<!-- wp:paragraph -->
<p>Latest news and trends from CMC Belleza</p>
<!-- /wp:paragraph -->

<!-- wp:kadence/posts {"uniqueID":"blog_en_posts_grid"} /-->`;
};

// ============================================================================
// FLUJO PRINCIPAL DE EJECUCIÓN
// ============================================================================
async function run() {
  console.log('🌐 Iniciando creación de traducciones en Inglés via WordPress REST API...\n');

  // Comprobar conexión
  const connTest = await wp.testConnection();
  if (!connTest.success) {
    console.error(`❌ Error de conectividad WordPress: ${connTest.error}`);
    process.exit(1);
  }
  console.log(`✅ Conexión establecida correctamente como: ${connTest.username}\n`);

  // Configuración del lote de páginas a traducir
  const translationsConfig = [
    {
      esId: 985,
      esSlug: 'contact',
      enTitle: 'Contact',
      enSlug: 'contact', // El mismo slug para idiomas diferentes es soportado gracias a Polylang
      builder: async () => {
        console.log('[FETCH] Extrayendo contenido RAW de la página de Contacto ES (ID 985)...');
        const res = await wp.client.get('/wp/v2/pages/985?context=edit');
        return getContactEnContent(res.data.content.raw);
      }
    },
    {
      esId: 1779,
      esSlug: 'blog',
      enTitle: 'Blog',
      enSlug: 'blog',
      builder: async () => {
        console.log('[BUILD] Construyendo estructura de Blog EN...');
        return getBlogEnContent();
      }
    }
  ];

  for (const page of translationsConfig) {
    console.log(`\n-----------------------------------------------------------------`);
    console.log(`[PROCESO] Traduciendo página: "${page.enTitle}" (Origen ES: ID ${page.esId})`);
    console.log(`-----------------------------------------------------------------`);

    try {
      // 1. Preparar contenido
      const enContent = await page.builder();

      // 2. Verificar si ya existe una página con ese título o slug en idioma inglés
      // Haremos una consulta filtrando por idioma 'en' para evitar colisiones idempotentes
      console.log(`[REST] Buscando si ya existe la traducción EN con slug "${page.enSlug}"...`);
      const searchRes = await wp.client.get(`/wp/v2/pages?slug=${page.enSlug}&lang=en`);
      
      let targetId = null;

      if (searchRes.data && searchRes.data.length > 0) {
        targetId = searchRes.data[0].id;
        console.log(`⚠️ Encontrada página EN existente (ID: ${targetId}). Procediendo con la ACTUALIZACIÓN (Idempotente).`);
        
        // ACTUALIZAR página existente
        await wp.client.post(`/wp/v2/pages/${targetId}`, {
          content: enContent,
          title: page.enTitle,
          status: 'publish',
          lang: 'en', // Módulo REST Hook 4
          meta: {
            _pll_language: 'en' // Fallback compatibilidad
          }
        });
        console.log(`✅ Página EN actualizada correctamente.`);
      } else {
        // CREAR nueva página
        console.log(`[REST] Creando nueva página EN en WordPress...`);
        const createRes = await wp.client.post('/wp/v2/pages', {
          title: page.enTitle,
          slug: page.enSlug,
          status: 'publish',
          content: enContent,
          lang: 'en', // Módulo REST Hook 4
          meta: {
            _pll_language: 'en' // Fallback compatibilidad
          }
        });

        targetId = createRes.data.id;
        console.log(`✅ Página EN creada exitosamente con ID: ${targetId}`);
      }

      // 3. Vincular traducciones cruzadas (Sincronización de hermanos Polylang)
      // Hacemos uso de nuestro nuevo Hook 4: register_rest_field ('translations') con update_callback habilitado.
      console.log(`[REST] Vinculando traducciones (ES ID ${page.esId} <-> EN ID ${targetId})...`);
      
      await wp.client.post(`/wp/v2/pages/${targetId}`, {
        translations: {
          es: page.esId,
          en: targetId
        }
      });
      
      console.log(`✅ Vinculación y sincronización Polylang completada satisfactoriamente.`);
      console.log(`🔗 Enlace de vista previa: https://cmcbelleza.shop/en/${page.enSlug}`);

    } catch (error: any) {
      const errDetails = error.response?.data?.message || error.message;
      console.error(`❌ Fallo en el procesamiento de la traducción para "${page.enTitle}": ${errDetails}`);
    }
  }

  console.log('\n🏁 Proceso de traducción finalizado.');
}

run();
