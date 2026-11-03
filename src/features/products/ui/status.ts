import type { Notify, NotificationTone } from '../../notifications/types.ts';

// Input: a live status element, message, and optional notifier; output: matching inline and toast feedback.
export function showProductStatus(element: HTMLElement, message: string, notify?: Notify, tone: NotificationTone = 'info') {
  element.textContent = message;
  if (!notify) return;
  const modal = document.querySelector<HTMLDialogElement>('dialog[open]');
  const announce = Boolean(modal && !modal.contains(element));
  notify({ title: tone === 'error' ? 'Catalog action failed' : 'Catalog update', message, tone, announce });
}
