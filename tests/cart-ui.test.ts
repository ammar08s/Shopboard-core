import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeCart } from '../src/features/cart/ui.ts';
import { createElement } from './helpers/dom.ts';

// Input: supplied cart operations; output: actual cart UI controls and captured action notifications.
function setup(overrides = {}) {
  const elements = new Map();
  // Input: a control selector; output: its stable test element.
  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, createElement());
    return elements.get(selector);
  };
  globalThis.document = { querySelector: element, createElement, getElementById: (id) => element(`#${id}`) };
  const notices = [];
  initializeCart({
    getCart: () => ({ 1: 1 }), getCartProducts: () => ({ 1: { name: 'Leather Tote Bag', price: 8900, inStock: true } }),
    cartTotal: () => 8900, onAdd: () => '', onQuantityChange: () => '', onClear: () => '',
    notify: (notice) => notices.push(notice), ...overrides,
  });
  return { element, notices };
}

// Input: successful cart controls; output: accurate add/change/remove/clear feedback.
test('cart actions emit helpful success toasts while retaining inline status messages', () => {
  const { element, notices } = setup();
  try {
    element('#products .products').listeners.click({ target: { closest: () => ({ dataset: { addToCart: '1' } }) } });
    assert.equal(notices.at(-1).tone, 'success');
    assert.match(notices.at(-1).message, /Leather Tote Bag added/);
    assert.equal(notices.at(-1).announce, false);
    const quantity = element('#cart-items').children[0].children[3];
    quantity.valueAsNumber = 2;
    quantity.listeners.change();
    assert.match(notices.at(-1).message, /quantity updated/);
    element('#cart-items').children[0].children[4].listeners.click();
    assert.match(notices.at(-1).message, /removed/);
    element('#clear-cart').listeners.click();
    assert.match(notices.at(-1).message, /Cart cleared/);
    assert.equal(element('#cart-status').textContent, notices.at(-1).message);
  } finally { delete globalThis.document; }
});

// Input: storage failure and rejected add operations; output: warning/error messages without false success.
test('cart storage warnings and failed additions are surfaced as warning/error toasts', () => {
  const { element, notices } = setup({ onAdd: () => ' Cart changes cannot be saved on this browser.' });
  const click = () => element('#products .products').listeners.click({ target: { closest: () => ({ dataset: { addToCart: '1' } }) } });
  try {
    click();
    assert.equal(notices.at(-1).tone, 'warning');
    assert.match(notices.at(-1).message, /cannot be saved/);
    const failed = setup({ onAdd() { throw new Error('This product is unavailable.'); } });
    failed.element('#products .products').listeners.click({ target: { closest: () => ({ dataset: { addToCart: '1' } }) } });
    assert.equal(failed.notices.at(-1).tone, 'error');
    assert.match(failed.notices.at(-1).message, /unavailable/);
  } finally { delete globalThis.document; }
});
