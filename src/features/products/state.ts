import type { Product, ProductValues, ProductSelections } from './types.ts';
import { products as defaultProducts, catalogStorageKey } from './data.ts';
import { validateProduct } from './logic/validateProduct.ts';

export { catalogStorageKey } from './data.ts';
let state = { searchTerm: '', selectedCategory: '', selectedSort: '' };
let productsInitialized = false;

// Input: none; output: true for the first browsing initialization claim and false for later claims.
export function claimProductInitialization() {
  if (productsInitialized) return false;
  productsInitialized = true;
  return true;
}

// Input: none; output: a snapshot of the current search, category, and sorting selections.
export function getState() {
  return { ...state };
}

// Input: partial product selections; output: updated selections without exposing stored state.
export function setState(selections: Partial<ProductSelections>) {
  state = { ...state, ...selections };
}

// Input: browser storage; output: valid saved products or a fresh demo catalog when storage is unreadable.
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
// Input: a product; output: its category for the initial distinct category list.
export const categories = [...new Set(products.map((product) => product.category))];

// Input: the next catalog; output: refreshed shared product and category arrays.
function replaceProducts(nextProducts: Product[]) {
  products.splice(0, products.length, ...nextProducts);
  // Input: a catalog product; output: its category for the refreshed distinct category list.
  categories.splice(0, categories.length, ...new Set(products.map((product) => product.category)));
}

// Input: current browser storage; output: shared catalog arrays refreshed from persistent state.
export function refreshProducts() {
  replaceProducts(loadProducts());
}

// Input: the next catalog; output: persisted state and refreshed arrays, or an error leaving state intact.
function persistProducts(nextProducts: Product[]) {
  if (!globalThis.localStorage) throw new Error('Browser storage is unavailable. Product changes could not be saved.');
  try {
    globalThis.localStorage.setItem(catalogStorageKey, JSON.stringify(nextProducts));
  } catch {
    throw new Error('Changes could not be saved. Browser storage may be full or unavailable. Try a smaller photo or an image URL.');
  }
  replaceProducts(nextProducts);
}

// Input: product values and an optional existing ID; output: a persisted product with a stable ID.
export function saveProduct(values: ProductValues, id = values.id) {
  validateProduct(values);
  // Input: a catalog product; output: whether it has the requested existing ID.
  const existing = products.find((product) => product.id === id);
  if (id !== undefined && !existing) throw new Error('This product no longer exists.');
  const product = {
    // Input: a catalog product; output: its ID for determining a unique new ID.
    id: id ?? Math.max(Date.now(), ...products.map((item) => item.id)) + 1,
    name: values.name.trim(),
    category: values.category.trim(),
    price: Math.round(values.price * 100) / 100,
    image: values.image,
    inStock: values.inStock,
    description: (values.description ?? existing?.description ?? '').trim(),
  };
  // Input: a catalog item; output: the saved product in place of its matching existing ID.
  const nextProducts = id === undefined ? [...products, product] : products.map((item) => item.id === id ? product : item);
  persistProducts(nextProducts);
  return product;
}

// Input: an existing product ID; output: a persisted catalog without that product, or an error.
export function deleteProduct(id: number) {
  // Input: a catalog product; output: whether it has the requested deletion ID.
  if (!products.some((product) => product.id === id)) throw new Error('This product no longer exists.');
  // Input: a catalog product; output: whether it should remain after deletion.
  persistProducts(products.filter((product) => product.id !== id));
}
