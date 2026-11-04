import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from './helpers/dom.ts';

// Input: submitted demo forms; output: saved per-product ratings, safe comments, and retained text on errors.
test('review forms save votes and text, update summaries, and retain input after storage errors', async () => {
  const saved = new Map();
  globalThis.localStorage = { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  const elements = new Map();
  // Input: selector; output: persistent controls with a native-form validation stub.
  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, Object.assign(createElement(), { reportValidity: () => true }));
    return elements.get(selector);
  };
  const radios = [1, 2, 3, 4, 5].map((score) => Object.assign(createElement('input'), { value: String(score) }));
  globalThis.document = { querySelector: element, querySelectorAll: () => radios, createElement };
  try {
    const { createReviewsState } = await import('../src/features/reviews/state.ts');
    const { initializeReviews } = await import('../src/features/reviews/ui.ts');
    const state = createReviewsState();
    initializeReviews(1, state);
    element('input[name="rating"]:checked').value = '4';
    element('#rating-form').listeners.submit({ preventDefault() {} });
    assert.match(element('#rating-summary').textContent, /4.0/);
    assert.match(element('#rating-status').textContent, /saved/i);
    element('#comment-name').value = 'Sam <admin>';
    element('#comment-body').value = '<img src=x onerror=alert(1)>';
    element('#comment-form').listeners.submit({ preventDefault() {} });
    const comment = element('#comment-list').children[0];
    assert.equal(comment.children[0].textContent, 'Sam <admin>');
    assert.equal(comment.children[2].textContent, '<img src=x onerror=alert(1)>');
    assert.equal(element('#comment-body').value, '');
    element('#comment-body').value = 'Do not lose this';
    localStorage.setItem = () => { throw new Error('Full'); };
    element('#comment-form').listeners.submit({ preventDefault() {} });
    assert.equal(element('#comment-body').value, 'Do not lose this');
    assert.match(element('#comment-status').textContent, /could not be saved/i);
    assert.equal(state.getSnapshot().comments.length, 1);
  } finally { delete globalThis.document; delete globalThis.localStorage; }
});
