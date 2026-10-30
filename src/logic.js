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
