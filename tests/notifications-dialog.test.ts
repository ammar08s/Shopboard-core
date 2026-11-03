import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from './helpers/dom.ts';
import { initializeNotifications } from '../src/features/notifications/ui.ts';

// Input: an open native dialog and its close event; output: toasts stay visible and dismissible in the active layer.
test('notifications appear inside an active modal and return to the page after it closes', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const body = createElement('body');
  const events = {};
  let activeDialog = null;
  globalThis.document = {
    body, createElement,
    querySelector: (selector) => selector === 'dialog[open]' ? activeDialog : null,
    addEventListener: (type, handler) => { events[type] = handler; },
  };
  try {
    const notify = initializeNotifications();
    const region = body.children[0];
    activeDialog = createElement('dialog');
    body.append(activeDialog);
    notify({ title: 'Could not save', message: 'Browser storage is full.', tone: 'error' });
    assert.equal(region.parentElement.tagName, 'DIALOG');
    const closedDialog = activeDialog;
    activeDialog = null;
    events.close();
    assert.equal(region.parentElement.tagName, 'BODY');
    assert.equal(closedDialog.children.length, 0);
  } finally { delete globalThis.document; }
});

// Input: a persistent error whose editor has closed; output: keyboard dismissal restores a usable page target.
test('dismissing an editor error after closing its dialog never restores focus to a hidden control', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const body = createElement('body');
  const brand = createElement('a');
  const dialog = createElement('dialog');
  const origin = createElement('input');
  dialog.open = true;
  dialog.append(origin);
  body.append(brand, dialog);
  let active = dialog;
  const events = {};
  globalThis.document = {
    body, createElement, activeElement: origin,
    querySelector: (selector) => selector === 'dialog[open]' ? active : brand,
    addEventListener: (type, handler) => { events[type] = handler; },
  };
  try {
    const notify = initializeNotifications();
    notify({ title: 'Save failed', message: 'Storage is full.', tone: 'error' });
    const region = dialog.children[1];
    dialog.open = false;
    active = null;
    events.close();
    const close = region.children[1].children[0].children[2];
    close.focus();
    close.listeners.click();
    assert.equal(document.activeElement.tagName, 'A');
  } finally { delete globalThis.document; }
});
