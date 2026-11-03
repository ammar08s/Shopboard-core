import type { CatalogOperations, Product } from '../types.ts';
import { showProductStatus } from './status.ts';

interface AdminActions {
  edit: (product: Product) => void;
  remove: (product: Product) => void;
  refresh: () => void;
}

// Input: catalog operations and action callbacks; output: delegated edit, delete, and stock table events.
export function bindAdminActions(operations: CatalogOperations, actions: AdminActions) {
  const status = document.querySelector<HTMLElement>('#admin-status');
  // Input: a row action click; output: its editor, deletion dialog, or persisted stock update.
  document.querySelector<HTMLElement>('#admin-products').addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-action]');
    if (!button) return;
    // Input: a catalog item; output: whether its ID matches the clicked row.
    const product = operations.getProducts().find((item) => item.id === Number(button.dataset.id));
    if (!product) {
      showProductStatus(status, 'This product no longer exists. Refresh the catalog.', operations.notify, 'error');
      return;
    }
    if (button.dataset.action === 'edit') actions.edit(product);
    else if (button.dataset.action === 'delete') actions.remove(product);
    else if (button.dataset.action === 'stock') {
      try {
        const updated = operations.saveProduct({ ...product, inStock: !product.inStock });
        actions.refresh();
        showProductStatus(status, `${updated.name} marked ${updated.inStock ? 'in stock' : 'out of stock'}.`, operations.notify, 'success');
        document.querySelector<HTMLElement>(`[data-action="stock"][data-id="${product.id}"]`).focus();
      } catch (error) {
        showProductStatus(status, `Could not update availability. ${error.message}`, operations.notify, 'error');
      }
    }
  });
}
