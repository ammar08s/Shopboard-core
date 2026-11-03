import { escapeHtml } from '../logic/escapeHtml.ts';

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

// Input: categories and selected category; output: matching header navigation markup in the DOM.
export function renderCategoryNavigation(categories: string[], selectedCategory: string) {
  const navigation = document.querySelector<HTMLElement>('#category-navigation');
  // Input: a category name; output: an accessible category navigation button.
  navigation.innerHTML = ['', ...categories].map((category) => `
    <li><button type="button" data-category="${escapeHtml(category)}" aria-pressed="${category === selectedCategory}">${category ? escapeHtml(category) : 'All products'}</button></li>
  `).join('');
}
