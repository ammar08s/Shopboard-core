import type { Product, ProductValues, ProductSelections } from './types.ts';
import { products as defaultProducts, catalogStorageKey } from './data.ts';
import { validateProduct } from './logic/validateProduct.ts';

export { catalogStorageKey } from './data.ts';

let state = { searchTerm: '', selectedCategory: '', selectedSort: '' };

// getState returns a copy of the current product selections.
export function getState() {
  return { ...state };
}

// setState updates the product selections without exposing the stored object.
export function setState(selections: Partial<ProductSelections>) {
  state = { ...state, ...selections };
}




// loadProducts restores valid saved products, falling back to the demo catalog for unreadable data.
function loadProducts(): Product[] {
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
function replaceProducts(nextProducts: Product[]) {
  products.splice(0, products.length, ...nextProducts);
  categories.splice(0, categories.length, ...new Set(products.map((product) => product.category)));
}

// refreshProducts reloads browser storage when another page changes the catalog.
export function refreshProducts() {
  replaceProducts(loadProducts());
}

// persistProducts writes changes before updating memory so a failed save leaves the catalog intact.
function persistProducts(nextProducts: Product[]) {
  if (!globalThis.localStorage) throw new Error('Browser storage is unavailable. Product changes could not be saved.');
  try {
    globalThis.localStorage.setItem(catalogStorageKey, JSON.stringify(nextProducts));
  } catch {
    throw new Error('Changes could not be saved. Browser storage may be full or unavailable. Try a smaller photo or an image URL.');
  }
  replaceProducts(nextProducts);
}

// saveProduct creates a product or updates an existing one while retaining its ID.
export function saveProduct(values: ProductValues, id = values.id) {
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
export function deleteProduct(id: number) {
  if (!products.some((product) => product.id === id)) throw new Error('This product no longer exists.');
  persistProducts(products.filter((product) => product.id !== id));
}
