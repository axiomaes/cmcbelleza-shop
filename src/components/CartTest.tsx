"use client";

import { useCart } from "@/store/cartStore";

export default function CartTest() {
  const { items, addItem, clearCart } = useCart();

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl mt-8 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Prueba de Carrito (Zustand)</h2>
      
      <div className="mb-6">
        <p className="text-dark-muted">Ítems en el carrito: <span className="font-bold text-primary">{items.length}</span></p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => addItem({
            productId: 123,
            slug: 'producto-test',
            name: 'Producto de Prueba',
            price: 29.99,
            quantity: 1,
            image: ''
          })}
          className="px-4 py-2 bg-secondary text-white rounded-full font-bold hover:opacity-90 transition-opacity"
        >
          Añadir Test
        </button>
        
        <button
          onClick={clearCart}
          className="px-4 py-2 bg-dark text-white rounded-full font-bold hover:opacity-90 transition-opacity"
        >
          Limpiar
        </button>
      </div>

      <ul className="mt-6 space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm p-2 bg-gray-50 rounded border border-gray-100 flex justify-between">
            <span>{item.name}</span>
            <span className="font-bold">x{item.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
