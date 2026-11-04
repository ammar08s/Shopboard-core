import type { Reviews } from '../types.ts';
import { maxComments } from '../data.ts';
import { validateRating } from './validateRating.ts';
import { validateComment } from './validateComment.ts';

// Input: serialized local reviews; output: safe normalized reviews, ignoring corrupt or duplicate entries.
export function restoreReviews(serialized: string | null | undefined): Reviews {
  const reviews: Reviews = { ratings: [], comments: [] };
  try {
    const parsed = JSON.parse(serialized ?? 'null');
    if (!parsed || !Array.isArray(parsed.ratings) || !Array.isArray(parsed.comments)) return reviews;
    const products = new Set<number>();
    for (const rating of parsed.ratings) {
      try {
        validateRating(rating.productId, rating.score);
        if (products.has(rating.productId)) continue;
        products.add(rating.productId);
        reviews.ratings.push({ productId: rating.productId, score: rating.score });
      } catch { /* Ignore invalid stored votes. */ }
    }
    const ids = new Set<string>();
    for (const comment of parsed.comments.slice(0, maxComments)) {
      try {
        const text = validateComment(comment.productId, comment.name, comment.body);
        if (typeof comment.id !== 'string' || !comment.id || ids.has(comment.id)
          || typeof comment.createdAt !== 'string' || !Number.isFinite(Date.parse(comment.createdAt))) continue;
        ids.add(comment.id);
        reviews.comments.push({ ...text, id: comment.id, productId: comment.productId, createdAt: comment.createdAt });
      } catch { /* Ignore invalid stored comments. */ }
    }
  } catch { /* Unreadable storage starts with an empty demo. */ }
  return reviews;
}
