const catalog = [
  { id: 1, name: "Leather Tote Bag", category: "Bags", price: 89, description: "An everyday leather tote for workday essentials and weekend plans. A simple addition to your daily collection." },
  { id: 2, name: "Canvas Backpack", category: "Bags", price: 49, description: "Keep your everyday carry together with this canvas backpack. An easygoing choice for the commute, campus, or a day out." },
  { id: 3, name: "Mini Crossbody Bag", category: "Bags", price: 39, description: "Take just the essentials with this mini crossbody bag. A compact choice for days when you want to travel light." },
  { id: 4, name: "White Sneakers", category: "Shoes", price: 75, description: "A fresh pair of white sneakers for your everyday rotation. Pair them with casual favorites for a simple, relaxed look." },
  { id: 5, name: "Running Shoes", category: "Shoes", price: 110, description: "Refresh your active wardrobe with these running shoes. Explore the product image and choose an everyday style that suits you." },
  { id: 6, name: "Suede Loafers", category: "Shoes", price: 95, description: "Suede loafers with an understated look for your footwear collection. Style them with your favorite smart-casual outfit." },
  { id: 7, name: "Wool Scarf", category: "Accessories", price: 25, description: "Finish your cool-weather outfit with a wool scarf. An everyday accessory for layering with coats, jackets, and knitwear." },
  { id: 8, name: "Silver Watch", category: "Accessories", price: 150, description: "A silver watch to complete your everyday look. An understated accessory to wear with both relaxed and dressed-up outfits." },
  { id: 9, name: "Sunglasses", category: "Accessories", price: 35, description: "Complete your sunny-day look with these sunglasses. Browse the image for the frame style and make them part of your accessories collection." },
  { id: 10, name: "Travel Duffel Bag", category: "Bags", price: 120, description: "Bring your travel essentials together in this duffel bag. A companion for weekend plans, short breaks, and your next getaway." },
  { id: 11, name: "Rain Boots", category: "Shoes", price: 60, description: "Add rain boots to your wet-weather wardrobe. A straightforward style for pairing with your everyday outdoor outfits." },
  { id: 12, name: "Leather Belt", category: "Accessories", price: 30, description: "A leather belt to bring your everyday outfit together. Pair this classic accessory with your favorite trousers or jeans." },
];


// Input: each demo catalog record; output: a product with its default demo photo and stock status.
export const products = catalog.map((product) => ({
  ...product,
  image: `/images/product-${product.id}.jpg`,
  inStock: true,
}));
// Input: a demo product; output: its category for the distinct default category list.
export const categories = [...new Set(products.map((product) => product.category))];
export const catalogStorageKey = 'shopboard-products';
export const maxImageBytes = 1024 * 1024;
export const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
