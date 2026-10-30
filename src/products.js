import products from './console/products-console.js';

// renderProducts builds the product cards from the catalog while preserving their semantic markup.
function renderProducts() {
  document.querySelector('#products .products').innerHTML = products.map((product) => `
    <article aria-labelledby="product-${product.id}-title">
      <h3 id="product-${product.id}-title">${product.name}</h3>
      <p>${product.category}</p>
      <p class="price">$${product.price.toFixed(2)} USD</p>
      <button class="button" type="button" data-add-to-cart="${product.id}" aria-label="Add ${product.name} to cart">Add to cart</button>
    </article>
  `).join('');
}

renderProducts();
