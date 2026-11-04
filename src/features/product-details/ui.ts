import type { ProductDetailOperations } from './types.ts';
import { getProductId } from './logic.ts';
import { renderProductDetail } from './ui/product.ts';
import { bindPageEvents } from '../../shared/ui.ts';

// Input: injected catalog, cart, and review operations; output: a connected standalone product detail page.
export function initializeProductDetails(operations: ProductDetailOperations) {
  const id = getProductId(window.location.search);
  const container = document.querySelector<HTMLElement>('#product-detail');
  const status = document.querySelector<HTMLElement>('#product-purchase-status');
  let reviews: { refresh: () => void } | undefined;
  // Input: the current catalog; output: whether the linked product is still available for reviews.
  function canReview() {
    operations.refreshProducts();
    // Input: a catalog product; output: whether it matches this page's product ID.
    return operations.getProducts().some((product) => product.id === id);
  }
  // Input: the current cart; output: the page's total item badge and accessible cart link.
  function updateCartCount() {
    // Input: running count and a product quantity; output: total units in the cart.
    const count = Object.values(operations.getCart()).reduce((total, quantity) => total + quantity, 0);
    document.querySelector<HTMLElement>('#cart-count').textContent = String(count);
    document.querySelector<HTMLElement>('#cart-link').setAttribute('aria-label', `Your cart, ${count} ${count === 1 ? 'item' : 'items'}`);
  }
  // Input: catalog/storage updates; output: current product information, reviews, cart badge, and image fallback.
  function refresh() {
    operations.refreshProducts(); operations.reloadCart();
    // Input: a catalog product; output: whether its stable ID matches the URL.
    const product = operations.getProducts().find((item) => item.id === id);
    renderProductDetail(product);
    if (product && !reviews) reviews = operations.bindReviews(product.id, canReview);
    else if (product) reviews?.refresh();
    updateCartCount();
  }
  // Input: a failed product image load; output: a visible image fallback without a broken-image icon.
  container.addEventListener('error', (event) => {
    const image = event.target as HTMLImageElement;
    if (image.id !== 'detail-photo') return;
    image.hidden = true;
    document.querySelector<HTMLElement>('#detail-image-fallback').hidden = false;
  }, true);
  // Input: a purchase click; output: one cart addition or truthful availability/storage feedback.
  container.addEventListener('click', (event) => {
    if (!(event.target as Element).closest('[data-add-to-cart]')) return;
    try {
      if (!canReview()) { refresh(); throw new Error('This product is no longer available.'); }
      operations.reloadCart();
      const warning = operations.onAdd(id);
      status.textContent = `Added to your cart.${warning}`;
      updateCartCount();
      operations.notify?.({ title: 'Added to cart', message: status.textContent, tone: warning ? 'warning' : 'success', announce: false });
    } catch (error) {
      status.textContent = error.message;
      operations.notify?.({ title: 'Could not add to cart', message: error.message, tone: 'error', announce: false });
      refresh();
    }
  });
  bindPageEvents({ onStorage: refresh, onPageShow: refresh });
  refresh();
  return { refresh };
}
