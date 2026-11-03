import { loginDestination } from './data.ts';
import { recordRegistrationValidation } from './state.ts';
import type { Notify } from '../notifications/types.ts';

// Input: the demo login form; output: a submit handler opening the dashboard without saving credentials.
export function initializeLogin() {
  // Input: a natively validated demo submission; output: clears credentials and navigates to the demo workspace.
  document.querySelector<HTMLFormElement>('#admin-login-form').addEventListener('submit', (event) => {
    event.preventDefault(); (event.currentTarget as HTMLFormElement).reset();
    window.location.assign(loginDestination);
  });
}

// Input: optional notifications; output: a bound registration form retaining truthful demo-only feedback.
export function initializeRegistration(notify?: Notify) {
  // Input: validated form submission; output: inline and toast feedback without creating an account.
  document.querySelector<HTMLElement>('#register form').addEventListener('submit', (event) => {
    event.preventDefault();
    const message = recordRegistrationValidation();
    document.querySelector<HTMLElement>('#register-status').textContent = message;
    notify?.({ title: 'Details validated', message, tone: 'info', announce: false });
  });
}
