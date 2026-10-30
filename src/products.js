import products from './console/products-console.js';

const searchInput = document.querySelector('#searchInput');
const categorySelect = document.querySelector('#categorySelect');
const sortSelect = document.querySelector('#sortSelect');
const productContainer = document.querySelector('#products .products');
const categories = [...new Set(products.map((product) => product.category))];

categorySelect.innerHTML = '<option value="">All Categories</option>' + categories.map((category) => `
  <option value="${category}">${category}</option>
`).join('');

// renderProducts reads all controls, filters and sorts a copy, then updates the product cards.
function renderProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categorySelect.value;
  const selectedSort = sortSelect.value;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm) &&
    (selectedCategory === '' || product.category === selectedCategory)
  );
  const sortedProducts = [...filteredProducts];
  if (selectedSort === 'price-asc') {
    sortedProducts.sort((firstProduct, secondProduct) => firstProduct.price - secondProduct.price);
  } else if (selectedSort === 'price-desc') {
    sortedProducts.sort((firstProduct, secondProduct) => secondProduct.price - firstProduct.price);
  }

  productContainer.innerHTML = sortedProducts.length === 0
    ? '<p role="status">No products found</p>'
    : sortedProducts.map((product) => `
      <article aria-labelledby="product-${product.id}-title">
        <h3 id="product-${product.id}-title">${product.name}</h3>
        <p>${product.category}</p>
        <p class="price">$${product.price.toFixed(2)} USD</p>
        <button class="button" type="button" data-add-to-cart="${product.id}" aria-label="Add ${product.name} to cart">Add to cart</button>
      </article>
    `).join('');
}

searchInput.addEventListener('input', renderProducts);
categorySelect.addEventListener('change', renderProducts);
sortSelect.addEventListener('change', renderProducts);
renderProducts();
