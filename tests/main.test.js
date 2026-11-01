import { test } from 'node:test';
import assert from 'node:assert/strict';

test('shared entry point keeps shop cart, catalog updates, registration, and demo login connected', async () => {
  const storage = new Map();
  globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const elements = new Map();
  const makeElement = () => ({
    value: '', innerHTML: '', textContent: '', listeners: {}, children: [],
    addEventListener(event, handler) { this.listeners[event] = handler; },
    replaceChildren() { this.children = []; },
    append(...children) { this.children.push(...children); },
    setAttribute(name, value) { this[name] = value; },
    focus() {},
    checkValidity() { return true; },
  });
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, makeElement());
    return elements.get(id);
  };
  const browserEvents = {};
  globalThis.document = {
    body: { dataset: { page: 'shop' } }, querySelector: element,
    createElement: makeElement, getElementById: (id) => element(`#${id}`),
  };
  let loginDestination;
  globalThis.window = {
    addEventListener: (event, handler) => { browserEvents[event] = handler; },
    location: { assign: (url) => { loginDestination = url; } },
  };
  try {
    await import('../src/main.js');
    element('#products .products').listeners.click({ target: { closest: () => ({ dataset: { addToCart: '1' } }) } });
    assert.equal(element('#cart-count').textContent, 1);
    assert.equal(element('#cart-total').textContent, '$89.00');
    assert.equal(element('#cart-items').children.length, 1);
    const quantityInput = element('#cart-items').children[0].children[3];
    quantityInput.valueAsNumber = 2;
    quantityInput.listeners.change();
    assert.equal(element('#cart-total').textContent, '$178.00');
    const state = await import('../src/app/state.js');
    state.saveProduct({ ...state.products[0], inStock: false });
    browserEvents.storage({ key: state.catalogStorageKey });
    assert.equal(element('#cart-count').textContent, 0);
    assert.ok(element('#products .products').innerHTML.includes('Out of stock'));
    assert.ok(element('#cart-status').textContent.includes('Unavailable products'));
    let prevented = false;
    element('#register form').listeners.submit({ preventDefault: () => { prevented = true; } });
    assert.equal(prevented, true);
    assert.ok(element('#register-status').textContent.includes('has not created an account'));
    const { initializeLogin } = await import('../src/app/ui.js');
    initializeLogin();
    let reset = false;
    element('#admin-login-form').listeners.submit({ preventDefault() {}, currentTarget: { reset: () => { reset = true; } } });
    assert.equal(reset, true);
    assert.equal(loginDestination, '/admin-dashboard.html');
  } finally {
    delete globalThis.document; delete globalThis.window; delete globalThis.localStorage;
  }
});
