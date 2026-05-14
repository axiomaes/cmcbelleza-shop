import React from 'react';

export interface FeatureItem {
  feature_1_icon?: string;
  feature_1_title?: string;
  feature_1_desc?: string;
  // Soporte para feature_2 o genérico icon/title/desc
  icon?: string;
  title?: string;
  desc?: string;
}

export interface FeaturesBlockProps {
  title?: string;
  features: FeatureItem[];
}

export default function FeaturesBlock({ title, features }: FeaturesBlockProps) {
  // Filtrar items vacíos
  const activeFeatures = features.filter(f => f.title || f.feature_1_title);
  if (activeFeatures.length === 0) return null;

  return (
    <section className="py-20 md:py-24 bg-white text-on-surface relative overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 font-sans">
        
        {/* Optional Grid Header */}
        {title && (
          <div className="text-center max-w-xl mx-auto mb-12 md:mb-16 flex flex-col items-center">
            <span className="text-secondary font-bold text-xs uppercase tracking-[0.25em] mb-3">
              Nuestro Compromiso
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium leading-tight line-clamp-2">
              {title}
            </h2>
          </div>
        )}

        {/* 3-Column Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-center">
          {activeFeatures.map((item, index) => {
            // Adaptador de nomenclatura de ACF groups anidados vs plano
            const icon = item.icon || item.feature_1_icon || 'spa';
            const t = item.title || item.feature_1_title;
            const d = item.desc || item.feature_1_desc;

            return (
              <div 
                key={index} 
                className="flex flex-col items-center p-6 rounded-xl hover:bg-surface-container-lowest transition-colors duration-500 animate-in fade-in duration-1000"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Elegant Circle Icon Carrier */}
                <div className="w-16 h-16 rounded-full bg-surface-container text-primary flex items-center justify-center mb-6 shadow-inner hover:bg-primary hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-[32px]">
                    {icon}
                  </span>
                </div>

                <h3 className="font-serif text-xl md:text-2xl text-primary font-medium mb-3 line-clamp-2">
                  {t}
                </h3>

                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed font-normal line-clamp-4 max-w-xs mx-auto">
                  {d}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
