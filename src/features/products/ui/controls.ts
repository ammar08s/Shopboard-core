import { bindCategoryMotion } from './category-motion.ts';

// Input: current page controls; output: the search, category, and sorting values.
export function readProductControls() {
  return {
    searchTerm: document.querySelector<HTMLInputElement>('#searchInput').value,
    selectedCategory: document.querySelector<HTMLSelectElement>('#categorySelect').value,
    selectedSort: document.querySelector<HTMLSelectElement>('#sortSelect').value,
  };
}

// Input: a render callback; output: bound search, filtering, navigation, and photo fallback events.
export function bindProductControls(onChange: () => void) {
  bindCategoryMotion();
  const search = document.querySelector<HTMLInputElement>('#searchInput');
  const category = document.querySelector<HTMLSelectElement>('#categorySelect');
  const sort = document.querySelector<HTMLSelectElement>('#sortSelect');
  search.addEventListener('input', onChange);
  category.addEventListener('change', onChange);
  sort.addEventListener('change', onChange);
  // Input: a header click; output: an updated category selection and focus.
  document.querySelector<HTMLElement>('#category-navigation').addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-category]');
    if (!button) return;
    category.value = button.dataset.category;
    onChange();
    document.querySelector<HTMLButtonElement>('#category-navigation [aria-pressed="true"]')?.focus({ preventScroll: true });
  });
  // Input: a filter removal click; output: cleared controls and updated results.
  document.querySelector<HTMLElement>('#products').addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-reset-filters], [data-remove-filter]');
    if (!button) return;
    const removed = button.dataset.removeFilter;
    if (removed !== 'category') search.value = '';
    if (removed !== 'search') category.value = '';
    onChange();
    if (removed === 'search') search.focus();
    else if (removed === 'category') category.focus();
    else document.querySelector<HTMLElement>('#products-title').focus();
  });
  const toggle = document.querySelector<HTMLButtonElement>('#filters-toggle');
  const panel = document.querySelector<HTMLElement>('#filter-panel');
  toggle.setAttribute('aria-expanded', 'false');
  panel.hidden = true;
  // Input: a toggle click; output: the opposite filter panel visibility.
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    panel.hidden = !expanded;
  });
  // Input: a captured product image error; output: a visible image fallback.
  document.querySelector<HTMLElement>('#products .products').addEventListener('error', (event) => {
    const image = event.target as HTMLImageElement;
    if (!image.matches('.product-photo')) return;
    image.hidden = true;
    (image.nextElementSibling as HTMLElement).hidden = false;
  }, true);
}
