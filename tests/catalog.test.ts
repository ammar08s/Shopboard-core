import { test } from 'node:test';
import assert from 'node:assert/strict';

test('admin CRUD persists products, availability, and categories and keeps the cart consistent', async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  try {
    const data = await import('../src/features/products/state.ts');
    assert.equal(typeof data.saveProduct, 'function');
    const originalCount = data.products.length;
    const product = data.saveProduct({ name: 'Demo <Bag>', category: 'Travel', price: 42.5, image: '/images/product-1.jpg', inStock: true });
    assert.equal(data.products.length, originalCount + 1);
    assert.ok(data.categories.includes('Travel'));
    const saved = JSON.parse(storage.get(data.catalogStorageKey));
    assert.equal(saved.find((item) => item.id === product.id).name, 'Demo <Bag>');
    assert.equal((await import('../src/features/products/state.ts?reload')).products.find((item) => item.id === product.id).price, 42.5);
    data.saveProduct({ ...product, name: 'Updated bag', price: 60, inStock: false });
    const { changeCartQuantity } = await import('../src/features/cart/logic/changeCartQuantity.ts');
    const { restoreCartItems } = await import('../src/features/cart/logic/restoreCartItems.ts');
    const { calculateCartTotal } = await import('../src/features/cart/logic/calculateCartTotal.ts');
    assert.deepEqual(changeCartQuantity({}, product.id, 1, data.products), {});
    assert.deepEqual(restoreCartItems(JSON.stringify({ [product.id]: 2 }), data.products), {});
    data.saveProduct({ ...product, name: 'Updated bag', price: 60 });
    assert.equal(calculateCartTotal(changeCartQuantity({}, product.id, 1, data.products), data.products), 6000);
    const beforeInvalid = JSON.stringify(data.products);
    for (const changes of [{ name: ' ' }, { price: -1 }, { price: NaN }, { price: 1.234 }, { image: 'javascript:alert(1)' }]) {
      assert.throws(() => data.saveProduct({ ...product, ...changes }));
      assert.equal(JSON.stringify(data.products), beforeInvalid);
    }
    localStorage.setItem = () => { throw new Error('Storage full'); };
    assert.throws(() => data.saveProduct({ ...product, name: 'Not saved' }));
    assert.equal(JSON.stringify(data.products), beforeInvalid);
    localStorage.setItem = (key, value) => storage.set(key, value);
    data.deleteProduct(product.id);
    assert.equal(data.products.length, originalCount);
    assert.equal(data.categories.includes('Travel'), false);
    assert.equal(calculateCartTotal({ [product.id]: 1 }, data.products), 0);
    assert.deepEqual(restoreCartItems(JSON.stringify({ [product.id]: 1 }), data.products), {});
    for (const item of [...data.products]) data.deleteProduct(item.id);
    assert.equal((await import('../src/features/products/state.ts?empty')).products.length, 0);
    storage.set(data.catalogStorageKey, '{invalid');
    assert.equal((await import('../src/features/products/state.ts?corrupt')).products.length, originalCount);
  } finally {
    delete globalThis.localStorage;
  }
});
