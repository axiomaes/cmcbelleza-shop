"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/store/cartStore';
import { ShoppingBag, Menu, X } from 'lucide-react';
import MiniCart from '@/components/cart/MiniCart';

const Header = () => {
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

  const cartItemCount = items.reduce((acc: number, item) => acc + item.quantity, 0);

  return (
    <header className={`sticky top-4 z-50 mx-auto w-[95%] max-w-screen-2xl rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
      <div className="px-6">
        <div className="flex justify-between items-center relative w-full">
          
          <div className="flex-1 flex items-center justify-start shrink-0">
            <Link href="/" className="flex items-center gap-3 group/logo">
              <Image
                src="/logo.png"
                alt="Logo CMC Belleza"
                width={48}
                height={48}
                className="h-10 md:h-12 w-auto object-contain mix-blend-multiply group-hover/logo:scale-105 transition-transform duration-300"
              />
              <span className="text-2xl md:text-3xl font-bold text-dark tracking-tight">
                CMC <span className="text-primary">Belleza</span>
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-6 group">
            <Link href="/" className="px-5 py-2 rounded-full text-dark font-medium transition-all duration-300 group-hover:scale-95 group-hover:opacity-50 hover:scale-110! hover:opacity-100! hover:bg-primary/10 hover:text-primary">Inicio</Link>
            <Link href="/tienda" className="px-5 py-2 rounded-full text-dark font-medium transition-all duration-300 group-hover:scale-95 group-hover:opacity-50 hover:scale-110! hover:opacity-100! hover:bg-primary/10 hover:text-primary">Tienda</Link>
            <Link href="#" className="px-5 py-2 rounded-full text-dark font-medium transition-all duration-300 group-hover:scale-95 group-hover:opacity-50 hover:scale-110! hover:opacity-100! hover:bg-primary/10 hover:text-primary">Contacto</Link>
          </nav>

          <div className="flex items-center space-x-4 relative z-10">
            <button 
              onClick={() => toggleCart()}
              className="relative bg-dark text-white p-2.5 rounded-full hover:bg-primary hover:scale-105 transition-all duration-300 shadow-md" 
              aria-label="Ver carrito"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            <MiniCart />

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-dark p-2 focus:outline-none hover:text-primary transition-colors" 
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 w-full mt-4 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl lg:hidden overflow-hidden transition-all duration-300 origin-top animate-in fade-in slide-in-from-top-4">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-dark font-medium hover:bg-primary/10 hover:text-primary border-b border-gray-100 transition-colors">Inicio</Link>
              <Link href="/tienda" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-dark font-medium hover:bg-primary/10 hover:text-primary border-b border-gray-100 transition-colors">Tienda</Link>
              <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-4 text-dark font-medium hover:bg-primary/10 hover:text-primary transition-colors">Contacto</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
