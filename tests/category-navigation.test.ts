import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from './helpers/dom.ts';
import { renderCategoryNavigation } from '../src/features/products/ui/categories.ts';

// Input: existing category buttons with layout measurements; output: a realistic navigation tree and controls.
function setup() {
  const navigation = createElement('ul');
  const names = ['', 'Bags', 'Shoes', 'Accessories'];
  const widths = [180, 140, 150, 190];
  let left = 0;
  for (const [index, category] of names.entries()) {
    const item = createElement('li');
    const button = createElement('button');
    button.dataset.category = category;
    button.offsetLeft = left;
    button.offsetWidth = widths[index];
    left += widths[index];
    button.setAttribute('aria-pressed', String(index === 0));
    item.append(button);
    navigation.append(item);
  }
  Object.defineProperty(navigation, 'innerHTML', {
    // Input: replacement HTML; output: drops old nodes and their focus, matching the browser's replacement behavior.
    set() {
      if (navigation.contains(document.activeElement)) document.activeElement = null;
      navigation.replaceChildren();
    },
  });
  globalThis.document = { querySelector: () => navigation, createElement };
  return navigation;
}

// Input: switching from All products to Bags; output: stable focused buttons and the correct moving-indicator target.
test('category switching preserves navigation nodes and focus while updating the selected indicator', () => {
  const navigation = setup();
  const buttons = navigation.querySelectorAll('[data-category]');
  buttons[1].focus();
  try {
    renderCategoryNavigation(['Bags', 'Shoes', 'Accessories'], 'Bags');
    assert.equal(navigation.querySelectorAll('[data-category]')[1] === buttons[1], true);
    assert.equal(document.activeElement === buttons[1], true);
    assert.equal(buttons[0].getAttribute('aria-pressed'), 'false');
    assert.equal(buttons[1].getAttribute('aria-pressed'), 'true');
    assert.equal(navigation.style.values['--category-indicator-x'], '180px');
    assert.equal(navigation.style.values['--category-indicator-width'], '140px');
    buttons[2].offsetLeft = 400;
    buttons[2].offsetWidth = 200;
    renderCategoryNavigation(['Bags', 'Shoes', 'Accessories'], 'Shoes');
    assert.equal(navigation.style.values['--category-indicator-x'], '400px');
    assert.equal(navigation.style.values['--category-indicator-width'], '200px');
  } finally { delete globalThis.document; }
});
