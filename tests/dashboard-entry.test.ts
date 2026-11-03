import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from './helpers/dom.ts';
import { initializeLogin } from '../src/features/account/ui.ts';

// Input: valid demo sign-in and destination-page startup; output: dashboard arrival feedback without authentication claims.
test('demo login redirects to a dashboard that welcomes the user with a truthful toast', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const elements = new Map();
  // Input: a page selector; output: its persistent control, excluding a nonexistent open modal.
  function element(selector) {
    if (selector === 'dialog[open]') return null;
    if (!elements.has(selector)) elements.set(selector, createElement());
    return elements.get(selector);
  }
  const body = createElement('body');
  body.dataset.page = 'admin';
  globalThis.document = {
    body, createElement, querySelector: element,
    // Input: a document event registration; output: no event delivery during this focused startup test.
    addEventListener() {},
  };
  let destination = '';
  globalThis.window = {
    // Input: page event handlers; output: no automatic browser navigation events in this test.
    addEventListener() {},
    // Input: destination URL; output: captured navigation requested by the real login handler.
    location: { assign(url) { destination = url; } },
  };
  try {
    initializeLogin();
    let cleared = false;
    element('#admin-login-form').listeners.submit({
      // Input: submit event; output: suppresses the browser's native form navigation.
      preventDefault() {},
      // Input: none; output: records that demo credentials were cleared before navigation.
      currentTarget: { reset() { cleared = true; } },
    });
    assert.equal(cleared, true);
    assert.equal(destination, '/admin-dashboard.html');
    await import('../src/main.ts');
    const toast = body.children[0].children[1].children[0];
    assert.equal(toast.children[1].children[0].textContent, 'Welcome to your dashboard');
    assert.match(toast.children[1].children[1].textContent, /demo workspace/);
    assert.equal(element('#product-count').textContent, '12');
  } finally { delete globalThis.document; delete globalThis.window; }
});
