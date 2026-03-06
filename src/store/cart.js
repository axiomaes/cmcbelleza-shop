// src/store/cart.js
import { persistentAtom } from '@nanostores/persistent';

// Utilizamos persistentAtom en lugar de atom
// 1er parámetro: Nombre de la clave que se guardará en localStorage ('cmcbelleza-cart')
// 2do parámetro: Estado inicial por defecto
// 3er parámetro: Opciones de codificación/decodificación para manejar el objeto JSON
export const cartStore = persistentAtom('cmcbelleza-cart', {
    items: [],
    itemCount: 0,
    totals: { total: "0.00" }
}, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

function updateCartState(newItems) {
    const newCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);

    cartStore.set({
        items: newItems,
        itemCount: newCount,
        totals: { total: newTotal }
    });
}

export function addProductToCart(product) {
    const currentCart = cartStore.get();
    const existingItemIndex = currentCart.items.findIndex(item => item.id === product.id);
    let newItems = [...currentCart.items];

    if (existingItemIndex > -1) {
        newItems[existingItemIndex].quantity += 1;
    } else {
        newItems.push({ ...product, quantity: 1 });
    }

    updateCartState(newItems);
}

export function removeProductFromCart(productId) {
    const currentCart = cartStore.get();
    const newItems = currentCart.items.filter(item => item.id !== productId);
    updateCartState(newItems);
}

export function updateItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;

    const currentCart = cartStore.get();
    const newItems = currentCart.items.map(item => {
        if (item.id === productId) {
            return { ...item, quantity: newQuantity };
        }
        return item;
    });

    updateCartState(newItems);
}