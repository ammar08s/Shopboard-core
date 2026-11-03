import assert from 'node:assert/strict';

// Input: a dashboard fixture; output: assertions that failed persistence never emits successful outcomes.
export function checkAdminProductErrors({ element, submit, action, confirm, products, notifications, preventDefault }) {
  action('edit', Number.MAX_SAFE_INTEGER);
  assert.equal(notifications.at(-1)?.tone, 'error');
  assert.match(notifications.at(-1)?.message ?? '', /no longer exists/);
  action('edit', products[0].id);
  element('#image-preview').listeners.error();
  assert.equal(element('#image-preview').hidden, true);
  assert.equal(notifications.at(-1)?.tone, 'error');
  assert.match(notifications.at(-1)?.message ?? '', /photo could not be displayed/);
  element('#product-price').value = '-1';
  submit();
  assert.equal(notifications.at(-1)?.tone, 'error');
  assert.match(notifications.at(-1)?.message ?? '', /Enter a price/);
  element('#product-price').value = String(products[0].price);
  // Input: storage key/value; output: a storage failure for all subsequent catalog mutations.
  localStorage.setItem = () => { throw new Error('Storage full'); };
  element('#product-name').value = 'Keep this input';
  submit();
  assert.equal(element('#product-name').value, 'Keep this input');
  assert.ok(element('#editor-status').textContent.includes('Could not save product'));
  assert.equal(element('#product-dialog').open, true);
  assert.equal(notifications.at(-1)?.tone, 'error');
  assert.match(notifications.at(-1)?.message ?? '', /Could not save product/);
  // Input: a notification; output: whether it reports a successful catalog action.
  const successes = notifications.filter((notification) => notification.tone === 'success').length;
  action('stock', products[0].id);
  assert.equal(notifications.at(-1)?.tone, 'error');
  assert.match(notifications.at(-1)?.message ?? '', /Could not update availability/);
  action('delete', products[0].id);
  confirm('delete');
  assert.equal(notifications.at(-1)?.tone, 'error');
  assert.match(notifications.at(-1)?.message ?? '', /Could not delete product/);
  // Input: a notification; output: whether it reports a successful catalog action.
  assert.equal(notifications.filter((notification) => notification.tone === 'success').length, successes);
  element('#product-dialog').listeners.cancel({ preventDefault });
  assert.equal(element('#product-dialog').open, false);
}
