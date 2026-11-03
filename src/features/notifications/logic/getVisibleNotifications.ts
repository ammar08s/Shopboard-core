import type { Notification } from '../types.ts';
import { maxVisibleNotifications } from '../data.ts';

// Input: the ordered notification queue; output: the first notices that fit the visible stack.
export function getVisibleNotifications(queue: Notification[]) {
  return queue.slice(0, maxVisibleNotifications);
}
