import { getRegistrationMessage } from './logic.ts';

// Only the demo status is kept in memory; credentials are never stored.
let registrationStatus = '';

// Input: none, after successful form validation; output: records and returns demo-only registration feedback.
export function recordRegistrationValidation() {
  registrationStatus = getRegistrationMessage();
  return registrationStatus;
}
