import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProduct } from '../src/app/logic.js';

const product = { name: 'Photo test', category: 'New category', price: 25, inStock: true };
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';

test('catalog accepts uploaded photos and HTTP image URLs while rejecting unsupported sources', () => {
  for (const image of [png, 'https://example.com/my-product.jpg', 'http://localhost:5173/photo.png', '/images/product-1.jpg']) {
    assert.doesNotThrow(() => validateProduct({ ...product, image }));
  }
  for (const image of ['', 'javascript:alert(1)', 'data:text/html;base64,SGVsbG8=', 'data:image/svg+xml;base64,PHN2Zz4=', '//example.com/photo.jpg', 'file:///photo.jpg']) {
    assert.throws(() => validateProduct({ ...product, image }));
  }
});
