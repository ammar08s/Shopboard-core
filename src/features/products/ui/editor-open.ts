import type { CatalogOperations, Product } from '../types.ts';
import type { EditorState } from '../editor/state.ts';
import type { EditorElements } from './editor-elements.ts';
import { escapeHtml } from '../logic/escapeHtml.ts';
import { updateCategory, updateImageFields } from './editor-fields.ts';

// Input: editor dependencies and an optional product; output: a reset dialog ready to create or edit.
export function openEditor(elements: EditorElements, state: EditorState, operations: CatalogOperations, product: Product | null) {
  state.reset(product?.id ?? null, product?.image.startsWith('data:') ? product.image : '');
  elements.form.reset();
  elements.status.textContent = '';
  // Input: a category; output: its escaped existing-category option markup.
  elements.category.innerHTML = '<option value="">Choose a category</option>' + operations.getCategories().map((category) => `<option value="existing:${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('') + '<option value="__new__">+ Add a new category...</option>';
  elements.source.value = 'upload';
  elements.title.textContent = product ? 'Edit product' : 'Add product';
  elements.save.textContent = product ? 'Save changes' : 'Add product';
  if (product) {
    elements.name.value = product.name;
    elements.category.value = `existing:${product.category}`;
    elements.price.value = String(product.price);
    elements.stock.value = String(product.inStock);
    if (product.image.startsWith('/images/')) {
      elements.source.value = 'demo';
      elements.demo.value = product.image;
    } else if (!product.image.startsWith('data:')) {
      elements.source.value = 'url';
      elements.url.value = product.image;
    }
  }
  updateCategory(elements);
  updateImageFields(elements, state);
  elements.dialog.showModal();
  elements.name.focus();
}
