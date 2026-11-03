import { test } from 'node:test';
import { createAdminProductFixture } from './helpers/admin-product-fixture.ts';
import { checkAdminProductCrud } from './helpers/admin-product-crud.ts';
import { checkAdminProductUpload } from './helpers/admin-product-upload.ts';
import { checkAdminProductErrors } from './helpers/admin-product-errors.ts';

// Input: an isolated dashboard; output: verified catalog actions, canceled uploads, and outcome notifications.
test('dashboard actions persist products and notify only their actual outcomes', async () => {
  const fixture = await createAdminProductFixture();
  try {
    checkAdminProductCrud(fixture);
    await checkAdminProductUpload(fixture);
    checkAdminProductErrors(fixture);
  } finally {
    fixture.cleanup();
  }
});
