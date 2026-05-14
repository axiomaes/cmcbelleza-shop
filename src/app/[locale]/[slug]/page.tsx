import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageContent } from '@/lib/cms';
import DynamicPage from '@/components/DynamicPage';

// Bloques reutilizables para presets estáticos de Plantilla
import HeroBlock from '@/components/blocks/HeroBlock';
import FeaturesBlock from '@/components/blocks/FeaturesBlock';
import TextImageBlock from '@/components/blocks/TextImageBlock';

// Habilitar Regeneración Estática Incremental (ISR) de 1 hora (Módulo 3D)
export const revalidate = 3600; 

// Permitir solicitudes de slugs dinámicos bajo demanda
export const dynamicParams = true;

interface PageParams {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

/**
 * Generación de Metadatos SEO Dinámicos desde los campos SCF/ACF
 */
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Intentar cargar data
  const pageData = await getPageContent(slug, locale);
  
  if (!pageData) {
    return {
      title: 'Página no encontrada | CMC Belleza',
    };
  }

  // Mapeo inteligente del título
  let seoTitle = pageData.title ? `${pageData.title} | CMC Belleza` : 'CMC Belleza';
  let seoDesc = 'Descubre la alta cosmética orgánica de CMC Belleza.';

  // Sobreescribir con campos ACF si existen en plantillas conocidas
  const acf = pageData.acf;
  if (acf) {
    if (acf.hero_title) seoTitle = `${acf.hero_title} | CMC Belleza`;
    if (acf.about_title) seoTitle = `${acf.about_title} | CMC Belleza`;
    if (acf.hero_subtitle) seoDesc = acf.hero_subtitle;
    if (acf.about_subtitle) seoDesc = acf.about_subtitle;
  }

  return {
    title: seoTitle,
    description: seoDesc.substring(0, 160),
    openGraph: {
      title: seoTitle,
      description: seoDesc.substring(0, 160),
      type: 'article',
    }
  };
}

/**
 * Slugs estáticos pre-renderizados conocidos para agilizar primer TTI
 */
export async function generateStaticParams() {
  // Slugs recurrentes que garantizamos en el build
  return [
    { locale: 'es', slug: 'nosotros' },
    { locale: 'en', slug: 'about' },
    { locale: 'es', slug: 'contacto' }
  ];
}

export default async function Page({ params }: PageParams) {
  const { locale, slug } = await params;
  
  // MÓDULO 5: Intento de Fetch con fallback automático ES incluido en la lib
  const pageData = await getPageContent(slug, locale);

  // MÓDULO 5: Si tras el fallback sigue devolviendo null, lanzamos 404 localizado nativo
  if (!pageData) {
    notFound();
  }

  const acf = pageData.acf;
  const template = pageData.template || '';

  // ==========================================================================
  // 1. TEMPLATE: PLANTILLA CMC ABOUT (page-about)
  // ==========================================================================
  if (template === 'template-about.php') {
    // Convertir los 3 valores en el formato del grid de FeaturesBlock
    const valuesGrid = [
      { title: acf.value_1?.value_1_title, desc: acf.value_1?.value_1_desc, icon: 'spa' },
      { title: acf.value_2?.value_2_title, desc: acf.value_2?.value_2_desc, icon: 'verified' },
      { title: acf.value_3?.value_3_title, desc: acf.value_3?.value_3_desc, icon: 'favorite' }
    ].filter(item => item.title);

    return (
      <main className="w-full">
        {/* About Hero */}
        <HeroBlock 
          data={{
            acf_fc_layout: 'hero_banner',
            title: acf.about_title || pageData.title,
            subtitle: acf.about_subtitle || '',
            image: acf.about_image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1600&q=80',
            overlay_opacity: 30
          }} 
        />

        {/* Historia 50/50 dynamic rendering */}
        {(acf.story_title || acf.story_content) && (
          <TextImageBlock 
            data={{
              acf_fc_layout: 'text_image',
              title: acf.story_title || 'Nuestra Historia',
              content: acf.story_content || '',
              image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=1000&q=80',
              image_position: 'right'
            }}
          />
        )}

        {/* Valores Grid */}
        {valuesGrid.length > 0 && (
          <FeaturesBlock 
            title="Nuestros Valores Core" 
            features={valuesGrid} 
          />
        )}
      </main>
    );
  }

  // ==========================================================================
  // 2. TEMPLATE: PLANTILLA CMC HOME (page-home)
  // ==========================================================================
  if (template === 'template-home.php') {
    const homeFeatures = [
      { icon: acf.feature_1?.feature_1_icon, title: acf.feature_1?.feature_1_title, desc: acf.feature_1?.feature_1_desc },
      { icon: acf.feature_2?.feature_2_icon, title: acf.feature_2?.feature_2_title, desc: acf.feature_2?.feature_2_desc },
      { icon: acf.feature_3?.feature_3_icon, title: acf.feature_3?.feature_3_title, desc: acf.feature_3?.feature_3_desc },
    ];

    return (
      <main className="w-full">
        {/* Home Hero Section */}
        <HeroBlock 
          data={{
            acf_fc_layout: 'hero_banner',
            title: acf.hero_title || pageData.title,
            subtitle: acf.hero_subtitle || '',
            image: acf.hero_image || 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1600&q=80',
            cta_text: acf.hero_cta_text || 'Explorar',
            cta_url: acf.hero_cta_url || `/${locale}/tienda`,
            overlay_opacity: 40
          }} 
        />

        {/* Features Grid */}
        <FeaturesBlock 
          title={acf.features_title || 'Rituales Conscientes'} 
          features={homeFeatures} 
        />

        {/* Promo Banner condicional (Módulo 1A) */}
        {acf.banner_active && acf.banner_title && (
          <div className="relative w-full min-h-[300px] py-20 bg-cover bg-center text-white flex items-center justify-center overflow-hidden" style={{ backgroundImage: acf.banner_image ? `url(${acf.banner_image})` : 'none', backgroundColor: '#7f5700' }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
            <div className="relative z-10 px-6 max-w-2xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl mb-6 leading-tight">{acf.banner_title}</h2>
              {acf.banner_cta_text && acf.banner_cta_url && (
                <a href={acf.banner_cta_url} className="inline-block bg-white text-primary font-bold text-xs tracking-widest uppercase px-8 py-3.5 rounded-full shadow-lg hover:-translate-y-0.5 transition-transform">
                  {acf.banner_cta_text}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Collections Section */}
        {(acf.collections_title || acf.collections_subtitle) && (
          <section className="py-20 bg-surface-container-lowest text-center px-6 border-t border-surface-container">
            <h2 className="font-serif text-3xl md:text-5xl text-primary mb-4 leading-tight">{acf.collections_title}</h2>
            <p className="text-on-surface-variant max-w-lg mx-auto leading-relaxed">{acf.collections_subtitle}</p>
          </section>
        )}
      </main>
    );
  }

  // ==========================================================================
  // 3. TEMPLATE: CUALQUIER OTRA / PLANTILLA FLEXIBLE (Mapeado nativo del Renderer)
  // ==========================================================================
  return (
    <main className="w-full">
      <DynamicPage 
        blocks={acf.flexible_blocks} 
        locale={locale} 
      />
    </main>
  );
}
