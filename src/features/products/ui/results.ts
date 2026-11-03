import type { Product, ProductSelections } from '../types.ts';
import { escapeHtml } from '../logic/escapeHtml.ts';
import { renderCategoryNavigation } from './categories.ts';

// Input: visible products, selections, and categories; output: synchronized results and filter summaries.
export function renderProductResults(products: Product[], selections: ProductSelections, categories: string[]) {
  const { searchTerm, selectedCategory } = selections;
  const search = searchTerm.trim();
  const count = `${products.length} ${products.length === 1 ? 'product' : 'products'}`;
  document.querySelector<HTMLElement>('#products-title').textContent = selectedCategory || 'All products';
  document.querySelector<HTMLElement>('#result-count').textContent = count;
  document.querySelector<HTMLElement>('#breadcrumb-category').textContent = selectedCategory || 'All products';
  const filters = document.querySelector<HTMLElement>('#active-filters');
  filters.innerHTML = [
    search ? `<button class="filter-chip" type="button" data-remove-filter="search" aria-label="Remove search filter: ${escapeHtml(search)}">Search: ${escapeHtml(search)} <span aria-hidden="true">&times;</span></button>` : '',
    selectedCategory ? `<button class="filter-chip" type="button" data-remove-filter="category" aria-label="Remove category filter: ${escapeHtml(selectedCategory)}">${escapeHtml(selectedCategory)} <span aria-hidden="true">&times;</span></button>` : '',
  ].join('');
  filters.hidden = !search && !selectedCategory;
  document.querySelector<HTMLButtonElement>('#clear-filters').disabled = filters.hidden;
  document.querySelector<HTMLElement>('#filter-status').textContent = filters.hidden ? 'No filters selected' : `${Number(Boolean(search)) + Number(Boolean(selectedCategory))} active ${search && selectedCategory ? 'filters' : 'filter'}`;
  document.querySelector<HTMLElement>('#catalog-status').textContent = `${count} found${selectedCategory ? ` in ${selectedCategory}` : ''}${search ? ` matching “${search}”` : ''}.`;
  renderCategoryNavigation(categories, selectedCategory);
}

// Input: product and category counts; output: the refreshed collection summary when present.
export function renderCollectionSummary(productCount: number, categoryCount: number) {
  const summary = document.querySelector<HTMLElement>('#collection-summary');
  if (summary) summary.textContent = `${productCount} essentials / ${categoryCount} categories`;
}
