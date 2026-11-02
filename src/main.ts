import { products as photoOptions } from './features/products/data.ts';
import * as productState from './features/products/state.ts';
import * as productUi from './features/products/ui.ts';
import { getVisibleProducts } from './features/products/logic/getVisibleProducts.ts';
import { createCartState } from './features/cart/state.ts';
import { initializeCart } from './features/cart/ui.ts';
import * as accountUi from './features/account/ui.ts';
import { getPage, bindPageEvents } from './shared/ui.ts';

const cartState = createCartState(() => productState.products);

let productsInitialized = false;

// renderProducts reads current controls and renders the matching products without changing the catalog.
function renderProducts() {
  productState.setState(productUi.readProductControls());
  productUi.renderCollectionSummary(productState.products.length, productState.categories.length);
  productUi.renderProductCards(getVisibleProducts(productState.products, productState.getState()));
}

// initializeProducts connects product controls to the shared rendering function once per page.
export function initializeProducts() {
  if (productsInitialized) return;
  productsInitialized = true;
  productUi.renderCategories(productState.categories);
  productUi.bindProductControls(renderProducts);
  renderProducts();
}

// initializeShop connects product views, cart operations, registration, and catalog refresh events.
function initializeShop() {
  initializeProducts();
  const cartView = initializeCart({
    getCart: cartState.getCart, getCartProducts: cartState.getCartProducts, cartTotal: cartState.cartTotal,
    onAdd: cartState.addToCart, onQuantityChange: cartState.updateCart, onClear: cartState.clearCart,
  });
  accountUi.initializeRegistration();
  const refresh = () => {
    productState.refreshProducts();
    productUi.renderCategories(productState.categories);
    renderProducts();
    cartView.refresh(cartState.reconcileCart());
  };
  bindPageEvents({
    onStorage(key) { if (key === productState.catalogStorageKey || key === null) refresh(); },
    onPageShow: refresh,
  });
}

// initializeAdmin connects the dashboard view to catalog persistence and refresh operations.
function initializeAdmin() {
  const view = productUi.initializeAdmin({
    photoOptions, getProducts: () => productState.products, getCategories: () => productState.categories,
    saveProduct: productState.saveProduct, deleteProduct: productState.deleteProduct,
  });
  const refresh = () => { productState.refreshProducts(); view.refresh(); };
  bindPageEvents({
    onStorage(key) {
      if (key !== productState.catalogStorageKey && key !== null) return;
      refresh(); view.notify('The catalog was updated in another tab.');
    },
    onPageShow: refresh,
  });
}

const page = getPage();
if (page === 'shop') initializeShop();
else if (page === 'admin') initializeAdmin();
else if (page === 'login') accountUi.initializeLogin();
