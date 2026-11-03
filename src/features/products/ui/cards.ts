import type { Product } from '../types.ts';
import { escapeHtml } from '../logic/escapeHtml.ts';
import { money } from '../../../shared/formatting.ts';

// Input: visible products; output: semantic product cards or the empty-results message in the DOM.
export function renderProductCards(products: Product[]) {
  const container = document.querySelector<HTMLElement>('#products .products');
  // Input: a product; output: escaped product card markup with its stock-dependent action.
  const cards = products.map((product) => `
    <article class="product-card" aria-labelledby="product-${product.id}-title">
      <div class="product-image"><img class="product-photo" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" width="800" height="800" loading="lazy" /><span class="image-fallback" hidden>Image unavailable</span></div>
      <div class="product-details">
        <h2 id="product-${product.id}-title">${escapeHtml(product.name)}</h2>
        <p class="category-label">${escapeHtml(product.category)}</p>
        <p class="price">${money.format(product.price)} <span class="price-currency">USD</span></p>
        <p class="stock-label ${product.inStock ? '' : 'out-of-stock'}">${product.inStock ? 'In stock' : 'Out of stock'}</p>
        <button class="button" type="button" ${product.inStock ? '' : 'disabled'} data-add-to-cart="${product.id}" aria-label="Add ${escapeHtml(product.name)} to cart">${product.inStock ? 'Add to cart <span aria-hidden="true">+</span>' : 'Out of stock'}</button>
      </div>
    </article>
  `).join('');
  container.innerHTML = products.length ? cards : `<div class="empty-results"><span class="empty-symbol" aria-hidden="true">?</span><h2>No products found</h2><p>Try a different search or clear your filters to see the whole collection.</p><button class="button" type="button" data-reset-filters>Clear filters</button></div>`;
}
