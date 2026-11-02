import { registrationMessage } from './data.ts';

// Native form validation happens before the submit event reaches the UI.
export function getRegistrationMessage() {
  return registrationMessage;
}
