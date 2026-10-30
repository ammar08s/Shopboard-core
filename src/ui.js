const searchInput = document.querySelector('#searchInput');
const categorySelect = document.querySelector('#categorySelect');
const sortSelect = document.querySelector('#sortSelect');
const productContainer = document.querySelector('#products .products');

// readProductControls reads the current search, category, and sort values from the page.
export function readProductControls() {
  return {
    searchTerm: searchInput.value,
    selectedCategory: categorySelect.value,
    selectedSort: sortSelect.value,
  };
}

// renderCategories fills the category dropdown while keeping the All Categories option.
export function renderCategories(categories) {
  categorySelect.innerHTML = '<option value="">All Categories</option>' + categories.map((category) => `
    <option value="${category}">${category}</option>
  `).join('');
}

// renderProductCards displays semantic product cards or the empty-results message.
export function renderProductCards(products) {
  productContainer.innerHTML = products.length === 0
    ? '<p role="status">No products found</p>'
    : products.map((product) => `
      <article aria-labelledby="product-${product.id}-title">
        <h3 id="product-${product.id}-title">${product.name}</h3>
        <p>${product.category}</p>
        <p class="price">$${product.price.toFixed(2)} USD</p>
        <button class="button" type="button" data-add-to-cart="${product.id}" aria-label="Add ${product.name} to cart">Add to cart</button>
      </article>
    `).join('');
}

// bindProductControls connects search input and dropdown changes to the shared update function.
export function bindProductControls(onChange) {
  searchInput.addEventListener('input', onChange);
  categorySelect.addEventListener('change', onChange);
  sortSelect.addEventListener('change', onChange);
}
