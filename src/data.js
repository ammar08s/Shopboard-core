import products from './console/products-console.js';

export { products };
export const categories = [...new Set(products.map((product) => product.category))];
