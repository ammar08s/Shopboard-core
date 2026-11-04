import { test } from 'node:test';
import assert from 'node:assert/strict';

// Input: local demo votes and comments; output: isolated product reviews that survive reloads and failed writes.
test('demo reviews replace a browser vote, isolate products, and persist validated comments', async () => {
  const saved = new Map();
  globalThis.localStorage = { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  try {
    const { createReviewsState } = await import('../src/features/reviews/state.ts');
    const { getRatingSummary } = await import('../src/features/reviews/logic/getRatingSummary.ts');
    const { reviewStorageKey } = await import('../src/features/reviews/data.ts');
    const state = createReviewsState();
    assert.deepEqual(getRatingSummary(state.getSnapshot().ratings, 1), { average: 0, count: 0 });
    state.rate(1, 4); state.rate(1, 2); state.rate(2, 5);
    assert.deepEqual(getRatingSummary(state.getSnapshot().ratings, 1), { average: 2, count: 1 });
    assert.deepEqual(getRatingSummary(state.getSnapshot().ratings, 2), { average: 5, count: 1 });
    state.addComment(1, '  Sam  ', '  Nice <bag>!  ');
    state.addComment(2, 'Alex', 'Another product');
    const reloaded = createReviewsState().getSnapshot();
    assert.equal(reloaded.comments[0].name, 'Alex');
    assert.equal(reloaded.comments[1].body, 'Nice <bag>!');
    assert.equal(reloaded.comments[1].name, 'Sam');
    assert.equal(reloaded.comments[1].productId, 1);
    for (const rating of [0, 6, 2.5, NaN, '5']) assert.throws(() => state.rate(1, rating));
    assert.throws(() => state.rate(-1, 5));
    for (const [name, body] of [[' ', 'Good'], ['A', ' '], ['a'.repeat(61), 'Good'], ['A', 'a'.repeat(1001)]]) {
      assert.throws(() => state.addComment(1, name, body));
    }
    const snapshot = state.getSnapshot(); snapshot.ratings[0].score = 99;
    assert.equal(state.getSnapshot().ratings[0].score, 2);
    localStorage.setItem = () => { throw new Error('Quota exceeded'); };
    const before = state.getSnapshot();
    assert.throws(() => state.addComment(1, 'Sam', 'Retain my text'), /could not be saved/i);
    assert.throws(() => state.rate(1, 5), /could not be saved/i);
    assert.deepEqual(state.getSnapshot(), before);
    saved.set(reviewStorageKey, '{broken');
    state.refresh();
    assert.deepEqual(state.getSnapshot(), { ratings: [], comments: [] });
    saved.set(reviewStorageKey, JSON.stringify({ ratings: [{ productId: 1, score: 900 }], comments: [{ name: '<script>' }] }));
    state.refresh();
    assert.deepEqual(state.getSnapshot(), { ratings: [], comments: [] });
  } finally { delete globalThis.localStorage; }
});
