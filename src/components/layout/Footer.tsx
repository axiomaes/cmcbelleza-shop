import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-[#1e2f19] text-surface-container-lowest border-t border-outline-variant/10 mt-section-gap font-sans">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Branding Column */}
          <div className="md:col-span-5 flex flex-col space-y-6">
            <Link href="/" className="flex items-center gap-3 group/logo w-fit">
              <Image
                src="/logo.png"
                alt="Logo CMC Belleza"
                width={44}
                height={44}
                className="h-10 w-auto object-contain brightness-0 invert opacity-90 group-hover/logo:scale-105 transition-transform duration-300"
              />
              <span className="text-2xl font-serif font-bold tracking-wider text-white">
                CMC BELLEZA
              </span>
            </Link>
            <p className="text-white/70 text-base max-w-sm font-medium leading-relaxed">
              Fusionando la ciencia cosmética con la pureza botánica para potenciar la integridad de tu piel.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                <span className="material-symbols-outlined text-[20px]">camera_alt</span>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2">
            <h3 className="text-secondary-fixed font-bold text-xs uppercase tracking-[0.2em] mb-6">Explorar</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/" className="text-white/80 hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/tienda" className="text-white/80 hover:text-white transition-colors">Tienda</Link></li>
              <li><Link href="/blog" className="text-white/80 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/tips" className="text-white/80 hover:text-white transition-colors">Tips & Rutinas</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-secondary-fixed font-bold text-xs uppercase tracking-[0.2em] mb-6">Legal</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/info/aviso-legal" className="text-white/80 hover:text-white transition-colors">Aviso Legal</Link></li>
              <li><Link href="/info/politica-privacidad" className="text-white/80 hover:text-white transition-colors">Privacidad</Link></li>
              <li><Link href="/info/politica-cookies" className="text-white/80 hover:text-white transition-colors">Cookies</Link></li>
              <li><Link href="/info/terminos-condiciones" className="text-white/80 hover:text-white transition-colors">Términos</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-secondary-fixed font-bold text-xs uppercase tracking-[0.2em] mb-6">Contacto</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3 text-white/80">
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed">mail</span>
                <a href="mailto:hola@cmcbelleza.shop" className="hover:text-white transition-colors">hola@cmcbelleza.shop</a>
              </li>
              <li className="flex items-start gap-3 text-white/80">
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed">call</span>
                <span>Atención al cliente: Lunes a Viernes</span>
              </li>
              <li className="flex items-start gap-3 text-white/80">
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed">location_on</span>
                <span>Madrid, España</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
            &copy; {new Date().getFullYear()} CMC Belleza. Pureza científica, belleza natural.
          </p>
          <div className="text-xs text-white/30">
            Desarrollado con excelencia.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
