import { test } from 'node:test';
import assert from 'node:assert/strict';

// Input: a cart changed on another page; output: reloading before reconciliation preserves those purchases.
test('cart reload reads purchases from other pages before reconciliation', async () => {
  const storage = new Map();
  globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  try {
    const { createCartState } = await import('../src/features/cart/state.ts');
    const { cartStorageKey } = await import('../src/features/cart/data.ts');
    const cart = createCartState(() => [{ id: 1, name: 'Bag', price: 30, inStock: true }]);
    storage.set(cartStorageKey, JSON.stringify({ 1: 2 }));
    cart.reloadCart(); cart.reconcileCart();
    assert.deepEqual(cart.getCart(), { 1: 2 });
    cart.addToCart(1);
    assert.deepEqual(JSON.parse(storage.get(cartStorageKey)), { 1: 3 });
  } finally { delete globalThis.localStorage; }
});

// Input: readable but unwritable storage; output: repeated purchases accumulate in memory across reload attempts.
test('cart reload retains unsaved quantities until a later successful write', async () => {
  const storage = new Map();
  let writable = false;
  globalThis.localStorage = {
    // Input: a storage key; output: its previously saved value.
    getItem: (key) => storage.get(key) ?? null,
    // Input: key/value; output: a saved value, or a simulated quota failure.
    setItem(key, value) { if (!writable) throw new Error('Full'); storage.set(key, value); },
  };
  try {
    const { createCartState } = await import('../src/features/cart/state.ts');
    const cart = createCartState(() => [{ id: 1, name: 'Bag', price: 30, inStock: true }]);
    assert.match(cart.addToCart(1), /cannot be saved/);
    cart.reloadCart(); cart.addToCart(1);
    assert.deepEqual(cart.getCart(), { 1: 2 });
    writable = true;
    cart.reloadCart(); cart.addToCart(1);
    assert.deepEqual(cart.getCart(), { 1: 3 });
    const { cartStorageKey } = await import('../src/features/cart/data.ts');
    storage.set(cartStorageKey, JSON.stringify({ 1: 4 }));
    cart.reloadCart();
    assert.deepEqual(cart.getCart(), { 1: 4 });
  } finally { delete globalThis.localStorage; }
});
