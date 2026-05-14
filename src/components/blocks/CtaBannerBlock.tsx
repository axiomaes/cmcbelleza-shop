import React from 'react';
import Link from 'next/link';
import { CtaBannerBlockData } from '@/lib/cms';

export default function CtaBannerBlock({ data }: { data: CtaBannerBlockData }) {
  if (!data.title) return null;

  // Fallback seguro de color a la paleta principal de la marca (Bosque CMC)
  const bgColor = data.background_color || '#334f2b';

  return (
    <section 
      className="relative py-20 md:py-24 overflow-hidden w-full text-center text-white"
      style={{ backgroundColor: bgColor }}
    >
      {/* Fine organic paper texture overlay consistent with site aesthetics */}
      <div 
        className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none mix-blend-overlay" 
      />
      
      {/* Ambient radial glow to lift the design and feel premium */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center justify-center animate-in fade-in duration-1000">
        <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mb-6 leading-tight max-w-2xl line-clamp-3 drop-shadow-sm">
          {data.title}
        </h2>

        {data.subtitle && (
          <p className="font-sans font-light text-base md:text-lg text-white/85 max-w-xl mx-auto mb-10 leading-relaxed line-clamp-3">
            {data.subtitle}
          </p>
        )}

        {data.cta_text && data.cta_url && (
          <Link 
            href={data.cta_url}
            className="inline-flex items-center bg-white hover:bg-surface-container-lowest text-on-surface font-sans font-bold text-xs md:text-sm tracking-[0.2em] uppercase px-10 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
            style={{ color: bgColor === '#ffffff' ? '#1b1c1c' : 'inherit' }} // Ajuste básico de contraste si ponen blanco de fondo
          >
            <span className="text-primary line-clamp-1" style={{ color: bgColor }}>
              {data.cta_text}
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
