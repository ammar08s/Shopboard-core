import type { CatalogOperations } from '../types.ts';
import { renderDashboard } from './dashboard.ts';
import { createProductEditor } from './editor.ts';
import { createDeletionDialog } from './deletion.ts';
import { bindAdminActions } from './admin-actions.ts';
import { showProductStatus } from './status.ts';

// Input: injected catalog operations and optional notifier; output: dashboard refresh and status operations.
export function initializeAdmin(operations: CatalogOperations) {
  const status = document.querySelector<HTMLElement>('#admin-status');
  // Input: none; output: refreshed dashboard data using the current catalog.
  function refresh() { renderDashboard(operations.getProducts(), operations.getCategories()); }
  // Input: a saved product and edit flag; output: refreshed catalog, success feedback, and restored focus.
  const editor = createProductEditor(operations, (product, isEditing) => {
    refresh();
    showProductStatus(status, `${product.name} ${isEditing ? 'updated' : 'added'}. Changes saved in this browser.`, operations.notify, 'success');
    document.querySelector<HTMLElement>('#add-product').focus();
  });
  const deletion = createDeletionDialog(operations, refresh);
  bindAdminActions(operations, { edit: editor.open, remove: deletion.open, refresh });
  // Input: an Add product click; output: an empty product editor dialog.
  document.querySelector<HTMLElement>('#add-product').addEventListener('click', () => editor.open());
  refresh();
  return {
    refresh,
    // Input: a catalog refresh message; output: matching inline status and informational toast.
    notify(message: string) { showProductStatus(status, message, operations.notify); },
  };
}
