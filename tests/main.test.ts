import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as makeElement } from './helpers/dom.ts';

// Input: browser events and user controls; output: connected catalog/cart/account behavior and toasts.
test('shared entry point keeps shop cart, catalog updates, registration, and demo login connected', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const storage = new Map();
  globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const elements = new Map();
  // Input: a selector; output: its stable page control.
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, makeElement());
    return elements.get(id);
  };
  const browserEvents = {};
  globalThis.document = {
    body: Object.assign(makeElement('body'), { dataset: { page: 'shop' } }),
    querySelector: (selector) => selector === 'dialog[open]' ? null : element(selector),
    addEventListener() {},
    createElement: makeElement, getElementById: (id) => element(`#${id}`),
  };
  let loginDestination;
  globalThis.window = {
    addEventListener: (event, handler) => { browserEvents[event] = handler; },
    location: { assign: (url) => { loginDestination = url; } },
  };
  try {
    await import('../src/main.ts');
    element('#products .products').listeners.click({ target: { closest: () => ({ dataset: { addToCart: '1' } }) } });
    assert.equal(element('#cart-count').textContent, 1);
    assert.equal(element('#cart-link')['aria-label'], 'Your cart, 1 item');
    assert.equal(element('#cart-total').textContent, '$89.00');
    const toastList = document.body.children[0].children[1];
    assert.equal(toastList.children[0].children[1].children[0].textContent, 'Added to cart');
    assert.equal(element('#cart-items').children.length, 1);
    const quantityInput = element('#cart-items').children[0].children[3];
    quantityInput.valueAsNumber = 2;
    quantityInput.listeners.change();
    assert.equal(element('#cart-total').textContent, '$178.00');
    assert.equal(element('#cart-link')['aria-label'], 'Your cart, 2 items');
    const state = await import('../src/features/products/state.ts');
    state.saveProduct({ ...state.products[0], inStock: false });
    browserEvents.storage({ key: state.catalogStorageKey });
    assert.equal(element('#cart-count').textContent, 0);
    assert.ok(element('#products .products').innerHTML.includes('Out of stock'));
    assert.ok(element('#cart-status').textContent.includes('Unavailable products'));
    element('#categorySelect').value = 'Bags';
    element('#categorySelect').listeners.change();
    assert.equal(element('#result-count').textContent, '4 products');
    for (const product of state.products.filter((item) => item.category === 'Bags')) state.deleteProduct(product.id);
    browserEvents.storage({ key: state.catalogStorageKey });
    assert.equal(element('#categorySelect').value, '');
    assert.equal(element('#products-title').textContent, 'All products');
    assert.equal(element('#result-count').textContent, '8 products');
    let prevented = false;
    element('#register form').listeners.submit({ preventDefault: () => { prevented = true; } });
    assert.equal(prevented, true);
    assert.ok(element('#register-status').textContent.includes('has not created an account'));
    context.mock.timers.tick(5000);
    assert.ok(toastList.children.some((toast) => toast.children[1].children[0].textContent === 'Details validated'));
    const { initializeLogin } = await import('../src/features/account/ui.ts');
    initializeLogin();
    let reset = false;
    element('#admin-login-form').listeners.submit({ preventDefault() {}, currentTarget: { reset: () => { reset = true; } } });
    assert.equal(reset, true);
    assert.equal(loginDestination, '/admin-dashboard.html');
  } finally {
    delete globalThis.document; delete globalThis.window; delete globalThis.localStorage;
  }
});
