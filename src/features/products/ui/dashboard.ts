import type { Product } from '../types.ts';
import { escapeHtml } from '../logic/escapeHtml.ts';
import { money } from '../../../shared/formatting.ts';

// Input: products and categories; output: updated dashboard statistics and catalog table.
export function renderDashboard(products: Product[], categories: string[]) {
  document.querySelector<HTMLElement>('#product-count').textContent = String(products.length);
  document.querySelector<HTMLElement>('#category-count').textContent = String(categories.length);
  // Input: the running total and a product; output: the combined product price total.
  const total = products.reduce((sum, product) => sum + product.price, 0);
  document.querySelector<HTMLElement>('#average-price').textContent = money.format(products.length ? total / products.length : 0);
  // Input: a catalog product; output: escaped table markup and its row actions.
  const rows = products.map((product) => `
    <tr>
      <td><div class="catalog-product"><img src="${escapeHtml(product.image)}" alt="" width="48" height="48" loading="lazy" /><span>${escapeHtml(product.name)}</span></div></td>
      <td>${escapeHtml(product.category)}</td>
      <td>${money.format(product.price)}</td>
      <td><span class="stock-label ${product.inStock ? '' : 'out-of-stock'}">${product.inStock ? 'In stock' : 'Out of stock'}</span></td>
      <td><div class="row-actions">
        <button class="button secondary-button" type="button" data-action="edit" data-id="${product.id}" aria-label="Edit ${escapeHtml(product.name)}">Edit</button>
        <button class="button secondary-button" type="button" data-action="stock" data-id="${product.id}" aria-label="Mark ${escapeHtml(product.name)} as ${product.inStock ? 'out of stock' : 'in stock'}">${product.inStock ? 'Mark out of stock' : 'Mark in stock'}</button>
        <button class="button danger-button" type="button" data-action="delete" data-id="${product.id}" aria-label="Delete ${escapeHtml(product.name)}">Delete</button>
      </div></td>
    </tr>
  `).join('');
  document.querySelector<HTMLElement>('#admin-products').innerHTML = products.length ? rows
    : '<tr><td colspan="5">No products yet. Choose Add product to start your collection.</td></tr>';
}
