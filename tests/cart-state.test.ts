import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCartState } from '../src/features/cart/state.ts';
import { cartStorageKey } from '../src/features/cart/data.ts';

test('cart owns its storage and uses the latest supplied catalog without importing product state', () => {
  const storage = new Map([[cartStorageKey, '{"1":2}']]);
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  });
  let catalog = [{ id: 1, name: 'Test bag', category: 'Bags', price: 10, image: '/images/product-1.jpg', inStock: true }];
  try {
    const cart = createCartState(() => catalog);
    assert.deepEqual(cart.getCart(), { 1: 2 });
    assert.equal(cart.cartTotal(), 2000);

    const copy = cart.getCart();
    copy['1'] = 99;
    assert.equal(cart.getCart()['1'], 2);

    cart.addToCart(1);
    assert.deepEqual(JSON.parse(storage.get(cartStorageKey)), { 1: 3 });
    catalog = [{ ...catalog[0], price: 15 }];
    assert.equal(cart.cartTotal(), 4500);

    catalog = [{ ...catalog[0], inStock: false }];
    assert.throws(() => cart.addToCart(1), /unavailable/);
    assert.match(cart.reconcileCart(), /Unavailable products were removed/);
    assert.deepEqual(cart.getCart(), {});
    assert.equal(storage.get(cartStorageKey), '{}');

    globalThis.localStorage.setItem = () => { throw new Error('Storage full'); };
    assert.match(cart.addToCart('notebook'), /cannot be saved/);
    assert.equal(cart.getCart().notebook, 1);
    cart.clearCart();
    assert.deepEqual(cart.getCart(), {});
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else delete globalThis.localStorage;
  }
});
