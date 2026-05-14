import React from 'react';
import Image from 'next/image';
import { TextImageBlockData } from '@/lib/cms';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1000&q=80';

export default function TextImageBlock({ data }: { data: TextImageBlockData }) {
  // Ocultar si falta título y contenido completo
  if (!data.title && !data.content) return null;

  const isImageLeft = data.image_position === 'left';
  const imageSrc = data.image || DEFAULT_IMAGE;

  return (
    <section className="w-full py-16 md:py-24 bg-background overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">
        
        {/* Image Column */}
        <div className={`lg:col-span-6 w-full relative ${isImageLeft ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}`}>
          <div className="relative aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-xl shadow-primary/5 border border-surface-container">
            <Image
              src={imageSrc}
              alt={data.title || 'Imagen destacada'}
              fill
              className="object-cover hover:scale-[1.02] transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Text Content Column */}
        <div className={`lg:col-span-6 flex flex-col justify-center ${isImageLeft ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}`}>
          {data.title && (
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary leading-tight font-medium mb-6 line-clamp-3">
              {data.title}
            </h2>
          )}

          {data.content && (
            <div 
              // wp-content global wrapper handles fonts, paragraph styles and legacy tags cleanly
              className="wp-content prose prose-slate prose-stone max-w-none text-on-surface-variant leading-relaxed font-sans font-normal line-clamp-[10]"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          )}
        </div>

      </div>
    </section>
  );
}
