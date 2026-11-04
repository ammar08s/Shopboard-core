import { maxCommentLength, maxReviewerNameLength } from '../data.ts';
import { validateRating } from './validateRating.ts';

// Input: a product ID, author, and comment; output: trimmed valid text or a readable validation error.
export function validateComment(productId: number, name: string, body: string) {
  validateRating(productId, 1);
  if (typeof name !== 'string' || !name.trim() || name.trim().length > maxReviewerNameLength) {
    throw new Error('Enter a name between 1 and 60 characters.');
  }
  if (typeof body !== 'string' || !body.trim() || body.trim().length > maxCommentLength) {
    throw new Error('Enter a comment between 1 and 1,000 characters.');
  }
  return { name: name.trim(), body: body.trim() };
}
