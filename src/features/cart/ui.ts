import type { CartOperations } from './types.ts';
import { money } from '../../shared/formatting.ts';

// initializeCart renders the cart and connects its labeled controls to state operations.
export function initializeCart({ getCart, getCartProducts, cartTotal, onAdd, onQuantityChange, onClear }: CartOperations) {
  const list = document.querySelector<HTMLElement>('#cart-items');
  const status = document.querySelector<HTMLElement>('#cart-status');

  // refreshCart displays current items, totals, and accessible quantity and remove controls.
  function refreshCart(message = '') {
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
      input.addEventListener('change', () => {
        if (!input.checkValidity()) { input.reportValidity(); return; }
        const warning = onQuantityChange(id, input.valueAsNumber);
        refreshCart(`${products[id].name} quantity updated.${warning}`);
        document.getElementById(input.id)?.focus();
      });
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'button'; remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${products[id].name} from cart`);
      remove.addEventListener('click', () => {
        const warning = onQuantityChange(id, 0);
        refreshCart(`${products[id].name} removed.${warning}`);
        document.querySelector<HTMLElement>('#cart-title').focus();
      });
      item.append(name, price, label, input, remove); list.append(item);
    }
    document.querySelector<HTMLElement>('#cart-count').textContent = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0) as unknown as string;
    document.querySelector<HTMLElement>('#cart-total').textContent = money.format(cartTotal() / 100);
    document.querySelector<HTMLElement>('#cart-empty').hidden = Object.keys(cart).length > 0;
    document.querySelector<HTMLButtonElement>('#clear-cart').disabled = Object.keys(cart).length === 0;
    if (message) status.textContent = message;
  }

  document.querySelector<HTMLElement>('#products .products').addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-add-to-cart]');
    if (!button) return;
    const product = getCartProducts()[button.dataset.addToCart];
    try {
      const warning = onAdd(button.dataset.addToCart);
      refreshCart(`${product.name} added to cart.${warning}`);
    } catch (error) { status.textContent = error.message; }
  });
  document.querySelector<HTMLButtonElement>('#clear-cart').addEventListener('click', () => {
    const warning = onClear(); refreshCart(`Cart cleared.${warning}`);
    document.querySelector<HTMLElement>('#cart-title').focus();
  });
  refreshCart();
  return { refresh: refreshCart };
}
