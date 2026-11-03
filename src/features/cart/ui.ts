import type { CartOperations } from './types.ts';
import type { NotificationTone } from '../notifications/types.ts';
import { money } from '../../shared/formatting.ts';

// Input: injected cart operations and optional feedback; output: a bound cart view with a refresh operation.
export function initializeCart({ getCart, getCartProducts, cartTotal, onAdd, onQuantityChange, onClear, notify }: CartOperations) {
  const list = document.querySelector<HTMLElement>('#cart-items');
  const status = document.querySelector<HTMLElement>('#cart-status');

  // Input: message, title, and outcome tone; output: visible status plus a toast announced only once.
  function feedback(message: string, title: string, tone: NotificationTone) {
    status.textContent = message;
    notify?.({ message, title, tone, announce: false });
  }

  // Input: optional feedback; output: current items, totals, accessible controls, and outcome notification.
  function refreshCart(message = '', tone: NotificationTone = 'info', title = 'Cart updated') {
    const cart = getCart();
    const products = getCartProducts();
    list.replaceChildren();
    for (const [id, quantity] of Object.entries(cart)) {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = products[id].name;
      const price = document.createElement('p');
      price.textContent = `${money.format(products[id].price / 100)} each / ${money.format(products[id].price * quantity / 100)} subtotal`;
      const label = document.createElement('label');
      label.htmlFor = `quantity-${id}`;
      label.textContent = `Quantity for ${products[id].name}`;
      const input = document.createElement('input');
      Object.assign(input, { id: label.htmlFor, type: 'number', min: '1', max: '99', step: '1', value: String(quantity), required: true });
      // Input: a valid quantity change; output: saved quantity, updated totals, and a readable outcome.
      input.addEventListener('change', () => {
        if (!input.checkValidity()) { input.reportValidity(); return; }
        const warning = onQuantityChange(id, input.valueAsNumber);
        refreshCart(`${products[id].name} quantity updated.${warning}`, warning ? 'warning' : 'success');
        document.getElementById(input.id)?.focus();
      });
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'button'; remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${products[id].name} from cart`);
      // Input: remove click; output: removes this item, reports its outcome, and focuses the cart title.
      remove.addEventListener('click', () => {
        const warning = onQuantityChange(id, 0);
        refreshCart(`${products[id].name} removed.${warning}`, warning ? 'warning' : 'success');
        document.querySelector<HTMLElement>('#cart-title').focus();
      });
      item.append(name, price, label, input, remove); list.append(item);
    }
    // Input: running count and an item quantity; output: the next total cart item count.
    const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    document.querySelector<HTMLElement>('#cart-count').textContent = itemCount as unknown as string;
    document.querySelector<HTMLElement>('#cart-link').setAttribute('aria-label', `Your cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`);
    document.querySelector<HTMLElement>('#cart-total').textContent = money.format(cartTotal() / 100);
    document.querySelector<HTMLElement>('#cart-empty').hidden = Object.keys(cart).length > 0;
    document.querySelector<HTMLButtonElement>('#clear-cart').disabled = Object.keys(cart).length === 0;
    if (message) feedback(message, title, tone);
  }

  // Input: a product purchase click; output: an updated cart or a truthful failure notification.
  document.querySelector<HTMLElement>('#products .products').addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-add-to-cart]');
    if (!button) return;
    const product = getCartProducts()[button.dataset.addToCart];
    try {
      const warning = onAdd(button.dataset.addToCart);
      refreshCart(`${product.name} added to cart.${warning}`, warning ? 'warning' : 'success', 'Added to cart');
    } catch (error) { feedback(error.message, 'Could not add to cart', 'error'); }
  });
  // Input: clear-cart click; output: an empty cart, saved-state feedback, and focus on the cart heading.
  document.querySelector<HTMLButtonElement>('#clear-cart').addEventListener('click', () => {
    const warning = onClear(); refreshCart(`Cart cleared.${warning}`, warning ? 'warning' : 'success', 'Cart cleared');
    document.querySelector<HTMLElement>('#cart-title').focus();
  });
  refreshCart();
  return { refresh: refreshCart };
}
