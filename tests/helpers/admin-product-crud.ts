import assert from 'node:assert/strict';

// Input: a dashboard fixture; output: assertions covering CRUD, stock, notifications, and cancellations.
export function checkAdminProductCrud({ element, submit, action, confirm, products, notifications, view }) {
  const originalCount = products.length;
  assert.equal(element('#product-dialog').open, false);
  element('#add-product').listeners.click();
  assert.equal(element('#product-dialog').open, true);
  element('#product-name').value = '<Demo bag>';
  element('#product-category').value = '__new__';
  element('#product-category').listeners.change();
  assert.equal(element('#new-category-field').hidden, false);
  element('#new-category').value = 'Travel';
  element('#product-price').value = '45.25';
  element('#image-source').value = 'url';
  element('#image-source').listeners.change();
  element('#product-image-url').value = 'https://example.com/bag.jpg';
  element('#product-image-url').listeners.input();
  assert.equal(element('#image-preview').src, 'https://example.com/bag.jpg');
  element('#product-stock').value = 'true';
  submit();
  assert.equal(products.length, originalCount + 1);
  assert.equal(element('#product-dialog').open, false);
  assert.equal(products.at(-1).category, 'Travel');
  assert.equal(products.at(-1).image, 'https://example.com/bag.jpg');
  assert.equal(notifications.at(-1)?.tone, 'success');
  assert.match(notifications.at(-1)?.message ?? '', /<Demo bag> added/);
  assert.equal(notifications.at(-1)?.announce, false);
  const id = products.at(-1).id;
  assert.ok(element('#admin-products').innerHTML.includes('&lt;Demo bag&gt;'));
  assert.equal(element('#product-count').textContent, String(originalCount + 1));
  action('edit', id);
  assert.equal(element('#product-name').value, '<Demo bag>');
  assert.equal(element('#product-category').value, 'existing:Travel');
  assert.equal(element('#image-source').value, 'url');
  element('#product-name').value = 'Edited bag';
  element('#product-price').value = '55';
  submit();
  // Input: a product; output: whether it matches the saved test product ID.
  assert.equal(products.find((product) => product.id === id).price, 55);
  assert.match(notifications.at(-1)?.message ?? '', /Edited bag updated/);
  action('stock', id);
  // Input: a product; output: whether it matches the saved test product ID.
  assert.equal(products.find((product) => product.id === id).inStock, false);
  assert.match(notifications.at(-1)?.message ?? '', /marked out of stock/);
  action('edit', id);
  assert.equal(element('#product-stock').value, 'false');
  element('#product-name').value = 'Unsaved edit';
  const beforeCancel = notifications.length;
  element('#cancel-edit').listeners.click();
  // Input: a product; output: whether it matches the saved test product ID.
  assert.equal(products.find((product) => product.id === id).name, 'Edited bag');
  assert.equal(notifications.length, beforeCancel);
  action('delete', id);
  assert.equal(element('#delete-dialog').open, true);
  confirm('cancel');
  // Input: a product; output: whether it still has the canceled deletion ID.
  assert.ok(products.some((product) => product.id === id));
  assert.equal(notifications.length, beforeCancel);
  action('delete', id);
  confirm('delete');
  // Input: a product; output: whether it has the confirmed deletion ID.
  assert.equal(products.some((product) => product.id === id), false);
  assert.match(notifications.at(-1)?.message ?? '', /Edited bag deleted/);
  assert.equal(element('#product-count').textContent, String(originalCount));
  view.notify('The catalog was updated in another tab.');
  assert.equal(notifications.at(-1).tone, 'info');
  assert.equal(notifications.at(-1).message, element('#admin-status').textContent);
}
