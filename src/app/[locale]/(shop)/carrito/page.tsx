"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/store/cartStore';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [orderInfo, setOrderInfo] = useState<{ id: number; total: string } | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const customerData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address_1: formData.get('address'),
      city: formData.get('city'),
      postcode: formData.get('postcode'),
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar el pedido');
      }

      setOrderInfo({ id: data.orderId, total: data.total });
      setStatus('success');
      clearCart();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Ocurrió un error inesperado');
      setStatus('error');
    }
  };

  if (status === 'success' && orderInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h1 className="text-4xl font-extrabold text-dark mb-4">¡Pedido Recibido!</h1>
        <p className="text-xl text-dark-muted mb-2 font-medium">Gracias por confiar en CMC Belleza.</p>
        <p className="text-dark-muted mb-8">
          Tu número de pedido es <span className="font-bold text-dark">#{orderInfo.id}</span>.
          <br /> Hemos enviado un correo con los detalles de tu compra.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/tienda">
            <Button variant="dark">Seguir comprando</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Ir al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-gray-200" />
        </div>
        <h1 className="text-3xl font-extrabold text-dark mb-4">Tu carrito está vacío</h1>
        <p className="text-dark-muted mb-8 max-w-sm">Parece que aún no has añadido ningún producto de nuestra selección profesional.</p>
        <Link href="/tienda">
          <Button variant="primary">Explorar Catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      <h1 className="text-4xl font-extrabold text-dark mb-10 relative inline-block">
        Tu Carrito
        <span className="absolute -bottom-2 left-0 w-1/3 h-1.5 bg-primary rounded-full"></span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Lista de Productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.productId} 
              className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 relative group transform transition-all hover:shadow-md"
            >
              <div className="relative h-24 w-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={24} />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                <Link 
                  href={`/producto/${item.slug}`} 
                  className="text-lg font-bold text-dark hover:text-primary transition-colors line-clamp-2 leading-tight pr-4"
                >
                  {item.name}
                </Link>
                <p className="text-xl font-black text-secondary mt-2">
                  {item.price.toFixed(2)} €
                </p>
              </div>

              <div className="flex items-center gap-6 mt-4 sm:mt-0">
                <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-1">
                  <button 
                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-dark-muted hover:text-primary transition-colors hover:bg-white rounded-full"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-dark text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-dark-muted hover:text-primary transition-colors hover:bg-white rounded-full"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.productId)}
                  className="text-dark-muted hover:text-red-500 p-2 transition-colors transform hover:scale-110"
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={clearCart}
            className="text-xs font-bold text-dark-muted hover:text-red-500 transition-colors flex items-center gap-2 mt-4 px-4"
          >
            <Trash2 size={14} />
            Vaciar todo el carrito
          </button>
        </div>

        {/* Resumen / Checkout */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white/60 h-fit sticky top-28">
          <h2 className="text-2xl font-bold text-dark mb-6 border-b border-gray-50 pb-4">Resumen</h2>

          {!showCheckoutForm ? (
            <>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-dark-muted font-medium">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center text-dark-muted font-medium">
                  <span>Envío</span>
                  <span className="text-xs italic bg-gray-50 px-2 py-1 rounded">Calculado en checkout</span>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-50 flex justify-between items-center text-dark leading-none">
                  <span className="text-xl font-bold text-dark">Total</span>
                  <span className="text-3xl font-black text-secondary">
                    {subtotal.toFixed(2)} €
                  </span>
                </div>
              </div>

              <Button 
                variant="dark" 
                fullWidth 
                className="py-5 text-lg shadow-xl"
                onClick={() => setShowCheckoutForm(true)}
              >
                Tramitar Pedido
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-4 opacity-30 grayscale pointer-events-none">
                 <div className="w-10 h-6 bg-gray-200 rounded"></div>
                 <div className="w-10 h-6 bg-gray-200 rounded"></div>
                 <div className="w-10 h-6 bg-gray-200 rounded"></div>
              </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={() => {
                  setShowCheckoutForm(false);
                  setStatus('idle');
                }}
                className="text-xs font-bold text-primary hover:underline mb-6 flex items-center gap-1"
                disabled={status === 'loading'}
              >
                <ArrowLeft size={12} />
                Volver al resumen
              </button>
              
              <h3 className="text-lg font-bold text-dark mb-4">Datos de envío</h3>
              
              {status === 'error' && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 animate-in fade-in shake-1">
                  <strong>Error:</strong> {errorMessage}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleCheckoutSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <input name="first_name" type="text" placeholder="Nombre" className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary text-sm shadow-sm" required disabled={status === 'loading'} />
                  <input name="last_name" type="text" placeholder="Apellidos" className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary text-sm shadow-sm" required disabled={status === 'loading'} />
                </div>
                <input name="email" type="email" placeholder="Email de contacto" className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary text-sm shadow-sm" required disabled={status === 'loading'} />
                <input name="phone" type="tel" placeholder="Teléfono" className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary text-sm shadow-sm" required disabled={status === 'loading'} />
                <input name="address" type="text" placeholder="Dirección completa" className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary text-sm shadow-sm" required disabled={status === 'loading'} />
                <div className="grid grid-cols-2 gap-4">
                  <input name="city" type="text" placeholder="Ciudad" className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary text-sm shadow-sm" required disabled={status === 'loading'} />
                  <input name="postcode" type="text" placeholder="Código Postal" className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary text-sm shadow-sm" required disabled={status === 'loading'} />
                </div>
                
                <div className="pt-4 border-t border-gray-50 mt-6">
                   <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-dark">Total a pagar:</span>
                      <span className="text-2xl font-black text-secondary font-mono">{subtotal.toFixed(2)} €</span>
                   </div>
                   
                   <Button 
                     variant="primary" 
                     fullWidth 
                     className="py-4 shadow-lg shadow-primary/20" 
                     disabled={status === 'loading'}
                   >
                     {status === 'loading' ? (
                       <>
                         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                         Procesando...
                       </>
                     ) : (
                       'Confirmar y Pagar'
                     )}
                   </Button>
                   
                   <p className="text-[10px] text-dark-muted text-center mt-4 px-4 leading-relaxed font-medium">
                     * Al hacer clic en "Confirmar", tu pedido se enviará directamente a nuestro sistema de gestión en WooCommerce.
                   </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}