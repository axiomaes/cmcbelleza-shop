import React from 'react';
import Image from 'next/image';
import { getDictionary, Locale } from '@/lib/get-dictionary';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tips & Rutinas',
  description: 'Guía interactiva para el cuidado de la piel y rutinas de belleza natural.',
};

const routineImages = [
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
  "https://images.unsplash.com/photo-1570172619997-d79f52e19a3c?w=800&q=80"
];

interface TipsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TipsPage({ params }: TipsPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  
  return (
    <main className="min-h-screen bg-background pt-20 pb-section-gap font-sans">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Hero Tips Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">{dict.tips.hero_badge}</span>
          <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 leading-tight">{dict.tips.hero_title}</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            {dict.tips.hero_desc}
          </p>
        </div>

        {/* Interactive Selection Section */}
        <section className="mb-section-gap">
          <div className="bg-surface-container-low rounded-3xl p-8 md:p-12 border border-outline-variant/20 text-center">
            <h2 className="font-serif text-3xl text-primary mb-4">{dict.tips.finder_title}</h2>
            <p className="text-on-surface-variant mb-8">{dict.tips.finder_desc}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(dict.tips.skin_types).map(([key, label]) => (
                <button key={key} className="px-6 py-3 bg-white rounded-full border border-outline-variant/30 hover:border-primary hover:text-primary font-medium text-sm transition-all shadow-sm hover:shadow-md">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Routines Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {dict.tips.routines.map((routine: any, idx: number) => (
            <div key={idx} className="group relative bg-white rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="relative h-64 w-full">
                <Image 
                  src={routineImages[idx] || routineImages[0]} 
                  alt={routine.title} 
                  fill 
                  className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="font-serif text-2xl md:text-3xl mb-1">{routine.title}</h3>
                  <p className="text-white/80 text-sm">{routine.desc}</p>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-6">{dict.tips.ritual_steps}</h4>
                <ul className="space-y-4">
                  {routine.steps.map((step: string, sidx: number) => (
                    <li key={sidx} className="flex items-center gap-4 text-on-surface font-medium text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-fixed text-primary text-xs flex items-center justify-center font-bold">
                        {sidx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
                <button className="mt-8 w-full py-3 border border-primary text-primary font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-primary hover:text-white transition-all">
                  {dict.tips.btn_view_products}
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
