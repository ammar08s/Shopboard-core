import type { Notification, Notify } from './types.ts';
import { createNotificationState } from './state.ts';
import { createToast } from './ui/createToast.ts';

// Input: the page DOM; output: a notification callback owning a nonmodal, accessible toast stack.
export function initializeNotifications(): Notify {
  const region = document.createElement('section');
  region.className = 'toast-region';
  region.setAttribute('aria-label', 'Notifications');
  const announcement = document.createElement('div');
  announcement.className = 'sr-only';
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  const list = document.createElement('div');
  list.className = 'toast-list';
  region.append(announcement, list);
  document.body.append(region);
  const origins = new Map<number, HTMLElement>();
  const state = createNotificationState(render);
  document.addEventListener('close', relocate, true);

  // Input: the page's active modal; output: places notices in its visible, interactive top layer or the page.
  function relocate() {
    const parent = document.querySelector<HTMLDialogElement>('dialog[open]') ?? document.body;
    if (region.parentElement !== parent) parent.append(region);
  }

  // Input: visible queue entries; output: updates changed DOM nodes while preserving focus and hover.
  function render(notices: Notification[]) {
    // Input: a visible notice; output: its ID for preserving only current rendered nodes.
    const visibleIds = new Set(notices.map((notice) => notice.id));
    for (const child of Array.from(list.children) as HTMLElement[]) {
      const id = Number(child.dataset.notificationId);
      if (!visibleIds.has(id)) { child.remove(); origins.delete(id); }
    }
    const messages: string[] = [];
    for (const notice of notices) {
      if (list.querySelector(`[data-notification-id="${notice.id}"]`)) continue;
      list.append(createToast(notice, { dismiss, pause: state.pause, resume: state.resume }));
      if (notice.announce !== false) messages.push(`${notice.title}. ${notice.message}`);
    }
    if (messages.length) announcement.textContent = messages.join(' ');
  }

  // Input: a notice ID; output: removes its toast and restores focus only if dismissal held focus.
  function dismiss(id: number) {
    const toast = list.querySelector<HTMLElement>(`[data-notification-id="${id}"]`);
    const hadFocus = toast?.contains(document.activeElement);
    const origin = origins.get(id);
    state.dismiss(id);
    if (hadFocus) {
      const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');
      const visibleOrigin = origin?.isConnected && origin.getClientRects().length > 0
        && (!dialog || dialog.contains(origin));
      const target = list.querySelector<HTMLButtonElement>('button')
        ?? (visibleOrigin ? origin : null);
      target?.focus({ preventScroll: true });
      if (!target || document.activeElement !== target) {
        const fallback = dialog?.querySelector<HTMLElement>('button:not([disabled])')
          ?? document.querySelector<HTMLElement>('.brand');
        fallback?.focus({ preventScroll: true });
      }
    }
  }

  // Input: action feedback; output: queues a toast without taking focus from the user's task.
  return (input) => {
    relocate();
    const origin = document.activeElement as HTMLElement;
    const id = state.show(input);
    if (origin) origins.set(id, origin);
  };
}
