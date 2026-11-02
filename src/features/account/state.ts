import { getRegistrationMessage } from './logic.ts';

// Only the demo status is kept in memory; credentials are never stored.
let registrationStatus = '';

export function recordRegistrationValidation() {
  registrationStatus = getRegistrationMessage();
  return registrationStatus;
}
