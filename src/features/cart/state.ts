import type { Product } from '../products/types.ts';
import type { Cart } from './types.ts';
import { cartStorageKey, maxCartQuantity } from './data.ts';
import { changeCartQuantity } from './logic/changeCartQuantity.ts';
import { restoreCartItems } from './logic/restoreCartItems.ts';
import { calculateCartTotal } from './logic/calculateCartTotal.ts';
import { getCartProducts as cartCatalog } from './logic/getCartProducts.ts';

// main.ts supplies the current catalog; this feature owns only the cart.
export function createCartState(getProducts: () => Product[]) {
  let cart: Cart = {};
  try { cart = restoreCartItems(globalThis.localStorage?.getItem(cartStorageKey), getProducts()); } catch { /* Keep the cart usable without storage. */ }

  // getCart returns a copy of the current cart for rendering.
  function getCart() { return { ...cart }; }

  // getCartProducts returns the current cart catalog with cent prices.
  function getCartProducts() { return cartCatalog(getProducts()); }

  // cartTotal returns the current cart total in cents.
  function cartTotal() { return calculateCartTotal(cart, getProducts()); }

  // persistCart saves cart changes when storage is available and reports a readable fallback message.
  function persistCart() {
    try {
      if (!globalThis.localStorage) throw new Error('Storage unavailable');
      globalThis.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
      return '';
    } catch { return ' Cart changes cannot be saved on this browser.'; }
  }

  // updateCart changes or removes a quantity and persists the resulting cart.
  function updateCart(id: string | number, quantity: number) {
    cart = changeCartQuantity(cart, id, quantity, getProducts());
    return persistCart();
  }

  // addToCart adds one available product while respecting the quantity limit.
  function addToCart(id: string | number) {
    if (!getCartProducts()[id]?.inStock) throw new Error('This product is unavailable.');
    if ((cart[id] || 0) >= maxCartQuantity) throw new Error('You can add up to 99 of each product.');
    return updateCart(id, (cart[id] || 0) + 1);
  }

  // clearCart empties the current cart and saves the change.
  function clearCart() { cart = {}; return persistCart(); }

  // reconcileCart removes unavailable items and refreshes the saved cart after catalog changes.
  function reconcileCart() {
    const previous = JSON.stringify(cart);
    cart = restoreCartItems(previous, getProducts());
    const warning = persistCart();
    return previous !== JSON.stringify(cart) ? 'Unavailable products were removed from your cart.' + warning : '';
  }

  return { getCart, getCartProducts, cartTotal, updateCart, addToCart, clearCart, reconcileCart };
}
