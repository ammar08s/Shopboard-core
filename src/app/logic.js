export const maxImageBytes = 1024 * 1024;

// isProductImage accepts local demo photos, raster uploads, and absolute HTTP or HTTPS image URLs.
export function isProductImage(source) {
  if (typeof source !== 'string' || !source) return false;
  if (/^\/images\/product-(?:[1-9]|1[0-2])\.jpg$/.test(source)) return true;
  if (/^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(source)) {
    return source.length <= Math.ceil(maxImageBytes / 3) * 4 + 40;
  }
  if (source.length > 2048) return false;
  try {
    const url = new URL(source);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

// escapeHtml displays admin-entered text literally when it is inserted into HTML templates.
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

// getVisibleProducts filters and sorts a copy of the catalog using the current selections.
export function getVisibleProducts(products, { searchTerm, selectedCategory, selectedSort }) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(normalizedSearch) &&
    (selectedCategory === '' || product.category === selectedCategory)
  );
  const sortedProducts = [...filteredProducts];
  if (selectedSort === 'price-asc') {
    sortedProducts.sort((firstProduct, secondProduct) => firstProduct.price - secondProduct.price);
  } else if (selectedSort === 'price-desc') {
    sortedProducts.sort((firstProduct, secondProduct) => secondProduct.price - firstProduct.price);
  }
  return sortedProducts;
}

// validateProduct rejects incomplete or invalid catalog data before it can be stored.
export function validateProduct(product) {
  if (!product || typeof product.name !== 'string' || !product.name.trim() || product.name.trim().length > 100) {
    throw new Error('Enter a product name between 1 and 100 characters.');
  }
  if (typeof product.category !== 'string' || !product.category.trim() || product.category.trim().length > 60) {
    throw new Error('Enter a category between 1 and 60 characters.');
  }
  if (typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 0 || product.price > 1000000 || Math.abs(product.price * 100 - Math.round(product.price * 100)) > 0.000001) {
    throw new Error('Enter a price from $0 to $1,000,000 with at most two decimal places.');
  }
  if (!isProductImage(product.image)) {
    throw new Error('Choose a supported photo or enter a valid HTTP or HTTPS image URL.');
  }
  if (typeof product.inStock !== 'boolean') throw new Error('Choose a stock status.');
}

// getCartProducts derives current names, cent prices, and availability from a product catalog.
export function getCartProducts(catalog) {
  return {
    notebook: { name: 'Everyday notebook', price: 1200, inStock: true },
    bottle: { name: 'Reusable water bottle', price: 2400, inStock: true },
    tote: { name: 'Canvas tote bag', price: 1800, inStock: true },
    ...Object.fromEntries(catalog.map((product) => [product.id, { ...product, price: Math.round(product.price * 100) }])),
  };
}

// changeCartQuantity returns a new cart for valid quantities and available products.
export function changeCartQuantity(cart, id, quantity, catalog) {
  const products = getCartProducts(catalog);
  if (!Object.hasOwn(products, id) || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) return cart;
  const next = { ...cart };
  if (quantity === 0) delete next[id];
  else if (products[id].inStock) next[id] = quantity;
  return next;
}

// restoreCartItems removes invalid quantities and unavailable products from serialized cart data.
export function restoreCartItems(saved, catalog) {
  try {
    const data = JSON.parse(saved);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.entries(data).reduce((cart, [id, quantity]) => changeCartQuantity(cart, id, quantity, catalog), {});
  } catch { return {}; }
}

// calculateCartTotal totals current product prices in cents without changing the cart.
export function calculateCartTotal(cart, catalog) {
  const products = getCartProducts(catalog);
  return Object.entries(cart).reduce((total, [id, quantity]) => total + (products[id]?.inStock ? products[id].price * quantity : 0), 0);
}
