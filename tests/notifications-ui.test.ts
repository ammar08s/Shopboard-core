import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from './helpers/dom.ts';
import { initializeNotifications } from '../src/features/notifications/ui.ts';

// Input: a simulated page; output: notification roots and a trigger for safe/focus-aware rendering tests.
function setup() {
  const trigger = createElement('button');
  const body = createElement('body');
  globalThis.document = {
    body, createElement, activeElement: trigger, addEventListener() {},
    querySelector: (selector) => selector === '.brand' ? trigger : null,
  };
  const notify = initializeNotifications();
  const [announcement, list] = body.children[0].children;
  return { notify, announcement, list, trigger };
}

// Input: messages containing markup plus keyboard dismissal; output: literal text and preserved/restored focus.
test('toasts render text safely, preserve existing nodes, and restore focus on dismissal', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const { notify, list, trigger } = setup();
  try {
    notify({ title: 'Added', message: '<img src=x onerror=alert(1)>', tone: 'success' });
    assert.equal(document.activeElement, trigger);
    const first = list.children[0];
    assert.equal(first.children[1].children[1].textContent, '<img src=x onerror=alert(1)>');
    notify({ title: 'Updated', message: 'Quantity updated.' });
    assert.equal(list.children[0], first);
    const close = first.children[2];
    assert.equal(close['aria-label'], 'Dismiss notification: Added');
    close.focus();
    close.listeners.click();
    assert.equal(list.children.length, 1);
    assert.equal(document.activeElement, list.children[0].children[2]);
    list.children[0].children[2].listeners.click();
    assert.equal(document.activeElement, trigger);
  } finally { delete globalThis.document; }
});

// Input: overlapping hover/focus and elapsed time; output: a focused toast cannot disappear on pointer departure.
test('toast expiry waits until both pointer attention and keyboard focus end', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const { notify, list, trigger } = setup();
  try {
    notify({ title: 'Added', message: 'Bag added.' });
    const toast = list.children[0];
    toast.listeners.pointerenter();
    toast.children[2].focus();
    toast.listeners.focusin();
    toast.listeners.pointerleave();
    context.mock.timers.tick(10000);
    assert.equal(list.children.length, 1);
    trigger.focus();
    toast.listeners.focusout({ relatedTarget: trigger });
    context.mock.timers.tick(5000);
    assert.equal(list.children.length, 0);
  } finally { delete globalThis.document; }
});

// Input: already-announced feedback and a new page notice; output: one announcement source per action.
test('inline status messages are not announced twice and page notices have a polite live region', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const { notify, announcement } = setup();
  try {
    notify({ title: 'Cart updated', message: 'Bag added.', announce: false });
    assert.equal(announcement.textContent, '');
    notify({ title: 'Dashboard ready', message: 'This is a demo workspace.' });
    assert.equal(announcement.role, 'status');
    assert.equal(announcement['aria-live'], 'polite');
    assert.match(announcement.textContent, /Dashboard ready/);
  } finally { delete globalThis.document; }
});
