import { escapeHtml } from '../logic/escapeHtml.ts';
import { updateCategoryIndicator } from './category-motion.ts';

// Input: available categories; output: refreshed category controls with any valid selection retained.
export function renderCategories(categories: string[]) {
  const select = document.querySelector<HTMLSelectElement>('#categorySelect');
  const selected = select.value;
  // Input: a category name; output: its escaped option markup.
  select.innerHTML = '<option value="">All Categories</option>' + categories.map((category) => `
    <option value="${escapeHtml(category)}">${escapeHtml(category)}</option>
  `).join('');
  select.value = categories.includes(selected) ? selected : '';
  renderCategoryNavigation(categories, select.value);
}

// Input: categories and selected category; output: stable navigation buttons and a synchronized indicator.
export function renderCategoryNavigation(categories: string[], selectedCategory: string) {
  const navigation = document.querySelector<HTMLElement>('#category-navigation');
  const names = ['', ...categories];
  const buttons = Array.from(navigation.querySelectorAll<HTMLButtonElement>('[data-category]'));
  // Input: an existing button and its position; output: whether the available category list changed.
  const changed = buttons.length !== names.length || buttons.some((button, index) => button.dataset.category !== names[index]);
  if (changed) navigation.replaceChildren(...names.map(createCategoryItem));
  for (const button of navigation.querySelectorAll<HTMLButtonElement>('[data-category]')) {
    button.setAttribute('aria-pressed', String(button.dataset.category === selectedCategory));
  }
  updateCategoryIndicator(navigation);
}

// Input: one category name; output: a safe, accessible navigation item whose identity survives selection changes.
function createCategoryItem(category: string) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.category = category;
  button.textContent = category || 'All products';
  item.append(button);
  return item;
}
