import './products.js';
import { products, addToCart, updateCart, restoreCart, cartTotal } from './cart.js';
const storageKey = 'shopboard-cart';
const list = document.querySelector('#cart-items');
const status = document.querySelector('#cart-status');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
let cart = {};
try { cart = restoreCart(localStorage.getItem(storageKey)); } catch { /* Cart still works without storage. */ }

function render() {
  list.replaceChildren();
  for (const [id, quantity] of Object.entries(cart)) {
    const item = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = products[id].name;
    const price = document.createElement('p');
    price.textContent = `${money.format(products[id].price / 100)} each · ${money.format(products[id].price * quantity / 100)} subtotal`;
    const label = document.createElement('label');
    label.htmlFor = `quantity-${id}`;
    label.textContent = `Quantity for ${products[id].name}`;
    const input = document.createElement('input');
    Object.assign(input, { id: label.htmlFor, type: 'number', min: '1', max: '99', step: '1', value: String(quantity), required: true });
    input.addEventListener('change', () => {
      if (!input.checkValidity()) { input.reportValidity(); return; }
      cart = updateCart(cart, id, input.valueAsNumber);
      save(`${products[id].name} quantity updated.`, input.id);
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${products[id].name} from cart`);
    remove.addEventListener('click', () => {
      cart = updateCart(cart, id, 0);
      save(`${products[id].name} removed.`, 'cart-title');
    });
    item.append(name, price, label, input, remove);
    list.append(item);
  }
  document.querySelector('#cart-count').textContent = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  document.querySelector('#cart-total').textContent = money.format(cartTotal(cart) / 100);
  document.querySelector('#cart-empty').hidden = Object.keys(cart).length > 0;
  document.querySelector('#clear-cart').disabled = Object.keys(cart).length === 0;
}

function save(message, focusId) {
  try { localStorage.setItem(storageKey, JSON.stringify(cart)); }
  catch { message += ' Cart changes cannot be saved on this browser.'; }
  render();
  status.textContent = message;
  if (focusId) document.getElementById(focusId)?.focus();
}

// Handle clicks on the container so newly rendered cart buttons keep working.
document.querySelector('#products .products').addEventListener('click', (event) => {
  const button = event.target.closest('[data-add-to-cart]');
  if (!button) return;
  const id = button.dataset.addToCart;
  const quantity = cart[id] || 0;
  if (quantity === 99) { status.textContent = 'You can add up to 99 of each product.'; return; }
  cart = addToCart(cart, id);
  save(`${products[id].name} added to cart.`);
});
document.querySelector('#clear-cart').addEventListener('click', () => {
  cart = {};
  save('Cart cleared.', 'cart-title');
});
render();
console.log("hello")
