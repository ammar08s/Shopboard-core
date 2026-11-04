import type { Product } from '../types.ts';
import { escapeHtml } from '../logic/escapeHtml.ts';
import { money } from '../../../shared/formatting.ts';

// Input: visible products and whether the category/sort changed; output: cards with optional entry motion.
export function renderProductCards(products: Product[], animate = false) {
  const container = document.querySelector<HTMLElement>('#products .products');
  container.setAttribute('data-animate-results', String(animate));
  // Input: a product and position; output: safe card markup with stock-dependent action and bounded stagger.
  const cards = products.map((product, index) => `
    <article class="product-card" style="--card-index: ${index}" aria-labelledby="product-${product.id}-title">
      <a class="product-image" href="/product.html?id=${product.id}" aria-label="View ${escapeHtml(product.name)}"><img class="product-photo" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" width="800" height="800" loading="lazy" /><span class="image-fallback" hidden>Image unavailable</span></a>
      <div class="product-details">
        <h2 id="product-${product.id}-title"><a class="product-title-link" href="/product.html?id=${product.id}">${escapeHtml(product.name)}</a></h2>
        <p class="category-label">${escapeHtml(product.category)}</p>
        <p class="price">${money.format(product.price)} <span class="price-currency">USD</span></p>
        <p class="stock-label ${product.inStock ? '' : 'out-of-stock'}">${product.inStock ? 'In stock' : 'Out of stock'}</p>
        <button class="button" type="button" ${product.inStock ? '' : 'disabled'} data-add-to-cart="${product.id}" aria-label="Add ${escapeHtml(product.name)} to cart">${product.inStock ? 'Add to cart <span aria-hidden="true">+</span>' : 'Out of stock'}</button>
      </div>
    </article>
  `).join('');
  container.innerHTML = products.length ? cards : `<div class="empty-results"><span class="empty-symbol" aria-hidden="true">?</span><h2>No products found</h2><p>Try a different search or clear your filters to see the whole collection.</p><button class="button" type="button" data-reset-filters>Clear filters</button></div>`;
}
