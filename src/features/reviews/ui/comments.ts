import type { ProductComment } from '../types.ts';

// Input: saved comments for one product; output: safe text-only comment cards and the empty state/count.
export function renderComments(comments: ProductComment[]) {
  const list = document.querySelector<HTMLElement>('#comment-list');
  list.replaceChildren();
  document.querySelector<HTMLElement>('#comments-empty').hidden = comments.length > 0;
  document.querySelector<HTMLElement>('#comment-count').textContent = String(comments.length);
  for (const comment of comments) {
    const item = document.createElement('li');
    item.className = 'comment-card';
    const name = document.createElement('strong');
    name.textContent = comment.name;
    const date = document.createElement('time');
    date.dateTime = comment.createdAt;
    date.textContent = new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const body = document.createElement('p');
    body.textContent = comment.body;
    item.append(name, date, body);
    list.append(item);
  }
}
