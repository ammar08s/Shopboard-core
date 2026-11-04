# Product details implementation plan

**Goal:** Open individual product pages with catalog information, optional descriptions, browser-only ratings, and comments.

**Approved direction:** The user approved the proposed product URL, information, description editor, rating summary, comment form/list, cart action, and matching mobile styling. Reviews are explicitly demo-only.

**Architecture:** Extend products with an optional description. Add product-details for the page UI and reviews for local review data, validation, persistence, and UI. Connect features in main.ts using injected callbacks. Keep existing catalog/cart storage keys, product IDs, and URLs.

**Stack:** Existing vanilla Vite, TypeScript, semantic HTML, CSS; no dependencies or backend.

## Decisions

- Product URLs use `/product.html?id=<id>`. Image and title links keep Add to cart separate.
- Product pages show image, category, ID, price, availability, description when present, and an Add to cart button with the existing cart state.
- Descriptions are optional, trimmed, limited to 2,000 characters, and editable in the admin form; legacy products remain valid.
- One 1–5 star rating per product per browser can be updated. Summaries count saved demo ratings; no fabricated reviews.
- Comments require a name (1–60 characters) and message (1–1,000 characters), show dates, and render safely as text. Allow up to 200 saved comments total.
- Store reviews under a separate `shopboard-reviews` key. Validate restored data; storage failures retain user input and show a readable error.
- Invalid or deleted product IDs show an unavailable state with a shop link and hide purchase/review controls.
- Keep visible labels, keyboard-operable star radios, focus indicators, mobile-first layout, reduced motion, and the shared select styles.

## Task 1: Product descriptions

Files: product types, validation, state, editor UI files, admin HTML, `tests/product-description.test.ts`.

- [x] Test optional descriptions, trimming, persistence/reload, invalid values, and unrelated edits retaining descriptions; run to see missing behavior.
- [x] Add optional `description?: string`, validate bounds, persist it, and connect a labeled textarea to editor open/save.
- [x] Run description and existing admin tests.

## Task 2: Local review data

Files: `src/features/reviews/{types,data,state}.ts`, focused `logic/` files, `tests/reviews-state.test.ts`.

- [x] Test product isolation, rating replacement/average, comment validation/order, reload, corrupt data, and failed writes; run before implementation.
- [x] Implement pure validation/restoration/summary functions and state owning browser persistence.
- [x] Run review state tests.

## Task 3: Product page and review UI

Files: `product.html`, product-details feature, reviews UI files, product card UI, main.ts, vite config, focused CSS files, tests.

- [x] Test product lookup, card links, description escaping, unavailable products, purchase/stock handling, and review form submissions before implementation.
- [x] Add semantic product page and views with injected catalog/cart/review operations; include fourth Vite entry.
- [x] Add responsive two-column product layout and separate rounded review panels with accessible star inputs.
- [x] Verify form errors preserve input, rating changes replace the vote, comments use safe text, and product deletion disables actions.

## Task 4: Documentation and verification

- [x] Update README feature guide and design documentation.
- [x] Run `npm test`, `npm run build`, and `git diff --check`.
- [x] Review changes for architecture, 100-line file bounds, function comments, escaping, unavailable/disabled behavior, and compatibility with earlier work.

## Review focus

Legacy products without descriptions, malformed stored reviews, storage quota failures, deleted product links, and comments containing HTML must remain usable and safe. Existing uncommitted work stays in place; this task does not require committing or moving it to another checkout.


## Verification outcome

31 tests pass. Type checking, four-page production build, and diff whitespace checks pass. Independent review identified unsaved cart quantities being overwritten by reloads after storage failures; the new regression test failed before the pending-write guard and passes after the fix. Windows browser automation was stopped by URL verification, so visual browser QA remains unverified. No existing changes were reverted or committed.
