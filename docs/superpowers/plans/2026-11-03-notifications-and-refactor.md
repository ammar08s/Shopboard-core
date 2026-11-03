# Notifications and Feature Refactor Implementation Plan

> **For agentic workers:** Execute the independent product UI and stylesheet tasks in parallel; integrate and verify all changes before completion.

**Goal:** Give shoppers and demo administrators clear action feedback, then apply the updated `Agents.md` file-size and function-documentation rules.

**Architecture:** A notifications feature owns its data, queue/timers, pure queue transformations, and accessible rendering. Feature UIs receive a typed notification callback through `main.ts`; they never import another feature's state. Product UI responsibilities and CSS sections move into focused files with direct imports.

**Tech stack:** Existing Vite, vanilla TypeScript, HTML, and CSS; no added dependencies.

**Spec:** User request and `Agents.md`, with existing storefront appearance retained.

## Constraints and design

- Keep application source files at or below 100 lines when practical; avoid artificial minification. Document necessary static-document exceptions.
- Every declared function documents its inputs and outputs, including handlers and returned operations.
- Keep mutable feature state in feature state files, pure logic free of browser dependencies, and DOM work in feature UI files.
- Preserve URLs, IDs, existing localStorage keys and formats, photos, filtering, cart reconciliation, and admin validation/CRUD.
- Toasts use the existing orange/white visual system, state-specific icons and accent colors, a 44px dismiss button, and readable messages.
- Show cart add/change/remove/clear, registration results, demo dashboard arrival, admin save/stock/delete, and failure feedback.
- Dashboard arrival is described as a demo workspace, without claiming real authentication.
- Informational/success toasts expire after five seconds; warning/error toasts remain dismissible. Pause expiry on pointer hover or keyboard focus.
- Keep at most three visible toasts, queue additional notices, preserve focused DOM nodes, and respect reduced motion.
- Keep inline form/status feedback readable; use one announcement per action.

## Task 1: Notifications and cart/account integration

**Owner:** Primary agent. **Files:** `src/features/notifications/`, cart/account features, `src/main.ts`, shared UI helpers, notification styles, notification/main/cart tests.

- [x] Add failing tests for queue order, dismiss/expiry, pause/resume, persistent warnings/errors, and toast callbacks on cart outcomes.
- [x] Implement notification state/logic/UI and connect callbacks through `main.ts`.
- [x] Announce dashboard arrival after demo login/direct entry; keep registration and login notices truthful.
- [x] Document input/output contracts in the remaining small feature functions.

## Task 2: Product UI refactor and administrator notifications

**Owner:** Product agent. **Files:** `src/features/products/`, `tests/products.test.ts`, `tests/admin-dashboard.test.ts`.

- [x] Extract cards, categories, controls, results, dashboard, admin controller, and editor responsibilities into focused UI files.
- [x] Move product editor/deletion mutable state into product-owned state files.
- [x] Add optional `notify: Notify` to catalog operations and deliver truthful CRUD/error notices.
- [x] Update direct test imports; preserve photo upload cancellation, validation, preview, dialogs, and persistence.
- [x] Keep files below 100 lines and document function inputs/outputs.

## Task 3: Stylesheet refactor

**Owner:** Styles agent. **Files:** Existing `src/styles/` files, excluding `notifications.css`.

- [x] Split stylesheet by visual responsibility and preserve cascade order, breakpoints, focus, reduced motion, and mobile design.
- [x] Keep the stylesheet entry and each new CSS file under 100 lines.

## Task 4: Integration, documentation, and review

**Owner:** Primary agent. **Files:** README, remaining tests/config comments, static page documents as appropriate.

- [x] Update the README feature guide and file responsibility map.
- [x] Audit source file lengths, comments, DOM ownership, and mutable state ownership.
- [x] Run `npm test`, `npm run build`, and `git diff --check`.
- [x] Review cross-feature wiring, storage-failure outcomes, and notification keyboard/accessibility behavior.
- [x] Attempt visual checks only if browser access becomes available; report limits honestly.

## Progress

- Baseline: 9 tests pass before this task. Existing user edits, including `Agents.md`, remain in place.
- Notification tests cover queue order, promotion, deduplication, expiry, focus/hover pause, safe text rendering, modal visibility, restored focus, and single-source announcements.
- Cart/admin tests cover successful outcomes and persistence/validation failures; a login-to-dashboard test verifies the truthful welcome message.
- Final independent review found no blocking issue. Two accessibility edge cases were reproduced by failing tests and corrected: closed-dialog focus restoration and background-update announcements during a modal.
- Final validation: 23/23 tests pass, production build/typecheck pass, whitespace check passes, and all application TS/CSS/test files stay within 100 lines. Function contract and DOM/storage ownership audits pass.
- Necessary exceptions: complete semantic storefront/admin HTML documents remain over 100 lines; the README documents why. The migration guide moved into `docs/typescript.md`.
- Browser access host remains unavailable. Rendered appearance, real viewport/zoom layout, and native screen-reader behavior could not be visually verified; no native-app approval was requested again.
