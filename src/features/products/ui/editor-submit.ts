import type { CatalogOperations, Product } from '../types.ts';
import type { EditorState } from '../editor/state.ts';
import type { EditorElements } from './editor-elements.ts';
import { selectedImage } from './editor-fields.ts';
import { showProductStatus } from './status.ts';

// Input: editor dependencies and save/close callbacks; output: a validating product form submit handler.
export function createEditorSubmit(elements: EditorElements, state: EditorState, operations: CatalogOperations,
  close: () => void, onSave: (product: Product, isEditing: boolean) => void) {
  // Input: a form submit event; output: a persisted product or retained input with error feedback.
  return function submit(event: Event) {
    event.preventDefault();
    const { readingImage, editingId } = state.get();
    if (readingImage || !elements.form.reportValidity()) return;
    try {
      const isEditing = editingId !== null;
      // Input: a current product; output: whether it matches the edited product ID.
      const stillExists = operations.getProducts().some((product) => product.id === editingId);
      if (isEditing && !stillExists) throw new Error('This product was deleted in another tab.');
      const product = operations.saveProduct({
        name: elements.name.value,
        category: elements.category.value === '__new__' ? elements.newCategory.value : elements.category.value.slice('existing:'.length),
        price: elements.price.valueAsNumber,
        inStock: elements.stock.value === 'true',
        image: selectedImage(elements, state),
      }, editingId ?? undefined);
      close();
      onSave(product, isEditing);
    } catch (error) {
      showProductStatus(elements.status, `Could not save product. ${error.message}`, operations.notify, 'error');
    }
  };
}
