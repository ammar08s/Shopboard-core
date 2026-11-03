import { products as photoOptions } from './features/products/data.ts';
import * as productState from './features/products/state.ts';
import { renderCategories } from './features/products/ui/categories.ts';
import { readProductControls, bindProductControls } from './features/products/ui/controls.ts';
import { renderProductCards } from './features/products/ui/cards.ts';
import { renderProductResults, renderCollectionSummary } from './features/products/ui/results.ts';
import { initializeAdmin as initializeAdminView } from './features/products/ui/admin.ts';
import { getVisibleProducts } from './features/products/logic/getVisibleProducts.ts';
import { createCartState } from './features/cart/state.ts';
import { initializeCart } from './features/cart/ui.ts';
import { initializeLogin, initializeRegistration } from './features/account/ui.ts';
import { initializeNotifications } from './features/notifications/ui.ts';
import type { Notify } from './features/notifications/types.ts';
import { getPage, bindPageEvents } from './shared/ui.ts';

// Input: no getter arguments; output: the latest catalog for cart state calculations.
const cartState = createCartState(() => productState.products);

// Input: current catalog and browsing selections; output: synchronized cards, filters, and result feedback.
function renderProducts() {
  productState.setState(readProductControls());
  const selections = productState.getState();
  const visibleProducts = getVisibleProducts(productState.products, selections);
  renderCollectionSummary(productState.products.length, productState.categories.length);
  renderProductResults(visibleProducts, selections, productState.categories);
  renderProductCards(visibleProducts);
}

// Input: the storefront DOM; output: product controls connected once to the current catalog.
export function initializeProducts() {
  if (!productState.claimProductInitialization()) return;
  renderCategories(productState.categories);
  bindProductControls(renderProducts);
  renderProducts();
}

// Input: notification callback; output: connected storefront, cart, registration, and catalog refresh handlers.
function initializeShop(notify: Notify) {
  initializeProducts();
  const cartView = initializeCart({
    getCart: cartState.getCart, getCartProducts: cartState.getCartProducts, cartTotal: cartState.cartTotal,
    onAdd: cartState.addToCart, onQuantityChange: cartState.updateCart, onClear: cartState.clearCart, notify,
  });
  initializeRegistration(notify);
  // Input: a catalog refresh event; output: current categories, cards, and reconciled cart feedback.
  const refresh = () => {
    productState.refreshProducts();
    renderCategories(productState.categories);
    renderProducts();
    cartView.refresh(cartState.reconcileCart(), 'warning');
  };
  bindPageEvents({
    // Input: changed storage key; output: refreshes only catalog-affecting changes.
    onStorage(key) { if (key === productState.catalogStorageKey || key === null) refresh(); },
    onPageShow: refresh,
  });
}

// Input: notification callback; output: connected admin editor, catalog refresh, and demo arrival feedback.
function initializeAdmin(notify: Notify) {
  const view = initializeAdminView({
    // Input: no getter arguments; output: the current product and category lists for the admin UI.
    photoOptions, getProducts: () => productState.products, getCategories: () => productState.categories,
    saveProduct: productState.saveProduct, deleteProduct: productState.deleteProduct, notify,
  });
  notify({ title: 'Welcome to your dashboard', message: 'This is a demo workspace. Product changes are saved in this browser.', tone: 'info' });
  // Input: a catalog refresh event; output: reloads saved products and redraws the dashboard.
  const refresh = () => { productState.refreshProducts(); view.refresh(); };
  bindPageEvents({
    // Input: changed storage key; output: refreshes the catalog and explains relevant cross-tab updates.
    onStorage(key) {
      if (key !== productState.catalogStorageKey && key !== null) return;
      refresh(); view.notify('The catalog was updated in another tab.');
    },
    onPageShow: refresh,
  });
}

const page = getPage();
if (page === 'shop') initializeShop(initializeNotifications());
else if (page === 'admin') initializeAdmin(initializeNotifications());
else if (page === 'login') initializeLogin();
