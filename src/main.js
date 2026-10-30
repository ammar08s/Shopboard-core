import { products, categories } from './data.js';
import { getVisibleProducts } from './logic.js';
import { getState, setState } from './state.js';
import { readProductControls, renderCategories, renderProductCards, bindProductControls } from './ui.js';

// renderProducts synchronizes selections, computes matching products, and updates their display.
function renderProducts() {
  setState(readProductControls());
  renderProductCards(getVisibleProducts(products, getState()));
}

renderCategories(categories);
bindProductControls(renderProducts);
renderProducts();
