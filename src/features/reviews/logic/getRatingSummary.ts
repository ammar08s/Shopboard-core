import type { Rating } from '../types.ts';

// Input: saved ratings and a product ID; output: that product's average score and vote count.
export function getRatingSummary(ratings: Rating[], productId: number) {
  let count = 0;
  let total = 0;
  for (const rating of ratings) {
    if (rating.productId === productId) { count++; total += rating.score; }
  }
  return { average: count ? total / count : 0, count };
}
