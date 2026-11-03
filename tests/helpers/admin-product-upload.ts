import assert from 'node:assert/strict';

// Input: a dashboard fixture; output: assertions covering raster validation, retained photos, and canceled reads.
export async function checkAdminProductUpload({ element, submit, action, products, notifications }) {
  const uploadedPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
  globalThis.FileReader = class {
    // Input: an uploaded file; output: an asynchronously completed raster data URL read.
    readAsDataURL() {
      this.result = uploadedPhoto;
      // Input: none; output: a completed file reader callback on the next microtask.
      queueMicrotask(() => this.onload());
    }
  };
  globalThis.Image = class {
    // Input: the current image source; output: a resolved simulated decode promise.
    async decode() {}
  };
  element('#add-product').listeners.click();
  element('#product-name').value = 'Uploaded bag';
  element('#product-category').value = 'existing:Bags';
  element('#product-price').value = '25';
  element('#product-upload').files = [{ type: 'image/svg+xml', size: 100 }];
  await element('#product-upload').listeners.change();
  assert.ok(element('#editor-status').textContent.includes('Choose a JPG'));
  assert.equal(notifications.at(-1)?.tone, 'error');
  assert.equal(notifications.at(-1)?.message, element('#editor-status').textContent);
  assert.equal(notifications.at(-1)?.announce, false);
  element('#product-upload').files = [{ type: 'image/png', size: 2 * 1024 * 1024 }];
  await element('#product-upload').listeners.change();
  assert.ok(element('#editor-status').textContent.includes('smaller than 1 MB'));
  assert.equal(notifications.at(-1)?.tone, 'error');
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
  // Input: a product; output: whether it is the product with the retained uploaded photo.
  assert.equal(products.find((product) => product.id === uploadedId).image, uploadedPhoto);
  element('#add-product').listeners.click();
  element('#product-upload').files = [{ type: 'image/png', size: 100 }];
  const canceledRead = element('#product-upload').listeners.change();
  const beforeCanceledRead = notifications.length;
  element('#cancel-edit').listeners.click();
  element('#add-product').listeners.click();
  await canceledRead;
  assert.equal(element('#image-preview').hidden, true);
  assert.equal(element('#save-product').disabled, false);
  assert.equal(notifications.length, beforeCanceledRead);
  element('#cancel-edit').listeners.click();
}
