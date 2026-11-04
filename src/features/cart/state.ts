import type { Product } from '../products/types.ts';
import type { Cart } from './types.ts';
import { cartStorageKey, maxCartQuantity } from './data.ts';
import { changeCartQuantity } from './logic/changeCartQuantity.ts';
import { restoreCartItems } from './logic/restoreCartItems.ts';
import { calculateCartTotal } from './logic/calculateCartTotal.ts';
import { getCartProducts as cartCatalog } from './logic/getCartProducts.ts';

// Input: a live catalog getter; output: cart state and persistence operations using current product data.
export function createCartState(getProducts: () => Product[]) {
  let cart: Cart = {};
  let hasUnsavedChanges = false;
  try { cart = restoreCartItems(globalThis.localStorage?.getItem(cartStorageKey), getProducts()); } catch { /* Keep the cart usable without storage. */ }

  // Input: none; output: a copy of current quantities, safe for rendering without mutating stored state.
  function getCart() { return { ...cart }; }

  // Input: current browser storage; output: quantities reloaded after navigation or another page's cart change.
  function reloadCart() {
    try {
      if (hasUnsavedChanges || !globalThis.localStorage) return '';
      const saved = globalThis.localStorage.getItem(cartStorageKey);
      cart = restoreCartItems(saved, getProducts());
      const raw = JSON.parse(saved ?? '{}');
      // Input: a saved product ID; output: whether restoration removed this unavailable/invalid item.
      const removed = raw && typeof raw === 'object' && Object.keys(raw).some((id) => !cart[id]);
      return removed ? 'Unavailable products were removed from your cart.' : '';
    } catch { return ''; }
  }

  // Input: none; output: the supplied catalog converted to current cart products and cent prices.
  function getCartProducts() { return cartCatalog(getProducts()); }

  // Input: none; output: the current available-product cart total in cents.
  function cartTotal() { return calculateCartTotal(cart, getProducts()); }

  // Input: current cart state; output: saved storage plus an empty string, or a readable storage warning.
  function persistCart() {
    try {
      if (!globalThis.localStorage) throw new Error('Storage unavailable');
      globalThis.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
      hasUnsavedChanges = false;
      return '';
    } catch { hasUnsavedChanges = true; return ' Cart changes cannot be saved on this browser.'; }
  }

  // Input: product ID and quantity; output: updated persisted cart state and any storage warning.
  function updateCart(id: string | number, quantity: number) {
    cart = changeCartQuantity(cart, id, quantity, getProducts());
    return persistCart();
  }

  // Input: product ID; output: one added item plus storage warning, or an error for unavailable/limited items.
  function addToCart(id: string | number) {
    if (!getCartProducts()[id]?.inStock) throw new Error('This product is unavailable.');
    if ((cart[id] || 0) >= maxCartQuantity) throw new Error('You can add up to 99 of each product.');
    return updateCart(id, (cart[id] || 0) + 1);
  }

  // Input: none; output: an empty persisted cart and any storage warning.
  function clearCart() { cart = {}; return persistCart(); }

  // Input: current catalog/cart state; output: reconciled quantities and feedback when items were removed.
  function reconcileCart() {
    const previous = JSON.stringify(cart);
    cart = restoreCartItems(previous, getProducts());
    const warning = persistCart();
    return previous !== JSON.stringify(cart) ? 'Unavailable products were removed from your cart.' + warning : '';
  }

  return { getCart, reloadCart, getCartProducts, cartTotal, updateCart, addToCart, clearCart, reconcileCart };
}
