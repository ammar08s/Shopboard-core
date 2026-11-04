import type { Product } from '../../products/types.ts';
import { escapeHtml } from '../../products/logic/escapeHtml.ts';
import { money } from '../../../shared/formatting.ts';

// Input: the current product or undefined; output: escaped product information or an actionable unavailable state.
export function renderProductDetail(product: Product | undefined) {
  const container = document.querySelector<HTMLElement>('#product-detail');
  document.querySelector<HTMLElement>('#product-reviews').hidden = !product;
  document.title = product ? `${product.name} | ShopBoard` : 'Product unavailable | ShopBoard';
  if (!product) {
    container.innerHTML = '<div class="product-unavailable"><p class="eyebrow">BACK TO THE COLLECTION</p><h1>Product unavailable</h1><p>This product may have been removed, or the link is invalid.</p><a class="button" href="/">Browse the collection</a></div>';
    return;
  }
  const name = escapeHtml(product.name);
  container.innerHTML = `
    <div class="detail-image"><img id="detail-photo" src="${escapeHtml(product.image)}" alt="${name}" width="800" height="800" /><p id="detail-image-fallback" hidden>Image unavailable</p></div>
    <div class="detail-information">
      <p class="eyebrow">${escapeHtml(product.category)}</p>
      <h1>${name}</h1>
      <p class="detail-reference">Product #${product.id}</p>
      <a class="detail-review-link" href="#product-reviews">Read and write demo reviews <span aria-hidden="true">↗</span></a>
      <p class="detail-price">${money.format(product.price)} <span>USD</span></p>
      <p class="stock-label ${product.inStock ? '' : 'out-of-stock'}">${product.inStock ? 'In stock · Ready to add to your cart' : 'Out of stock'}</p>
      ${product.description?.trim() ? `<section class="detail-description" aria-labelledby="description-title"><h2 id="description-title">About this product</h2><p class="product-description-copy">${escapeHtml(product.description)}</p></section>` : ''}
      <button class="button detail-add" type="button" data-add-to-cart="${product.id}" ${product.inStock ? '' : 'disabled'}>${product.inStock ? 'Add to cart' : 'Out of stock'} <span aria-hidden="true">+</span></button>
      <p class="detail-cart-note">Keep exploring. Your cart is saved in this browser.</p>
    </div>`;
}
