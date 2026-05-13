"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/store/cartStore';
import MiniCart from '@/components/cart/MiniCart';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  locale?: string;
}

const Header = ({ locale = 'es' }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isEn = locale === 'en';
  const t = {
    home: isEn ? 'Home' : 'Inicio',
    shop: isEn ? 'Shop' : 'Tienda',
    blog: isEn ? 'Blog' : 'Blog',
    tips: isEn ? 'Tips' : 'Tips',
    contact: isEn ? 'Contact' : 'Contacto',
    facial: isEn ? 'Facial Care' : 'Cuidado Facial',
    body: isEn ? 'Body Care' : 'Cuidado Corporal',
    oils: isEn ? 'Serums & Oils' : 'Sérums y Aceites',
    selection: isEn ? 'Selection' : 'Selección',
    rituals: isEn ? 'Special Rituals' : 'Rituales Especiales'
  };

  const cartItemCount = items.reduce((acc: number, item) => acc + item.quantity, 0);

  return (
    <header 
      className={`sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant/20 shadow-sm transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}
    >
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center relative w-full">
        
        <div className="flex-1 flex items-center justify-start shrink-0">
          <Link href={`/${locale}`} className="flex items-center gap-3 group/logo">
            <Image
              src="/logo.png"
              alt="Logo CMC Belleza"
              width={48}
              height={48}
              className="h-10 md:h-12 w-auto object-contain mix-blend-multiply group-hover/logo:scale-105 transition-transform duration-300"
            />
            <span className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-primary">
              CMC BELLEZA
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-1">
          <Link href={`/${locale}`} className="px-4 py-2 rounded-full text-on-surface font-sans font-medium text-sm uppercase tracking-wider transition-all hover:text-primary">
            {t.home}
          </Link>
          
          {/* Tienda Mega Menu Wrapper */}
          <div className="group/menu relative py-4 flex items-center justify-center">
            <Link href={`/${locale}/tienda`} className="px-4 py-2 rounded-full text-on-surface font-sans font-medium text-sm uppercase tracking-wider transition-all hover:text-primary">
              {t.shop}
            </Link>
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[500px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 transform translate-y-2 group-hover/menu:translate-y-0 z-[100] pt-2">
              <div className="bg-white border border-outline-variant/30 shadow-2xl rounded-xl p-6 grid grid-cols-2 gap-6 overflow-hidden">
                <div className="flex flex-col gap-2 relative z-10">
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 pb-2 border-b border-surface-container-high">{t.selection}</h3>
                  <Link href={`/${locale}/categoria/cuidado-facial` as any} className="text-on-surface hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-3">
                    {t.facial}
                  </Link>
                  <Link href={`/${locale}/categoria/cuidado-corporal` as any} className="text-on-surface hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-3">
                    {t.body}
                  </Link>
                  <Link href={`/${locale}/categoria/serums-aceites` as any} className="text-on-surface hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-3">
                    {t.oils}
                  </Link>
                </div>

                <div className="relative rounded-lg overflow-hidden group/item bg-primary/10 aspect-[4/3] shadow-inner">
                  <Image 
                    src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80" 
                    alt="Cuidado de la piel" 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover/item:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-serif text-lg leading-tight font-medium">
                      {t.rituals}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link href={`/${locale}/blog`} className="px-4 py-2 rounded-full text-on-surface font-sans font-medium text-sm uppercase tracking-wider transition-all hover:text-primary">
            {t.blog}
          </Link>
          <Link href={`/${locale}/tips`} className="px-4 py-2 rounded-full text-on-surface font-sans font-medium text-sm uppercase tracking-wider transition-all hover:text-primary">
            {t.tips}
          </Link>
          <Link href={`/${locale}/contacto`} className="px-4 py-2 rounded-full text-on-surface font-sans font-medium text-sm uppercase tracking-wider transition-all hover:text-primary">
            {t.contact}
          </Link>
        </nav>

        <div className="flex items-center space-x-3 relative z-10">
          {/* Language Switcher Toggle */}
          <div className="hidden sm:block mr-1">
            <LanguageSwitcher />
          </div>

          <button 
            className="text-primary hover:text-secondary transition-all p-2" 
            aria-label="Buscar"
          >
            <span className="material-symbols-outlined text-[24px]">search</span>
          </button>

          <button 
            onClick={() => toggleCart()}
            className="relative text-primary hover:text-secondary transition-all p-2" 
            aria-label="Ver carrito"
          >
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>

          <MiniCart />

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-primary p-2 transition-colors" 
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined text-[28px]">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-outline-variant/30 shadow-xl lg:hidden overflow-hidden transition-all duration-300 origin-top animate-in fade-in slide-in-from-top-4 flex flex-col">
            <div className="px-6 py-3 border-b border-surface-container-high flex justify-start">
              <LanguageSwitcher />
            </div>
            <Link href={`/${locale}`} onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-on-surface font-sans font-medium tracking-wider border-b border-surface-container-high hover:bg-surface-container-low">{t.home.toUpperCase()}</Link>
            <Link href={`/${locale}/tienda`} onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-on-surface font-sans font-medium tracking-wider border-b border-surface-container-high hover:bg-surface-container-low">{t.shop.toUpperCase()}</Link>
            <Link href={`/${locale}/blog`} onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-on-surface font-sans font-medium tracking-wider border-b border-surface-container-high hover:bg-surface-container-low">{t.blog.toUpperCase()}</Link>
            <Link href={`/${locale}/tips`} onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-on-surface font-sans font-medium tracking-wider border-b border-surface-container-high hover:bg-surface-container-low">{t.tips.toUpperCase()}</Link>
            <Link href={`/${locale}/contacto`} onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-on-surface font-sans font-medium tracking-wider hover:bg-surface-container-low">{t.contact.toUpperCase()}</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
