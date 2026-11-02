# ShopBoard

A vanilla TypeScript + Vite shop with search, category filtering, price sorting, a cart, and demo admin pages.

## Project structure

```text
src/
  main.ts                    Connects features and initializes each page
  features/
    cart/
      data.ts                Demo cart products, storage key, quantity limit
      logic/                 One pure cart function per file
        calculateCartTotal.ts
        changeCartQuantity.ts
        getCartProducts.ts
        restoreCartItems.ts
      state.ts               Cart quantities, persistence, and reconciliation
      ui.ts                  Cart rendering and controls
      types.ts               Cart data and callback types
    products/
      data.ts                Demo catalog, image settings, storage key
      logic/
        escapeHtml.ts
        getVisibleProducts.ts
        isProductImage.ts
        validateProduct.ts
      state.ts               Catalog persistence and filter selections
      ui.ts                  Shop products and admin product editor
      types.ts               Product, selection, and catalog callback types
    account/
      data.ts                Demo messages and login destination
      logic.ts               Registration status message
      state.ts               Registration status in memory
      ui.ts                  Demo login and registration forms
  shared/
    formatting.ts            Currency formatter used by products and cart
    ui.ts                    Page detection and browser events
  styles/shop.css            Existing shared responsive styles
```

Each feature follows the four responsibilities in `Agents.md`: data, pure logic, state, and UI. A small feature uses `logic.ts`; several functions use a `logic/` folder. Feature-specific types stay in that feature's `types.ts`.

The HTML pages stay at the project root and load `src/main.ts`. Product browsing and admin editing share the products feature because they manage the same catalog. Account forms remain demos; credentials are never saved.

`main.ts` connects features. For example, `createCartState(() => productState.products)` supplies the current catalog to the cart. The cart can read current prices and availability without importing product state. Cart storage stays in the cart feature, and catalog storage stays in the products feature.

## Commands

- `npm install`: install project dependencies.
- `npm run dev`: start the development server.
- `npm test`: run the regression suite.
- `npm run typecheck`: check application and Vite configuration types without generating files.
- `npm run build`: check types, then build all three pages into `dist/`.
- `npm run preview`: preview the production build.

## Demo data

Product and cart changes are stored in this browser's local storage. Uploaded photos are saved with the catalog, up to 1 MB per photo. Existing saved data continues to work because storage keys and product IDs are unchanged. The admin login is a demo and does not authenticate users.

## How the JavaScript-to-TypeScript migration works

1. Install the tools: `npm install --save-dev typescript @types/node`. TypeScript supplies the compiler (`tsc`); `@types/node` describes Node APIs used by the Vite configuration. These are development dependencies.
2. Rename JavaScript files to `.ts`, including the Vite configuration and tests. Update module imports and the three HTML script paths to use `.ts`. HTML and CSS keep their existing roles.
3. Add `tsconfig.json`. `target` selects supported JavaScript features; `lib` provides browser API types; `moduleResolution: "Bundler"` matches Vite. `allowImportingTsExtensions` supports explicit `.ts` imports. `noEmit` makes `tsc` check types without writing JavaScript because Vite handles the output.
4. Describe data and parameters. Each feature's `types.ts` defines its data and callback types. For example, `quantity: number` tells the compiler that a quantity must be numeric. `import type` imports only a type, so it disappears from the JavaScript output.
5. Describe DOM elements in `ui.ts`. For example, `querySelector<HTMLInputElement>` tells TypeScript that an existing input has properties such as `value`. Type assertions (`as`) describe existing assumptions; they do not convert values or add runtime validation. Existing numeric DOM assignments use assertions to preserve their exact runtime behavior.
6. Run `npm run typecheck`, `npm test`, and `npm run build`. Vite removes type syntax and bundles JavaScript into `dist/`; browsers execute that JavaScript. Use `npm run dev` while developing and `npm run preview` to inspect the build.

The compiler checks `src/` and `vite.config.ts`. The existing tests were renamed and their imports updated; their lightweight browser mocks are exercised at runtime rather than type-checked. Tests use Node's built-in TypeScript stripping, so use Node 22.18+ or Node 24+. This migration was verified with Node 24.

Strict checking is enabled, with two migration exceptions: `strictNullChecks: false` preserves existing assumptions about page elements, and `useUnknownInCatchVariables: false` preserves existing `error.message` access. These can be tightened later with additional checks, separately from this behavior-preserving migration. TypeScript checks do not replace the existing runtime validation of saved data and form values.

Within each feature, `data.ts` contains static data, logic contains pure functions, `state.ts` owns state and persistence, and `ui.ts` owns DOM access. `main.ts` connects features. Type definitions disappear from the JavaScript output.

If PowerShell blocks `npm.ps1`, use `npm.cmd` in the commands above (for example, `npm.cmd run build`).

## Finding code by feature

| To change | Open |
| --- | --- |
| Cart rendering, buttons, or quantity inputs | `src/features/cart/ui.ts` |
| Cart storage and current quantities | `src/features/cart/state.ts` |
| Cart totals, quantity rules, or restoring saved items | `src/features/cart/logic/` |
| Cart defaults and quantity limit | `src/features/cart/data.ts` |
| Product search, filtering, or sorting | `src/features/products/logic/getVisibleProducts.ts` |
| Product validation or supported image sources | `src/features/products/logic/` |
| Product storage or filter selections | `src/features/products/state.ts` |
| Product cards or the admin product editor | `src/features/products/ui.ts` |
| Demo catalog and image upload settings | `src/features/products/data.ts` |
| Login or registration | `src/features/account/` |
| Connecting features and handling catalog refreshes | `src/main.ts` |

For every new feature, create a folder under `src/features/` using the same four responsibilities. Keep its behavior and data together so editing one feature does not require reading unrelated feature code. Share a helper only when multiple features actually use it.
