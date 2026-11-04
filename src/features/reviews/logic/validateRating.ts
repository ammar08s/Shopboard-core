// Input: a product ID and star score; output: validation success or an actionable error.
export function validateRating(productId: number, score: number) {
  if (!Number.isSafeInteger(productId) || productId < 1) throw new Error('Choose an available product.');
  if (!Number.isInteger(score) || score < 1 || score > 5) throw new Error('Choose a rating from 1 to 5 stars.');
}
