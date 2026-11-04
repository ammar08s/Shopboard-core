import type { ReviewOperations } from './types.ts';
import { getRatingSummary } from './logic/getRatingSummary.ts';
import { renderComments } from './ui/comments.ts';

// Input: product ID, local review operations, and availability check; output: bound demo forms and refresh method.
export function initializeReviews(productId: number, operations: ReviewOperations, canReview: () => boolean = () => true) {
  const ratingForm = document.querySelector<HTMLFormElement>('#rating-form');
  const commentForm = document.querySelector<HTMLFormElement>('#comment-form');
  const ratingStatus = document.querySelector<HTMLElement>('#rating-status');
  const commentStatus = document.querySelector<HTMLElement>('#comment-status');
  const name = document.querySelector<HTMLInputElement>('#comment-name');
  const body = document.querySelector<HTMLTextAreaElement>('#comment-body');
  // Input: persisted demo data; output: rating summary, current browser vote, and comments for this product.
  function refresh() {
    operations.refresh();
    const snapshot = operations.getSnapshot();
    const { average, count } = getRatingSummary(snapshot.ratings, productId);
    document.querySelector<HTMLElement>('#rating-summary').textContent = count
      ? `${average.toFixed(1)} out of 5 · ${count} demo ${count === 1 ? 'rating' : 'ratings'}` : 'No ratings yet. Be the first to rate this product.';
    // Input: a saved vote; output: whether it belongs to the current product.
    const vote = snapshot.ratings.find((rating) => rating.productId === productId);
    for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="rating"]')) radio.checked = Number(radio.value) === vote?.score;
    // Input: a saved comment; output: whether it belongs in this product's comment list.
    renderComments(snapshot.comments.filter((comment) => comment.productId === productId));
    document.querySelector<HTMLElement>('#save-rating').textContent = vote ? 'Update your rating' : 'Save your rating';
  }
  // Input: submitted stars; output: a saved/replaced browser vote or a readable error without clearing the form.
  ratingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!ratingForm.reportValidity()) return;
    try {
      if (!canReview()) throw new Error('This product is no longer available.');
      const selected = document.querySelector<HTMLInputElement>('input[name="rating"]:checked');
      operations.rate(productId, Number(selected?.value));
      refresh(); ratingStatus.textContent = 'Your demo rating has been saved in this browser.';
    } catch (error) { ratingStatus.textContent = error.message; }
  });
  // Input: submitted author and text; output: a saved comment, or retained input and a readable error.
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!commentForm.reportValidity()) return;
    try {
      if (!canReview()) throw new Error('This product is no longer available.');
      operations.addComment(productId, name.value, body.value);
      body.value = ''; refresh(); commentStatus.textContent = 'Your demo comment has been saved in this browser.';
    } catch (error) { commentStatus.textContent = error.message; }
  });
  refresh();
  return { refresh };
}
