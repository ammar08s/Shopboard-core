import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNotificationState } from '../src/features/notifications/state.ts';

// Input: queued action messages and a fake clock; output: ordered, bounded, dismissible notices.
test('notification queue shows three messages and promotes the next after dismissal', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let visible = [];
  const state = createNotificationState((notifications) => { visible = notifications; });
  const first = state.show({ title: 'Added', message: 'First product added.' });
  for (const message of ['Second', 'Third', 'Fourth']) state.show({ title: message, message });
  assert.deepEqual(visible.map((notice) => notice.title), ['Added', 'Second', 'Third']);
  state.dismiss(first);
  assert.deepEqual(visible.map((notice) => notice.title), ['Second', 'Third', 'Fourth']);
});

// Input: success/error messages and elapsed time; output: timed successes and persistent errors.
test('success notices expire while errors remain until dismissed', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let visible = [];
  const state = createNotificationState((notifications) => { visible = notifications; });
  state.show({ title: 'Saved', message: 'Product updated.', tone: 'success' });
  const error = state.show({ title: 'Could not save', message: 'Storage is full.', tone: 'error' });
  context.mock.timers.tick(4999);
  assert.equal(visible.length, 2);
  context.mock.timers.tick(1);
  assert.deepEqual(visible.map((notice) => notice.title), ['Could not save']);
  state.dismiss(error);
  assert.deepEqual(visible, []);
});

// Input: focus/hover pause and resume; output: messages remain readable until interaction ends.
test('paused notices do not expire and resume with a full reading interval', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let visible = [];
  const state = createNotificationState((notifications) => { visible = notifications; });
  const id = state.show({ title: 'Added', message: 'Bag added to your cart.' });
  context.mock.timers.tick(4000);
  state.pause(id);
  context.mock.timers.tick(20000);
  assert.equal(visible.length, 1);
  state.resume(id);
  context.mock.timers.tick(4999);
  assert.equal(visible.length, 1);
  context.mock.timers.tick(1);
  assert.deepEqual(visible, []);
});

// Input: repeated identical feedback and hidden queued items; output: deduplication and full display time.
test('duplicates refresh one notice and queued notices start expiry only when visible', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let visible = [];
  const state = createNotificationState((notifications) => { visible = notifications; });
  const id = state.show({ title: 'Added', message: 'Bag added.' });
  context.mock.timers.tick(3000);
  assert.equal(state.show({ title: 'Added', message: 'Bag added.' }), id);
  context.mock.timers.tick(3000);
  assert.equal(visible.length, 1);
  state.show({ title: 'Warning', message: 'Storage unavailable.', tone: 'warning' });
  state.show({ title: 'Error', message: 'Unable to save.', tone: 'error' });
  state.show({ title: 'Queued', message: 'Another action completed.' });
  context.mock.timers.tick(2000);
  assert.deepEqual(visible.map((notice) => notice.title), ['Warning', 'Error', 'Queued']);
  context.mock.timers.tick(4999);
  assert.equal(visible.length, 3);
  context.mock.timers.tick(1);
  assert.deepEqual(visible.map((notice) => notice.title), ['Warning', 'Error']);
});
