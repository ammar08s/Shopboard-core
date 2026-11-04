# ShopBoard

A vanilla TypeScript + Vite shop with search, filtering, sorting, a cart, action notifications, and demo admin pages.

## Project structure

```text
src/
  main.ts                         Connects features and initializes each page
  features/
    about/styles.css              Static Who we are page presentation
    product-details/              Standalone product route, information, and purchase UI
    reviews/                      Browser-only ratings/comments, validation, state, and UI
    account/                      Demo registration/login data, logic, state, UI
    cart/
      data.ts, types.ts           Cart defaults, storage key, injected operations
      logic/                      Pure totals, quantity changes, restoration
      state.ts, ui.ts             Cart persistence and rendering
    notifications/
      data.ts, types.ts           Display defaults, icons, notification contracts
      logic/                      Pure normalization and visible-queue selection
      state.ts                    Queue, deduplication, pause/resume, expiry
      ui.ts, ui/createToast.ts     Accessible stack, focus handling, safe rendering
    products/
      data.ts, types.ts           Catalog defaults and product contracts
      logic/                      Pure filtering, validation, image checks, escaping
      state.ts                    Catalog persistence and browsing state
      editor/state.ts             Editing session and cancelable upload state
      admin/state.ts              Pending deletion state
      ui/                         Focused listing, dashboard, and editor UI files
  shared/
    formatting.ts, ui.ts           Shared currency and browser-page events
  styles/
    shop.css                      Ordered local stylesheet imports
    *.css                         Focused visual sections and notifications
```

Each feature keeps data, pure logic, mutable state, and UI separate as described in `Agents.md`. DOM access stays in feature UI files and `src/shared/ui.ts`. Import functions directly from their owning files.

`main.ts` supplies the current catalog to cart state and injects the same notification callback into cart, account, and admin UIs. Features never import another feature's mutable state; type-only imports describe callback contracts.

## Commands

- `npm install`: install dependencies.
- `npm run dev`: start the development server.
- `npm test`: run regression and notification tests.
- `npm run typecheck`: check application/configuration types.
- `npm run build`: type-check and build the storefront, about, product, and two admin pages into `dist/`.
- `npm run preview`: preview the production build.

Use `npm.cmd` if PowerShell blocks `npm.ps1`. Tests require Node 22.18+ or Node 24+. See [TypeScript setup and migration](docs/typescript.md) for compiler settings and migration details.

## Finding code by feature

| To change | Open |
| --- | --- |
| Who we are page and demo copy | `about.html`, `src/features/about/styles.css` |
| Toast appearance | `src/styles/notifications.css` |
| Toast queue, deduplication, expiry, pause/resume | `src/features/notifications/state.ts` |
| Toast rendering, modal placement, focus, announcements | `src/features/notifications/ui.ts`, `ui/createToast.ts` |
| Cart controls or feedback | `src/features/cart/ui.ts` |
| Cart persistence or calculations | `src/features/cart/state.ts`, `logic/` |
| Search/category/sort controls | `src/features/products/ui/controls.ts`, `categories.ts` |
| Product pages and purchases | `product.html`, `src/features/product-details/` |
| Demo ratings and comments | `src/features/reviews/`, `src/styles/reviews.css` |
| Product descriptions | Product types/state/validation, `ui/editor*.ts`, admin description field |
| All select controls and option menus | `src/styles/selects.css`; specification in `design.md` |
| Category indicator measurement and motion | `src/features/products/ui/category-motion.ts`, `src/styles/catalog-motion.css` |
| Result titles/counts/chips | `src/features/products/ui/results.ts` |
| Product cards or failed-image fallback | `src/features/products/ui/cards.ts`, `controls.ts` |
| Dashboard actions or deletion | `src/features/products/ui/admin-actions.ts`, `deletion.ts` |
| Editor forms/photos | `src/features/products/ui/editor*.ts`, `read-image-file.ts` |
| Catalog persistence or validation | `src/features/products/state.ts`, `logic/` |
| Demo account forms | `src/features/account/` |
| Page structure and cross-feature connections | Root HTML pages, `src/main.ts` |
| Responsive styling | `src/styles/responsive.css` and the owning visual section |

## Action notifications

Cart additions, quantity changes, removals, clearing, and storage failures show toast feedback. Registration explains that validation creates no account. After demo login or direct admin entry, a welcome notice identifies the demo workspace. Admin creation, edits, stock changes, deletions, and save/image failures report their actual outcomes.

Toasts use safe text rendering, distinct icons/colors, and labeled 44px dismiss buttons. Up to three are visible; extra messages queue, and identical messages refresh one notice. Success/info notices expire after five seconds; warnings/errors remain until dismissed. Hover and keyboard focus pause expiry, with a fresh reading interval when attention ends. Dismissal restores focus to a usable control, and modal errors remain visible inside the active dialog. Existing inline status/form messages remain readable without duplicate screen-reader announcements; background updates use the toast announcer when a modal makes their inline status inaccessible.

## Marketplace design

The `/about.html` page introduces ShopBoard with clearly labeled demo story, mission, and values. It uses the shared design tokens, semantic static HTML, and mobile-first styles owned by `src/features/about/`. It needs no JavaScript, mutable state, or persistence. Storefront utility/footer links make the page discoverable, and its collection/cart links return to working shop sections.

The storefront follows `design.md`: prominent labeled search, category navigation, synchronized filters/chips/counts, and a catalog-first layout. Clear-all resets search/category while retaining sorting. Filters expand inline on mobile and remain visible from 1024px.

The grid has one column below 360px, two from 360px, three from 1024px, and four from 1440px. Mobile cards use compact spacing, rounded image panels, category tags, subtle shadows, and 44px purchase targets. The mobile cart has a compact icon/count badge and tighter item spacing. The CSS split preserves the existing cascade and responsive behavior.

Category navigation preserves button identity so its orange indicator can glide between selections without losing focus. Category and sort changes give cards a brief staggered reveal; typing a search updates results immediately without restarting that animation. Motion follows reduced-motion preferences, and the indicator realigns when the navigation resizes.

## Data and maintenance rules

Product images and titles link to `/product.html?id=<id>`. Detail pages show current catalog information, availability, a cart action, and an optional description (up to 2,000 characters) editable in the admin editor. Default demo products include sample descriptions; existing saved products without descriptions remain valid. Invalid/deleted links show an unavailable page. Cart quantities reload when navigating between pages so product-page purchases remain visible in the storefront.

Product reviews are browser-only demos under the separate `shopboard-reviews` localStorage key. Each browser saves one editable 1–5 star vote per product; the average/count reflects those saved votes. Comments require a name (up to 60 characters) and text (up to 1,000 characters), show dates, and list newest first. There is a 200-comment browser limit. Reviews start empty, validate restored data, render as text, and retain entered text when saving fails. No backend or authentication is needed.

Catalog/cart changes stay in this browser's localStorage; existing keys, product IDs, and data formats are preserved. Uploaded raster photos remain limited to 1 MB. Login does not authenticate, credentials are not saved/sent, registration creates no account, and checkout/payments are unavailable.

Application TypeScript/CSS files and test helpers stay within 100 lines, with input/output comments on declared functions and handlers. Large product UI responsibilities are split by purpose, and stylesheets are imported in their original cascade order. Root storefront/admin HTML documents are necessary exceptions: complete semantic page markup stays in HTML rather than moving into JavaScript solely to reduce line counts. User-provided reference documents are retained unchanged.

For a new feature, create `src/features/<feature-name>/` with the same responsibilities. Share code only when multiple features actually use it. After structural changes, update affected tests and this guide, then run `npm test` and `npm run build`.
