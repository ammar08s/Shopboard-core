import { createElement } from './dom.ts';

// Input: none; output: persistent listing controls and actions backed by the real product initialization.
export async function createProductControlsFixture() {
  // Input: a selector; output: its corresponding simulated listing element.
  const entries = [
    '#searchInput', '#categorySelect', '#sortSelect', '#products .products', '#category-navigation',
    '#products', '#products-title', '#result-count', '#breadcrumb-category', '#active-filters',
    '#clear-filters', '#filter-status', '#filters-toggle', '#filter-panel', '#catalog-status',
  ].map((selector) => [selector, {
    value: '', innerHTML: '', textContent: '', hidden: false, listeners: {}, attributes: {},
    // Input: an event name and listener; output: a stored event callback.
    addEventListener(event, listener) { this.listeners[event] = listener; },
    // Input: an attribute name and value; output: an updated element attribute.
    setAttribute(name, value) { this.attributes[name] = value; },
    // Input: an attribute name; output: its stored value or null.
    getAttribute(name) { return this.attributes[name] ?? null; },
    // Input: none; output: a focused element.
    focus() { this.focused = true; },
  }]);
  const elements = Object.fromEntries(entries);
  elements['#category-navigation'] = createElement('ul');
  globalThis.document = {
    createElement,
    // Input: a CSS selector; output: its fixture element.
    querySelector: (selector) => selector === '#category-navigation [aria-pressed="true"]'
      ? elements['#category-navigation'].querySelector('[aria-pressed="true"]') : elements[selector],
  };
  const { initializeProducts } = await import('../../src/main.ts');
  initializeProducts();
  const container = elements['#products .products'];
  return {
    elements, container, search: elements['#searchInput'], category: elements['#categorySelect'], sort: elements['#sortSelect'],
    // Input: rendered product markup; output: product IDs in displayed order.
    displayedIds() {
      // Input: a product button match; output: its numeric product ID.
      return [...container.innerHTML.matchAll(/data-add-to-cart="(\d+)"/g)].map((match) => Number(match[1]));
    },
    // Input: filter action data; output: the delegated listing action applied to controls.
    clickCatalogAction(dataset) {
      elements['#products'].listeners.click({
        // Input: a selector; output: the clicked filter action button.
        target: { closest: () => ({ dataset }) },
      });
    },
    // Input: none; output: the fixture document removed from the global environment.
    cleanup() { delete globalThis.document; },
  };
}
