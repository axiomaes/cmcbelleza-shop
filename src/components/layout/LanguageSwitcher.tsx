'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LanguageSwitcher() {
  const pathname = usePathname();

  // Dividir la ruta para detectar el locale actual
  const segments = pathname ? pathname.split('/') : [];
  // pathname inicial suele ser '/es/tienda' => ['', 'es', 'tienda']
  const currentLocale = segments[1] === 'en' ? 'en' : 'es';

  const getTranslatedPath = (targetLocale: string) => {
    if (!pathname) return `/${targetLocale}`;
    const newSegments = [...segments];
    
    // Reemplazar el segmento del idioma (por ejemplo, segments[1])
    // Si por alguna razón no existe segmento 1, agregarlo
    if (newSegments.length > 1) {
      newSegments[1] = targetLocale;
    } else {
      newSegments.push(targetLocale);
    }
    
    return newSegments.join('/') || `/${targetLocale}`;
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded-full text-xs font-semibold tracking-wider text-on-surface-variant shadow-sm">
      <Link 
        href={getTranslatedPath('es')} 
        className={`px-2.5 py-1 rounded-full transition-all ${currentLocale === 'es' ? 'bg-primary text-white shadow-sm scale-105' : 'hover:text-primary opacity-70 hover:opacity-100'}`}
        scroll={false}
      >
        ES
      </Link>
      <span className="text-outline opacity-20 select-none text-[10px]">|</span>
      <Link 
        href={getTranslatedPath('en')} 
        className={`px-2.5 py-1 rounded-full transition-all ${currentLocale === 'en' ? 'bg-primary text-white shadow-sm scale-105' : 'hover:text-primary opacity-70 hover:opacity-100'}`}
        scroll={false}
      >
        EN
      </Link>
    </div>
  );
}
