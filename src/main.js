import { products as photoOptions } from './app/data.js';
import * as state from './app/state.js';
import { getVisibleProducts } from './app/logic.js';
import * as ui from './app/ui.js';

let productsInitialized = false;

// renderProducts reads current controls and renders the matching products without changing the catalog.
function renderProducts() {
  state.setState(ui.readProductControls());
  ui.renderCollectionSummary(state.products.length, state.categories.length);
  ui.renderProductCards(getVisibleProducts(state.products, state.getState()));
}

// initializeProducts connects product controls to the shared rendering function once per page.
export function initializeProducts() {
  if (productsInitialized) return;
  productsInitialized = true;
  ui.renderCategories(state.categories);
  ui.bindProductControls(renderProducts);
  renderProducts();
}

// initializeShop connects product views, cart operations, registration, and catalog refresh events.
function initializeShop() {
  initializeProducts();
  const cartView = ui.initializeCart({
    getCart: state.getCart, getCartProducts: state.getCartProducts, cartTotal: state.cartTotal,
    onAdd: state.addToCart, onQuantityChange: state.updateCart, onClear: state.clearCart,
  });
  ui.initializeRegistration();
  const refresh = () => {
    state.refreshProducts();
    ui.renderCategories(state.categories);
    renderProducts();
    cartView.refresh(state.reconcileCart());
  };
  ui.bindPageEvents({
    onStorage(key) { if (key === state.catalogStorageKey || key === null) refresh(); },
    onPageShow: refresh,
  });
}

// initializeAdmin connects the dashboard view to catalog persistence and refresh operations.
function initializeAdmin() {
  const view = ui.initializeAdmin({
    photoOptions, getProducts: () => state.products, getCategories: () => state.categories,
    saveProduct: state.saveProduct, deleteProduct: state.deleteProduct,
  });
  const refresh = () => { state.refreshProducts(); view.refresh(); };
  ui.bindPageEvents({
    onStorage(key) {
      if (key !== state.catalogStorageKey && key !== null) return;
      refresh(); view.notify('The catalog was updated in another tab.');
    },
    onPageShow: refresh,
  });
}

const page = ui.getPage();
if (page === 'shop') initializeShop();
else if (page === 'admin') initializeAdmin();
else if (page === 'login') ui.initializeLogin();
