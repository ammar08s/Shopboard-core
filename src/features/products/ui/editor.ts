import type { CatalogOperations, Product } from '../types.ts';
import { createEditorState } from '../editor/state.ts';
import { escapeHtml } from '../logic/escapeHtml.ts';
import { getEditorElements } from './editor-elements.ts';
import { updateCategory } from './editor-fields.ts';
import { bindEditorImages } from './editor-images.ts';
import { openEditor } from './editor-open.ts';
import { createEditorSubmit } from './editor-submit.ts';

// Input: catalog operations and a saved-product callback; output: an editor controller with an open method.
export function createProductEditor(operations: CatalogOperations, onSave: (product: Product, isEditing: boolean) => void) {
  const elements = getEditorElements();
  const state = createEditorState();
  // Input: a demo product; output: its escaped demo-photo option markup.
  elements.demo.innerHTML = operations.photoOptions.map((product) => `<option value="/images/product-${product.id}.jpg">${escapeHtml(product.name)} demo photo</option>`).join('');
  // Input: an optional product; output: a new create/edit session in the dialog.
  function open(product: Product | null = null) { openEditor(elements, state, operations, product); }
  // Input: none; output: canceled pending uploads and a closed editor without saving.
  function close() { state.cancelRead(); elements.dialog.close(); }
  elements.form.addEventListener('submit', createEditorSubmit(elements, state, operations, close, onSave));
  // Input: a category selection change; output: matching new-category field requirements.
  elements.category.addEventListener('change', () => updateCategory(elements));
  bindEditorImages(elements, state, operations.notify);
  document.querySelector<HTMLElement>('#cancel-edit').addEventListener('click', close);
  document.querySelector<HTMLElement>('#close-editor').addEventListener('click', close);
  // Input: an Escape cancellation; output: canceled pending reads and a dismissed dialog.
  elements.dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  return { open };
}
