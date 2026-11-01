import { test } from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/app/data.js';
import { changeCartQuantity, restoreCartItems, calculateCartTotal } from '../src/app/logic.js';

test('changing quantities updates the cart and totals use cents', () => {
  const firstCart = changeCartQuantity({}, 'notebook', 1, products);
  const cart = changeCartQuantity(firstCart, 'notebook', 3, products);
  assert.deepEqual(firstCart, { notebook: 1 });
  assert.deepEqual(cart, { notebook: 3 });
  assert.equal(calculateCartTotal({ ...cart, bottle: 1 }, products), 6000);
});

test('zero removes an item and invalid quantities do not change the cart', () => {
  assert.deepEqual(changeCartQuantity({ tote: 2 }, 'tote', 0, products), {});
  for (const quantity of [-1, 1.5, NaN, 100]) {
    assert.deepEqual(changeCartQuantity({ tote: 2 }, 'tote', quantity, products), { tote: 2 });
  }
  assert.deepEqual(changeCartQuantity({}, 'unknown', 1, products), {});
});

test('restoring ignores corrupt data and unknown products', () => {
  assert.deepEqual(restoreCartItems('{broken', products), {});
  assert.deepEqual(restoreCartItems('null', products), {});
  assert.deepEqual(restoreCartItems('{"notebook":2,"bottle":-1,"tote":100,"unknown":3}', products), { notebook: 2 });
});
