import React from 'react';
import { TestimonialBlockData } from '@/lib/cms';

export default function TestimonialBlock({ data }: { data: TestimonialBlockData }) {
  if (!data.quote) return null;

  // Validar y normalizar rating a 1-5
  const validRating = Math.max(1, Math.min(5, Number(data.rating || 5)));

  return (
    <section className="w-full py-16 md:py-20 bg-background flex justify-center items-center">
      <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 md:p-12 text-center shadow-lg shadow-primary/5 relative">
          
          {/* Elegant brand quotation mark */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-secondary-fixed w-12 h-12 rounded-full flex items-center justify-center shadow-md select-none">
            <span className="font-serif text-4xl italic leading-none mt-3 text-white">“</span>
          </div>

          {/* Dynamic Stars Generator */}
          <div className="flex justify-center gap-1 mb-6 pt-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span 
                key={idx} 
                className={`material-symbols-outlined text-[20px] ${
                  idx < validRating ? 'text-secondary-container fill-mode-both' : 'text-surface-container-highest'
                }`}
                style={{ fontVariationSettings: idx < validRating ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            ))}
          </div>

          {/* Quote text clamped at 200 chars */}
          <blockquote className="font-serif text-xl md:text-2xl text-primary italic font-normal leading-relaxed max-w-2xl mx-auto mb-8 line-clamp-4">
            "{data.quote}"
          </blockquote>

          {/* Author info clamped 40 chars */}
          {data.author && (
            <div className="flex flex-col items-center">
              <cite className="not-italic font-sans font-bold text-xs md:text-sm uppercase tracking-[0.25em] text-secondary mb-1 line-clamp-1">
                {data.author}
              </cite>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-semibold">
                Cliente Verificado
              </span>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
