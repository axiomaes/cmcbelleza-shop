import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeroBlockData } from '@/lib/cms';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1600&q=80';

export default function HeroBlock({ data }: { data: HeroBlockData }) {
  // Ocultar si no hay información base
  if (!data.title && !data.image) return null;

  const bgImage = data.image || DEFAULT_IMAGE;
  const overlayOpacity = (data.overlay_opacity ?? 40) / 100;

  return (
    <section className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center bg-primary-container overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={data.title || 'Hero CMC Belleza'}
          fill
          priority
          className="object-cover object-center transition-transform duration-700 hover:scale-105"
          sizes="100vw"
        />
        {/* Tint Overlay controlled via SCF value */}
        <div 
          className="absolute inset-0 bg-primary/60 mix-blend-multiply"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-margin-mobile md:px-margin-desktop text-white py-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {data.title && (
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium mb-6 leading-tight tracking-tight drop-shadow-md">
            {/* Truncado de seguridad en UI por si burlan límites de ACF */}
            <span className="line-clamp-3 block max-w-3xl mx-auto">
              {data.title}
            </span>
          </h1>
        )}

        {data.subtitle && (
          <p className="font-sans text-base md:text-lg lg:text-xl font-light opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed text-surface-container-lowest drop-shadow-sm line-clamp-4">
            {data.subtitle}
          </p>
        )}

        {data.cta_text && data.cta_url && (
          <div className="flex justify-center animate-in fade-in duration-1000 delay-300">
            <Link 
              href={data.cta_url}
              className="inline-block bg-white text-primary hover:bg-surface-container-lowest font-sans font-bold text-xs md:text-sm tracking-[0.25em] uppercase px-10 py-4 rounded-full shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {/* Clamped CTA limit 20 */}
              <span className="line-clamp-1">{data.cta_text.substring(0, 25)}</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
