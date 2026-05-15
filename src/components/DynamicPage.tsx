import React from 'react';
import { FlexibleBlock } from '@/lib/cms';

// Importación directa de bloques de componentes para resolver en Server Components
import HeroBlock from './blocks/HeroBlock';
import TextImageBlock from './blocks/TextImageBlock';
import ProductsGridBlock from './blocks/ProductsGridBlock';
import CtaBannerBlock from './blocks/CtaBannerBlock';
import TestimonialBlock from './blocks/TestimonialBlock';

// Mapeo centralizado del constructor de bloques (Módulo 3C)
const blockComponents: { [key: string]: React.ComponentType<any> } = {
  'hero_banner': HeroBlock,
  'text_image': TextImageBlock,
  'products_grid': ProductsGridBlock,
  'cta_banner': CtaBannerBlock,
  'testimonial': TestimonialBlock,
};

interface DynamicPageProps {
  blocks?: FlexibleBlock[];
  locale?: string;
}

export default function DynamicPage({ blocks = [], locale = 'es' }: DynamicPageProps) {
  
  // Sanitización preventiva: si no vienen bloques o viene vacío, avisar amigablemente
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return (
      <div className="w-full py-32 text-center text-on-surface-variant italic font-sans border border-dashed border-surface-container max-w-md mx-auto my-12 rounded-xl">
        <span className="material-symbols-outlined text-[48px] mb-2 opacity-40">dashboard_customize</span>
        <p className="text-sm">
          {locale === 'en' 
            ? "This flexible page doesn't contain published blocks yet." 
            : "Esta página flexible no contiene bloques publicados aún."}
        </p>
      </div>
    );
  }

  return (
    <article className="w-full flex flex-col min-h-screen bg-background overflow-x-hidden">
      {blocks.map((block, index) => {
        const layoutType = block.acf_fc_layout;
        const Component = blockComponents[layoutType];

        if (!Component) {
          console.warn(`[CMS Renderer] Bloque no soportado o no registrado: "${layoutType}"`);
          return null; // Ignorar de forma silenciosa y segura en producción
        }

        // Generar key única determinista
        const uniqueKey = `${layoutType}-${index}`;

        return (
          <Component 
            key={uniqueKey} 
            data={block} 
            locale={locale} 
          />
        );
      })}
    </article>
  );
}
