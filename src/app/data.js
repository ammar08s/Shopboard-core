const catalog = [
  { id: 1, name: "Leather Tote Bag", category: "Bags", price: 89 },
  { id: 2, name: "Canvas Backpack", category: "Bags", price: 49 },
  { id: 3, name: "Mini Crossbody Bag", category: "Bags", price: 39 },
  { id: 4, name: "White Sneakers", category: "Shoes", price: 75 },
  { id: 5, name: "Running Shoes", category: "Shoes", price: 110 },
  { id: 6, name: "Suede Loafers", category: "Shoes", price: 95 },
  { id: 7, name: "Wool Scarf", category: "Accessories", price: 25 },
  { id: 8, name: "Silver Watch", category: "Accessories", price: 150 },
  { id: 9, name: "Sunglasses", category: "Accessories", price: 35 },
  { id: 10, name: "Travel Duffel Bag", category: "Bags", price: 120 },
  { id: 11, name: "Rain Boots", category: "Shoes", price: 60 },
  { id: 12, name: "Leather Belt", category: "Accessories", price: 30 },
];


// The initial demo catalog contains product data only; saved changes live in state.js.
export const products = catalog.map((product) => ({
  ...product,
  image: `/images/product-${product.id}.jpg`,
  inStock: true,
}));
export const categories = [...new Set(products.map((product) => product.category))];
