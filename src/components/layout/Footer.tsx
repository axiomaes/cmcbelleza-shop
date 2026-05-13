import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDictionary, Locale } from '@/lib/get-dictionary';

interface FooterProps {
  locale?: string;
}

const Footer = async ({ locale = 'es' }: FooterProps) => {
  const dict = await getDictionary(locale as Locale);

  return (
    <footer className="bg-[#1e2f19] text-surface-container-lowest border-t border-outline-variant/10 mt-section-gap font-sans">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Branding Column */}
          <div className="md:col-span-5 flex flex-col space-y-6">
            <Link href={`/${locale}`} className="flex items-center gap-3 group/logo w-fit">
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
              {dict.footer.description}
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
            <h3 className="text-secondary-fixed font-bold text-xs uppercase tracking-[0.2em] mb-6">{dict.footer.explore}</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href={`/${locale}`} className="text-white/80 hover:text-white transition-colors">{dict.header.home}</Link></li>
              <li><Link href={`/${locale}/tienda`} className="text-white/80 hover:text-white transition-colors">{dict.header.shop}</Link></li>
              <li><Link href={`/${locale}/blog`} className="text-white/80 hover:text-white transition-colors">{dict.header.blog}</Link></li>
              <li><Link href={`/${locale}/tips`} className="text-white/80 hover:text-white transition-colors">{dict.header.tips}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-secondary-fixed font-bold text-xs uppercase tracking-[0.2em] mb-6">{dict.footer.legal}</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href={`/${locale}/info/aviso-legal`} className="text-white/80 hover:text-white transition-colors">{dict.footer.notice}</Link></li>
              <li><Link href={`/${locale}/info/politica-privacidad`} className="text-white/80 hover:text-white transition-colors">{dict.footer.privacy}</Link></li>
              <li><Link href={`/${locale}/info/politica-cookies`} className="text-white/80 hover:text-white transition-colors">{dict.footer.cookies}</Link></li>
              <li><Link href={`/${locale}/info/terminos-y-condiciones-de-compra`} className="text-white/80 hover:text-white transition-colors">{dict.footer.terms}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-secondary-fixed font-bold text-xs uppercase tracking-[0.2em] mb-6">{dict.footer.contact}</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3 text-white/80">
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed">mail</span>
                <a href="mailto:hola@cmcbelleza.shop" className="hover:text-white transition-colors">hola@cmcbelleza.shop</a>
              </li>
              <li className="flex items-start gap-3 text-white/80">
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed">call</span>
                <span>{dict.footer.hours}</span>
              </li>
              <li className="flex items-start gap-3 text-white/80">
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed">location_on</span>
                <span>{dict.footer.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
            &copy; {new Date().getFullYear()} CMC Belleza. {dict.footer.slogan}
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
