import type { Reviews, ReviewOperations } from './types.ts';
import { reviewStorageKey, maxComments } from './data.ts';
import { restoreReviews } from './logic/restoreReviews.ts';
import { validateRating } from './logic/validateRating.ts';
import { validateComment } from './logic/validateComment.ts';

// Input: browser storage; output: isolated demo review operations that update memory only after saving.
export function createReviewsState(): ReviewOperations {
  let reviews = load();
  // Input: browser storage; output: validated saved reviews, or an empty collection when unavailable.
  function load() {
    try { return restoreReviews(globalThis.localStorage?.getItem(reviewStorageKey)); }
    catch { return { ratings: [], comments: [] }; }
  }
  // Input: the next review collection; output: persisted reviews or an error retaining previous state.
  function persist(next: Reviews) {
    try {
      if (!globalThis.localStorage) throw new Error('Storage unavailable');
      globalThis.localStorage.setItem(reviewStorageKey, JSON.stringify(next));
    } catch { throw new Error('Your review could not be saved. Browser storage may be full or unavailable.'); }
    reviews = next;
  }
  return {
    // Input: none; output: a detached snapshot, protecting mutable review state.
    getSnapshot() { return structuredClone(reviews); },
    // Input: current browser storage; output: refreshed validated reviews.
    refresh() { reviews = load(); },
    // Input: product ID and stars; output: one saved rating for this product in this browser.
    rate(productId, score) {
      validateRating(productId, score);
      const next = load();
      // Input: a stored vote; output: whether it belongs to a different product.
      next.ratings = next.ratings.filter((rating) => rating.productId !== productId);
      next.ratings.push({ productId, score });
      persist(next);
    },
    // Input: product ID, author, and body; output: a validated comment saved at the start of the list.
    addComment(productId, name, body) {
      const text = validateComment(productId, name, body);
      const next = load();
      if (next.comments.length >= maxComments) throw new Error('This demo has reached its limit of 200 comments.');
      next.comments.unshift({ ...text, productId, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
      persist(next);
    },
  };
}
