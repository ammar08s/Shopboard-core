import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addToCart, updateCart, restoreCart, cartTotal } from './cart.js';

test('adding the same product increases quantity and totals use cents', () => {
  const cart = addToCart(addToCart(addToCart({}, 'notebook'), 'notebook'), 'notebook');
  assert.deepEqual(cart, { notebook: 3 });
  assert.equal(cartTotal({ ...cart, bottle: 1 }), 6000);
});

test('zero removes an item and invalid quantities do not change the cart', () => {
  assert.deepEqual(updateCart({ tote: 2 }, 'tote', 0), {});
  for (const quantity of [-1, 1.5, NaN, 100]) {
    assert.deepEqual(updateCart({ tote: 2 }, 'tote', quantity), { tote: 2 });
  }
  assert.deepEqual(updateCart({}, 'unknown', 1), {});
});

test('restoring ignores corrupt data and unknown products', () => {
  assert.deepEqual(restoreCart('{broken'), {});
  assert.deepEqual(restoreCart('null'), {});
  assert.deepEqual(restoreCart('{"notebook":2,"bottle":-1,"tote":100,"unknown":3}'), { notebook: 2 });
});
