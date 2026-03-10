"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/store/cartStore';
import { X, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';

const MiniCart = () => {
  const { items, isOpen, toggleCart, removeItem } = useCart();

  if (!isOpen) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden" 
        onClick={() => toggleCart(false)}
      />
      
      <div className="absolute top-full right-0 mt-4 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl origin-top-right transition-all duration-300 overflow-hidden z-[70] animate-in zoom-in-95 fade-in duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-dark">Tu Carrito</h3>
          <button onClick={() => toggleCart(false)} className="text-dark-muted hover:text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-200 mb-2" />
              <p className="text-dark-muted text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center border-b border-gray-50 pb-2 gap-4">
                <div className="relative h-12 w-12 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">No img</div>
                  )}
                </div>
                <div className="flex-1 pr-4">
                  <h4 className="text-xs font-semibold text-dark line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-dark-muted">Cant: {item.quantity} x {item.price.toFixed(2)} €</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="font-bold text-secondary text-xs">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                  <button 
                    onClick={() => removeItem(item.productId)}
                    className="text-[10px] text-red-400 hover:text-red-500 underline"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-dark font-medium">Subtotal:</span>
            <span className="text-xl font-bold text-secondary">{total.toFixed(2)} €</span>
          </div>
          <Link href="/carrito" onClick={() => toggleCart(false)}>
            <Button variant="primary" fullWidth className="py-3 text-sm">
              Ver carrito detallado
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MiniCart;
