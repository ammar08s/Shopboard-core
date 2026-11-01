import { test } from 'node:test';
import assert from 'node:assert/strict';

test('dashboard form and row controls create, edit, toggle stock, cancel, and confirm deletion', async () => {
  const storage = new Map();
  globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const elements = new Map();
  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, {
      value: '', textContent: '', innerHTML: '', hidden: false, open: false, files: [], listeners: {},
      addEventListener(event, handler) { this.listeners[event] = handler; },
      focus() { this.focused = true; },
      removeAttribute(name) { delete this[name]; },
      reportValidity() { return true; },
      reset() {
        for (const id of ['#product-name', '#product-category', '#new-category', '#product-price', '#product-upload', '#product-image-url']) element(id).value = '';
        element('#product-image').value = '/images/product-1.jpg';
        element('#product-stock').value = 'true';
        element('#image-source').value = 'upload';
      },
      showModal() { this.open = true; },
      close() { this.open = false; },
      get valueAsNumber() { return this.value === '' ? NaN : Number(this.value); },
    });
    return elements.get(selector);
  };
  globalThis.document = { querySelector: element, body: { dataset: { page: 'admin' } } };
  globalThis.window = { addEventListener() {} };
  const submit = () => element('#product-form').listeners.submit({ preventDefault() {} });
  const action = (type, id) => element('#admin-products').listeners.click({ target: { closest: () => ({ dataset: { action: type, id: String(id) } }) } });
  const confirm = (value) => element('#delete-form').listeners.submit({ preventDefault() {}, submitter: { value } });
  try {
    await import('../src/main.js');
    const { products } = await import('../src/app/state.js');
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
    const id = products.at(-1).id;
    assert.ok(element('#admin-products').innerHTML.includes('&lt;Demo bag&gt;'));
    assert.equal(element('#product-count').textContent, originalCount + 1);
    action('edit', id);
    assert.equal(element('#product-name').value, '<Demo bag>');
    assert.equal(element('#product-category').value, 'existing:Travel');
    assert.equal(element('#image-source').value, 'url');
    element('#product-name').value = 'Edited bag';
    element('#product-price').value = '55';
    submit();
    assert.equal(products.find((product) => product.id === id).price, 55);
    action('stock', id);
    assert.equal(products.find((product) => product.id === id).inStock, false);
    action('edit', id);
    assert.equal(element('#product-stock').value, 'false');
    element('#product-name').value = 'Unsaved edit';
    element('#cancel-edit').listeners.click();
    assert.equal(products.find((product) => product.id === id).name, 'Edited bag');
    action('delete', id);
    assert.equal(element('#delete-dialog').open, true);
    confirm('cancel');
    assert.ok(products.some((product) => product.id === id));
    action('delete', id);
    confirm('delete');
    assert.equal(products.some((product) => product.id === id), false);
    assert.equal(element('#product-count').textContent, originalCount);
    const uploadedPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
    globalThis.FileReader = class {
      readAsDataURL() { this.result = uploadedPhoto; queueMicrotask(() => this.onload()); }
    };
    globalThis.Image = class { async decode() {} };
    element('#add-product').listeners.click();
    element('#product-name').value = 'Uploaded bag';
    element('#product-category').value = 'existing:Bags';
    element('#product-price').value = '25';
    element('#product-upload').files = [{ type: 'image/svg+xml', size: 100 }];
    await element('#product-upload').listeners.change();
    assert.ok(element('#editor-status').textContent.includes('Choose a JPG'));
    element('#product-upload').files = [{ type: 'image/png', size: 2 * 1024 * 1024 }];
    await element('#product-upload').listeners.change();
    assert.ok(element('#editor-status').textContent.includes('smaller than 1 MB'));
    element('#product-upload').files = [{ type: 'image/png', size: 100 }];
    const reading = element('#product-upload').listeners.change();
    assert.equal(element('#save-product').disabled, true);
    await reading;
    assert.equal(element('#save-product').disabled, false);
    assert.equal(element('#image-preview').src, uploadedPhoto);
    submit();
    assert.equal(products.at(-1).image, uploadedPhoto);
    const uploadedId = products.at(-1).id;
    action('edit', uploadedId);
    assert.equal(element('#image-source').value, 'upload');
    assert.equal(element('#product-upload').required, false);
    element('#product-name').value = 'Retained uploaded photo';
    submit();
    assert.equal(products.find((product) => product.id === uploadedId).image, uploadedPhoto);
    element('#add-product').listeners.click();
    element('#product-upload').files = [{ type: 'image/png', size: 100 }];
    const canceledRead = element('#product-upload').listeners.change();
    element('#cancel-edit').listeners.click();
    element('#add-product').listeners.click();
    await canceledRead;
    assert.equal(element('#image-preview').hidden, true);
    assert.equal(element('#save-product').disabled, false);
    element('#cancel-edit').listeners.click();
    action('edit', products[0].id);
    localStorage.setItem = () => { throw new Error('Storage full'); };
    element('#product-name').value = 'Keep this input';
    submit();
    assert.equal(element('#product-name').value, 'Keep this input');
    assert.ok(element('#editor-status').textContent.includes('Could not save product'));
    assert.equal(element('#product-dialog').open, true);
    element('#product-dialog').listeners.cancel({ preventDefault() {} });
    assert.equal(element('#product-dialog').open, false);
  } finally {
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.localStorage;
    delete globalThis.FileReader;
    delete globalThis.Image;
  }
});
