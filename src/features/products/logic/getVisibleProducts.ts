import type { Product, ProductSelections } from '../types.ts';

// Input: a catalog and selections; output: filtered and sorted products without changing the catalog.
export function getVisibleProducts(products: Product[], { searchTerm, selectedCategory, selectedSort }: ProductSelections) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  // Input: a product; output: whether its name and category match the selected filters.
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(normalizedSearch) &&
    (selectedCategory === '' || product.category === selectedCategory)
  );
  const sortedProducts = [...filteredProducts];
  if (selectedSort === 'price-asc') {
    // Input: two products; output: their ascending price comparison.
    sortedProducts.sort((firstProduct, secondProduct) => firstProduct.price - secondProduct.price);
  } else if (selectedSort === 'price-desc') {
    // Input: two products; output: their descending price comparison.
    sortedProducts.sort((firstProduct, secondProduct) => secondProduct.price - firstProduct.price);
  }
  return sortedProducts;
}
