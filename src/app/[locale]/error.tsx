'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import es from '@/messages/es.json';
import en from '@/messages/en.json';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  
  // Seleccionar diccionario estático en el cliente
  const dict = locale === 'en' ? en.errors : es.errors;

  useEffect(() => {
    // Monitorización o logeo del error
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-24 md:py-32 bg-surface">
      <div className="max-w-lg w-full text-center flex flex-col items-center backdrop-blur-sm bg-white/40 border border-outline-variant/20 rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden animate-fade-in">
        {/* Orbes decorativos sutiles */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-error/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-error/5 rounded-full blur-3xl"></div>
        
        <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center text-error mb-6 relative z-10">
          <span className="material-symbols-outlined text-5xl">warning_amber</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif text-on-surface font-semibold tracking-tight mb-4 relative z-10">
          {dict.generic_title}
        </h1>
        
        <p className="text-dark-muted text-base md:text-lg leading-relaxed mb-8 max-w-sm relative z-10">
          {dict.generic_desc}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
          {/* Botón de Reintento */}
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center bg-primary text-white hover:bg-primary/90 px-8 py-4 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <span className="material-symbols-outlined mr-2 text-lg md:text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
            {dict.retry}
          </button>

          {/* Botón Volver */}
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center bg-surface-container-highest text-on-surface hover:bg-surface-container-high border border-outline-variant/30 px-8 py-4 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider shadow-sm hover:shadow transform hover:-translate-y-0.5 transition-all duration-300"
          >
            {dict.back_home}
          </Link>
        </div>
      </div>
    </div>
  );
}
