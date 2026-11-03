import type { Notification, NotificationInput } from '../types.ts';

// Input: an action message and unique ID; output: normalized notification data without side effects.
export function createNotification(input: NotificationInput, id: number): Notification {
  return { ...input, id, title: input.title.trim(), message: input.message.trim(), tone: input.tone ?? 'info' };
}
