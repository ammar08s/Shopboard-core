import productsConsole from './console/products-console.js';

export const products = {
  ...Object.fromEntries(productsConsole.map((product) => [product.id, { name: product.name, price: Math.round(product.price * 100) }])),
  notebook: { name: 'Everyday notebook', price: 1200 },
  bottle: { name: 'Reusable water bottle', price: 2400 },
  tote: { name: 'Canvas tote bag', price: 1800 },
};

export function updateCart(cart, id, quantity) {
  if (!Object.hasOwn(products, id) || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) return cart;
  const next = { ...cart };
  if (quantity === 0) delete next[id];
  else next[id] = quantity;
  return next;
}

export function addToCart(cart, id) {
  return updateCart(cart, id, (cart[id] || 0) + 1);
}

export function restoreCart(saved) {
  try {
    const data = JSON.parse(saved);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.entries(data).reduce((cart, [id, quantity]) => updateCart(cart, id, quantity), {});
  } catch {
    return {};
  }
}

export function cartTotal(cart) {
  return Object.entries(cart).reduce((total, [id, quantity]) => total + products[id].price * quantity, 0);
}
