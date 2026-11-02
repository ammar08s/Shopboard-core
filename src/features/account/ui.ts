import { loginDestination } from './data.ts';
import { recordRegistrationValidation } from './state.ts';

// initializeLogin opens the public demo dashboard without transmitting or saving credentials.
export function initializeLogin() {
  document.querySelector<HTMLFormElement>('#admin-login-form').addEventListener('submit', (event) => {
    event.preventDefault(); (event.currentTarget as HTMLFormElement).reset();
    window.location.assign(loginDestination);
  });
}

// initializeRegistration keeps demo registration local after native form validation.
export function initializeRegistration() {
  document.querySelector<HTMLElement>('#register form').addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector<HTMLElement>('#register-status').textContent = recordRegistrationValidation();
  });
}
