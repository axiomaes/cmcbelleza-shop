"use client";

import React, { useState } from 'react';
import { useCart } from '@/store/cartStore';
import { Product } from '@/types';
import Button from '@/components/ui/Button';
import { ShoppingCart, Check } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
}

const AddToCartButton = ({ product }: AddToCartButtonProps) => {
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

  return (
    <Button
      variant={added ? 'secondary' : 'dark'}
      fullWidth
      onClick={handleAdd}
      disabled={isOutOfStock || added}
      className="gap-2"
    >
      {isOutOfStock ? (
        'Agotado'
      ) : added ? (
        <>
          <Check size={20} />
          ¡Añadido!
        </>
      ) : (
        <>
          <ShoppingCart size={20} />
          Añadir al carrito
        </>
      )}
    </Button>
  );
};

export default AddToCartButton;
