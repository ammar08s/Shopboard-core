import type { Notification } from '../types.ts';
import type { createNotificationState } from '../state.ts';
import { notificationIcons } from '../data.ts';

type Actions = Pick<ReturnType<typeof createNotificationState>, 'dismiss' | 'pause' | 'resume'>;

// Input: a visible notice and queue actions; output: a safely rendered, keyboard-accessible toast.
export function createToast(notice: Notification, actions: Actions) {
  const toast = document.createElement('article');
  toast.className = `toast toast--${notice.tone}`;
  toast.dataset.notificationId = String(notice.id);
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = notificationIcons[notice.tone];
  const content = document.createElement('div');
  content.className = 'toast-content';
  const title = document.createElement('strong');
  title.textContent = notice.title;
  const message = document.createElement('p');
  message.textContent = notice.message;
  content.append(title, message);
  const close = document.createElement('button');
  close.className = 'toast-dismiss';
  close.type = 'button';
  close.setAttribute('aria-label', `Dismiss notification: ${notice.title}`);
  close.textContent = '×';
  // Input: a dismiss click; output: removes this notice without undoing its action.
  close.addEventListener('click', () => actions.dismiss(notice.id));
  // Input: pointer attention; output: prevents expiry while the message is read.
  toast.addEventListener('pointerenter', () => actions.pause(notice.id));
  // Input: pointer departure; output: resumes expiry unless focus remains inside.
  toast.addEventListener('pointerleave', () => {
    if (!toast.contains(document.activeElement)) actions.resume(notice.id);
  });
  // Input: focus entering the toast; output: pauses automatic dismissal.
  toast.addEventListener('focusin', () => actions.pause(notice.id));
  // Input: departing focus; output: resumes expiry when neither focus nor hover remains.
  toast.addEventListener('focusout', (event) => {
    if (!toast.contains(event.relatedTarget as Node) && !toast.matches(':hover')) actions.resume(notice.id);
  });
  toast.append(icon, content, close);
  return toast;
}
