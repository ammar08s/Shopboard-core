# Products API Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Load the live products API and let the user try real create, update, stock, and delete requests before deciding on demo writes.

**Architecture:** Keep product mapping pure, HTTP in `products/api.ts`, and catalog state/persistence in `products/state.ts`. Await initial loading before creating the cart or page UI. Keep existing local photos/descriptions as clearly identified demo supplements for API products that omit them.

**Tech Stack:** Existing vanilla Vite, TypeScript, semantic HTML, CSS, browser fetch, Node tests. No dependencies.

**Spec:** User request dated 2026-11-04 and `Agents.md`; styling follows `design.md`.

## Constraints and decisions

- API: `https://shopboard-api.vercel.app/api/products`.
- Observed GET: `{ items: [{ id, title, category_name, price_cents, in_stock }], total }`.
- Observed CORS permits GET/OPTIONS only. Do not automatically convert rejected writes to local demo successes.
- Proposed write contract: POST collection, PUT/DELETE collection/:id. These routes are assumptions until the API supports them.
- Send snake_case fields, integer cents, image, and optional description. Require a valid product response before claiming a save.
- Preserve URLs, IDs, cart/review storage keys, and the catalog key as a best-effort confirmed snapshot/change signal.
- Never let legacy browser catalog edits override the remote catalog.
- Keep cart data intact while the initial request is loading or has failed.
- Show loading, retry, real HTTP/network errors, and pending mutation controls.
- Preserve submitted input on errors. Do not send live test mutations; the user will try them.
- Keep files near 100 lines and add input/output comments to functions.
- Work in the current workspace to retain the user's existing uncommitted work; do not commit unrelated edits.

## Task 1: Remote catalog and tests

- [ ] Write failing tests for API mapping, cents, invalid responses, CRUD, rejected writes, and cache failures.
- [ ] Implement `logic/fromApiProduct.ts`, `logic/toApiProduct.ts`, `logic/readApiCatalog.ts`, `api.ts`, and asynchronous `state.ts`.
- [ ] Add a local placeholder for products without matching demo photos; keep API stock authoritative.
- [ ] Verify targeted tests with mocked HTTP boundaries; no requests to mutate the real API.

## Task 2: Page and admin integration

- [ ] Make boot await the catalog before constructing cart state; expose a startup promise for tests.
- [ ] Connect refreshes without unhandled rejections and keep last valid products on refresh failure.
- [ ] Add loading/retry UI within product UI ownership and await admin saves/deletes/stock updates.
- [ ] Prevent duplicate submissions and closing an editor mid-save; preserve errors and focus behavior.
- [ ] Update existing integration fixtures/tests for asynchronous HTTP operations.

## Task 3: User guide and verification

- [ ] Update misleading browser-only admin copy and the README feature guide.
- [ ] Write `docs/products-api.md` with field mapping, request examples, file guide, testing steps, and limitations.
- [ ] Run `npm test`, `npm run build`, and diff checks; review final changes.

## Review focus

1. Initial load failure cannot erase a stored cart or show demo data as live data.
2. Rejected or CORS-blocked writes cannot emit success or mutate products.
3. Duplicate clicks and overlapping refreshes cannot overwrite pending writes.
4. Malformed/empty API data must distinguish a failed response from a valid empty catalog.
5. Missing photos/descriptions must not change remote prices or availability.

## Execution record

- Read the endpoint using GET only: HTTP 200, 12 items, no image/description fields.
- Implementation and test results will be recorded after verification.
