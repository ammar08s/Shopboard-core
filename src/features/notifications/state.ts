import type { Notification, NotificationInput } from './types.ts';
import { notificationDuration } from './data.ts';
import { createNotification } from './logic/createNotification.ts';
import { getVisibleNotifications } from './logic/getVisibleNotifications.ts';

// Input: a rendering callback; output: operations owning the notification queue and expiry timers.
export function createNotificationState(onChange: (notifications: Notification[]) => void) {
  let queue: Notification[] = [];
  let nextId = 1;
  const timers = new Map<number, ReturnType<typeof setTimeout>>();
  const paused = new Set<number>();

  // Input: a notice ID; output: its pending expiry is canceled, with no queue mutation.
  function stopTimer(id: number) {
    clearTimeout(timers.get(id));
    timers.delete(id);
  }

  // Input: current queue/timers; output: visible notices and timers only for unpaused visible messages.
  function publish() {
    const visible = getVisibleNotifications(queue);
    for (const notice of visible) {
      if (notice.tone === 'error' || notice.tone === 'warning' || paused.has(notice.id) || timers.has(notice.id)) continue;
      // Input: the elapsed display interval; output: removes this notice and promotes the next queued notice.
      timers.set(notice.id, setTimeout(() => dismiss(notice.id), notificationDuration));
    }
    onChange(visible);
  }

  // Input: action feedback; output: its ID, reusing an identical notice and restarting its reading time.
  function show(input: NotificationInput) {
    const notice = createNotification(input, nextId++);
    // Input: a queued item; output: whether its visible content and tone match this action feedback.
    const existing = queue.find((item) => item.title === notice.title && item.message === notice.message && item.tone === notice.tone);
    if (existing) {
      stopTimer(existing.id);
      publish();
      return existing.id;
    }
    queue = [...queue, notice];
    publish();
    return notice.id;
  }

  // Input: a notice ID; output: removes it, cancels its timer, and promotes the next pending message.
  function dismiss(id: number) {
    stopTimer(id);
    paused.delete(id);
    // Input: a queued notice; output: whether it should remain after this dismissal.
    queue = queue.filter((notice) => notice.id !== id);
    publish();
  }

  // Input: a notice receiving pointer or keyboard attention; output: cancels expiry until resumed.
  function pause(id: number) { paused.add(id); stopTimer(id); }

  // Input: a notice no longer being read; output: starts a fresh display interval if it is visible.
  function resume(id: number) { paused.delete(id); publish(); }

  return { show, dismiss, pause, resume };
}
