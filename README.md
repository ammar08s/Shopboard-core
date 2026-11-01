# ShopBoard

A vanilla Vite shop with search, category filtering, price sorting, a cart, and demo admin pages.

## Project structure

```text
shopboard/
  index.html                 Shop page
  admin-login.html           Demo login page
  admin-dashboard.html       Product management page
  src/
    main.js                  Shared page entry point and module wiring
    app/
      data.js                Initial product catalog only
      logic.js               Pure validation, formatting, filtering, and cart calculations
      state.js               Catalog, cart, and browser storage
      ui.js                  All DOM rendering, forms, dialogs, and browser events
    styles/
      shop.css               Shared responsive styles
  tests/                     Node regression and interaction tests
  public/
    images/                  Demo product photos and their sources
  vite.config.js             Three-page production build
```

The four app modules follow `Agents.md`. The HTML pages stay at the project root to preserve their existing URLs. All three pages load `src/main.js`, which selects the page using its `data-page` attribute.

## Commands

- `npm install`: install project dependencies.
- `npm run dev`: start the development server.
- `npm test`: run the regression suite.
- `npm run build`: build all three pages into `dist/`.
- `npm run preview`: preview the production build.

## Demo data

Product and cart changes are stored in this browser's local storage. Uploaded photos are saved with the catalog, up to 1 MB per photo. Existing saved data continues to work because storage keys and product IDs are unchanged. The admin login is a demo and does not authenticate users.
