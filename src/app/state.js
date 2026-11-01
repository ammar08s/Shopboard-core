import { products as defaultProducts } from './data.js';
import { validateProduct, changeCartQuantity, restoreCartItems, calculateCartTotal, getCartProducts as cartCatalog } from './logic.js';

let state = { searchTerm: '', selectedCategory: '', selectedSort: '' };

// getState returns a copy of the current product selections.
export function getState() {
  return { ...state };
}

// setState updates the product selections without exposing the stored object.
export function setState(selections) {
  state = { ...state, ...selections };
}


export const catalogStorageKey = 'shopboard-products';

// loadProducts restores valid saved products, falling back to the demo catalog for unreadable data.
function loadProducts() {
  try {
    const saved = globalThis.localStorage?.getItem(catalogStorageKey);
    if (saved === null || saved === undefined) return structuredClone(defaultProducts);
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error('Invalid catalog');
    const ids = new Set();
    for (const product of parsed) {
      validateProduct(product);
      if (!Number.isSafeInteger(product.id) || product.id < 1 || ids.has(product.id)) throw new Error('Invalid product ID');
      ids.add(product.id);
    }
    return parsed;
  } catch {
    return structuredClone(defaultProducts);
  }
}

export const products = loadProducts();
export const categories = [...new Set(products.map((product) => product.category))];

// replaceProducts refreshes the shared arrays so existing imports always see the current catalog.
function replaceProducts(nextProducts) {
  products.splice(0, products.length, ...nextProducts);
  categories.splice(0, categories.length, ...new Set(products.map((product) => product.category)));
}

// refreshProducts reloads browser storage when another page changes the catalog.
export function refreshProducts() {
  replaceProducts(loadProducts());
}

// persistProducts writes changes before updating memory so a failed save leaves the catalog intact.
function persistProducts(nextProducts) {
  if (!globalThis.localStorage) throw new Error('Browser storage is unavailable. Product changes could not be saved.');
  try {
    globalThis.localStorage.setItem(catalogStorageKey, JSON.stringify(nextProducts));
  } catch {
    throw new Error('Changes could not be saved. Browser storage may be full or unavailable. Try a smaller photo or an image URL.');
  }
  replaceProducts(nextProducts);
}

// saveProduct creates a product or updates an existing one while retaining its ID.
export function saveProduct(values, id = values.id) {
  validateProduct(values);
  if (id !== undefined && !products.some((product) => product.id === id)) throw new Error('This product no longer exists.');
  const product = {
    id: id ?? Math.max(Date.now(), ...products.map((item) => item.id)) + 1,
    name: values.name.trim(),
    category: values.category.trim(),
    price: Math.round(values.price * 100) / 100,
    image: values.image,
    inStock: values.inStock,
  };
  const nextProducts = id === undefined ? [...products, product] : products.map((item) => item.id === id ? product : item);
  persistProducts(nextProducts);
  return product;
}

// deleteProduct removes the requested product and persists the remaining catalog.
export function deleteProduct(id) {
  if (!products.some((product) => product.id === id)) throw new Error('This product no longer exists.');
  persistProducts(products.filter((product) => product.id !== id));
}

export const cartStorageKey = 'shopboard-cart';
let cart = {};
try { cart = restoreCartItems(globalThis.localStorage?.getItem(cartStorageKey), products); } catch { /* Keep the cart usable without storage. */ }

// getCart returns a copy of the current cart for rendering.
export function getCart() { return { ...cart }; }

// getCartProducts returns the current cart catalog with cent prices.
export function getCartProducts() { return cartCatalog(products); }

// cartTotal returns the current cart total in cents.
export function cartTotal() { return calculateCartTotal(cart, products); }

// persistCart saves cart changes when storage is available and reports a readable fallback message.
function persistCart() {
  try {
    if (!globalThis.localStorage) throw new Error('Storage unavailable');
    globalThis.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    return '';
  } catch { return ' Cart changes cannot be saved on this browser.'; }
}

// updateCart changes or removes a quantity and persists the resulting cart.
export function updateCart(id, quantity) {
  cart = changeCartQuantity(cart, id, quantity, products);
  return persistCart();
}

// addToCart adds one available product while respecting the quantity limit.
export function addToCart(id) {
  if (!getCartProducts()[id]?.inStock) throw new Error('This product is unavailable.');
  if ((cart[id] || 0) >= 99) throw new Error('You can add up to 99 of each product.');
  return updateCart(id, (cart[id] || 0) + 1);
}

// clearCart empties the current cart and saves the change.
export function clearCart() { cart = {}; return persistCart(); }

// reconcileCart removes unavailable items and refreshes the saved cart after catalog changes.
export function reconcileCart() {
  const previous = JSON.stringify(cart);
  cart = restoreCartItems(previous, products);
  const warning = persistCart();
  return previous !== JSON.stringify(cart) ? 'Unavailable products were removed from your cart.' + warning : '';
}
