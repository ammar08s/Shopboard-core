# Marketplace Redesign Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement the tasks below. Track the steps with checkboxes.

**Goal:** Implement the first-pass storefront design requested in `design.md`, including product cards and coordinated secondary pages.

**Architecture:** Keep browsing controls and rendering in the products feature. `main.ts` supplies filtered products to the view. Reuse the existing catalog, cart, account workflows, and shared stylesheet.

**Tech Stack:** Vite, vanilla TypeScript, semantic HTML, mobile-first CSS. No added dependencies.

**Spec:** `design.md` (the user requested implementation of this document).

## Global constraints

- Preserve page URLs, product IDs, localStorage keys, catalog data, and English/USD content.
- Keep DOM access in feature UI files; keep cross-feature connections in `src/main.ts`.
- Every input/select has a visible label; use min-width media queries and no `!important`.
- Implement working controls only; omit later-phase favorites, promotions, and delivery/price filters.
- Explain the changes and update the README feature guide.

## Review focus

- Category navigation, sidebar selection, chips, result count, and title must stay synchronized.
- Reset removes search/category filters and preserves sorting; removing one chip leaves the other filter intact.
- Catalog refreshes must handle removed categories and preserve cart reconciliation.
- Mobile filters must disclose accessibly and the document must fit 320–1440px viewports.
- Broken images, unavailable stock, long titles, and empty results must leave product actions understandable.

## Task 1: Catalog controls and feedback

**Files:** `tests/products.test.ts`, `tests/main.test.ts`, `src/features/products/ui.ts`, `src/main.ts`.

**Interfaces:** Keep `readProductControls`, `renderCategories`, `bindProductControls` and `renderProductCards`. Add `renderProductResults(products: Product[], selections: ProductSelections, categories: string[])` to render the current result title, count, breadcrumbs, filter chips, and selected category buttons.

- [x] Extend regression coverage for category navigation, removing individual chips, clearing filters while retaining sorting, live counts, empty reset, and filter disclosure.
- [x] Run the product tests and confirm the new behavior fails before implementation.
- [x] Implement delegated category/reset/chip actions and responsive disclosure in product UI, with current selections supplied from `main.ts`.
- [x] Run the full test suite and confirm filtering and existing workflows pass.

## Task 2: Page and card design

**Files:** `index.html`, `src/styles/shop.css`, `src/features/products/ui.ts`, `src/features/cart/ui.ts` as needed.

**Interfaces:** Retain existing control IDs, cart anchors, form selectors, and product purchase data attributes.

- [x] Replace the oversized hero with the marketplace header, labeled search, category bar, breadcrumbs, sidebar, and results grid.
- [x] Use square contained images, aligned card content, prominent USD prices, stock labels, orange purchase actions, and a readable failed-image fallback.
- [x] Extend the white/orange/gray system to cart, registration, login, dashboard, and editor.
- [ ] Check keyboard focus, reduced motion, mobile disclosure, card proportions, and viewport overflow using a browser.

## Task 3: Documentation and final validation

**Files:** `README.md` and this plan.

- [x] Document the feature ownership of navigation, chips, results feedback, and image fallback.
- [x] Run `npm test` and `npm run build` (including TypeScript checks).
- [ ] Exercise storefront search/category/sort/reset/cart, registration, and admin CRUD; inspect mobile and desktop layout.
- [x] Review the final diff against `design.md`; leave changes available in the user's workspace.

## Progress

- Baseline: 9 tests pass. Existing checkout is `main`; only the user-provided `design.md` is untracked.
- Implementation stays in the requested workspace, with no publishing, commits, or dependency changes required.
- Task 1: complete. New live-result test failed before implementation and passes afterward. Regression coverage also checks removal of a category during catalog refresh, one-result counts, individual filter removal, failed images, and cart accessible names.
- Task 2: implemented. Responsive CSS uses 640/1024/1440px minimum-width breakpoints, with reduced-motion and focus treatments.
- Verification: `npm.cmd test` passes 9/9; `npm.cmd run build` passes type checking and builds all three pages. HTML audit confirms unique IDs, associated labels for every input/select, and valid fragment links across all pages. Checked text/action/stock/danger contrast exceeds 4.5:1; large brand text exceeds 3:1 on white.
- Browser limitation: browser access host is unavailable; native Chrome access approval timed out. Interactive screenshots, target-width overflow checks, keyboard walkthrough, and 200% zoom could not be verified. Related checkboxes remain open rather than claiming visual QA.
- Independent final review found no blocking functional or architectural issue. Corrected the cart's visible/accessibility name mismatch and placed sorting beside the results heading from 1024px to match the specification.
