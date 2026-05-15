"use client";

import React, { useState } from 'react';
import { useCart } from '@/store/cartStore';
import { Product } from '@/types';
import { ShoppingBag, Check } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
  dict?: {
    add_to_cart?: string;
    out_of_stock_btn?: string;
  };
}

const AddToCartButton = ({ product, dict }: AddToCartButtonProps) => {
  const { addItem, toggleCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: parseFloat(product.price || '0'),
      quantity: 1,
      image: product.images?.[0]?.src || '',
    });
    
    setAdded(true);
    toggleCart(true);
    
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = product.stock_status === 'outofstock';

  // Fallbacks en caso de que el dict sea undefined
  const labelAddToCart = dict?.add_to_cart || 'Add to Cart';
  const labelOutOfStock = dict?.out_of_stock_btn || 'Out of Stock';
  const labelAdded = 'Added!';

  return (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock || added}
      className="w-full bg-soft-charcoal text-white py-4.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-champagne-gold disabled:bg-stroke-grey disabled:text-outline transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md shadow-soft-charcoal/10 hover:shadow-xl"
    >
      {isOutOfStock ? (
        labelOutOfStock
      ) : added ? (
        <>
          <Check size={18} />
          {labelAdded}
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          {labelAddToCart}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
