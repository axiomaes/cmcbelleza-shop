'use client';
import { useEffect, useState } from 'react';

export default function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Elemento Orgánico 1 (Hoja izquierda) */}
      <div 
        className="absolute top-[10%] left-[-5%] text-primary/10 opacity-30 md:opacity-50 transition-transform duration-75 ease-out"
        style={{ transform: `translateY(${scrollY * 0.4}px) rotate(${scrollY * 0.05}deg)` }}
      >
        <svg width="250" height="250" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6.5l4.25 4.25-1.42 1.42L11 13.5V7z" opacity="0" />
          <path d="M17 8C8 10 5.5 13.5 5.5 19c0 0 .5-6 6-8.5C14.5 9 17 8 17 8z" />
          <path d="M12 2C8 6 6 12 6 12c4 0 6-6 6-10z" opacity="0.7"/>
        </svg>
      </div>

      {/* Elemento Orgánico 2 (Gota derecha) */}
      <div 
        className="absolute top-[40%] right-[-2%] text-secondary/20 opacity-40 md:opacity-60 transition-transform duration-75 ease-out"
        style={{ transform: `translateY(${scrollY * -0.2}px) rotate(${scrollY * -0.02}deg) scale(1.5)` }}
      >
        <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21c-3.87 0-7-3.13-7-7 0-4.5 7-11.5 7-11.5s7 7 7 11.5c0 3.87-3.13 7-7 7zm0-16.14c-1.89 2.22-5 6.44-5 9.14 0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.7-3.11-6.92-5-9.14z"/>
        </svg>
      </div>

      {/* Elemento Orgánico 3 (Hoja suave abajo centro) */}
      <div 
        className="absolute top-[80%] left-[30%] text-primary/5 opacity-40 md:opacity-60 transition-transform duration-75 ease-out"
        style={{ transform: `translateY(${scrollY * 0.15}px) rotate(${45 + scrollY * 0.03}deg) scale(2)` }}
      >
        <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.5 13.5 5.5 19c0 0 .5-6 6-8.5C14.5 9 17 8 17 8z" />
        </svg>
      </div>
    </div>
  );
}
