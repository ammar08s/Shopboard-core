import type { CatalogOperations, Product } from '../types.ts';
import { createDeletionState } from '../admin/state.ts';
import { showProductStatus } from './status.ts';

// Input: catalog operations and a dashboard refresh callback; output: a bound deletion confirmation controller.
export function createDeletionDialog(operations: CatalogOperations, refresh: () => void) {
  const state = createDeletionState();
  const dialog = document.querySelector<HTMLDialogElement>('#delete-dialog');
  const status = document.querySelector<HTMLElement>('#admin-status');
  // Input: a product; output: its pending ID and visible confirmation dialog.
  function open(product: Product) {
    state.select(product.id);
    document.querySelector<HTMLElement>('#delete-description').textContent = `Delete ${product.name} from this browser's catalog? It will also be removed from the shop and cart.`;
    dialog.showModal();
  }
  // Input: a delete/cancel form submit; output: a confirmed deletion or dismissed confirmation.
  function confirm(event: SubmitEvent) {
    event.preventDefault();
    if ((event.submitter as HTMLButtonElement)?.value !== 'delete') {
      dialog.close();
      state.clear();
      return;
    }
    try {
      const id = state.get();
      // Input: a catalog item; output: whether it matches the pending deletion ID.
      const product = operations.getProducts().find((item) => item.id === id);
      if (!product) throw new Error('This product no longer exists.');
      operations.deleteProduct(id);
      state.clear();
      dialog.close();
      refresh();
      showProductStatus(status, `${product.name} deleted. Changes saved in this browser.`, operations.notify, 'success');
      document.querySelector<HTMLElement>('#catalog-title').focus();
    } catch (error) {
      state.clear();
      dialog.close();
      showProductStatus(status, `Could not delete product. ${error.message}`, operations.notify, 'error');
    }
  }
  document.querySelector<HTMLFormElement>('#delete-form').addEventListener('submit', confirm);
  dialog.addEventListener('cancel', state.clear);
  return { open };
}
