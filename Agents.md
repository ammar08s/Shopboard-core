stack: Vite (vanilla), TypeScript, HTML, CSS

- Semantic HTML first
- Every input has a label
- Mobile-first, min-width media queries
- No !important
- Explain every change

## Feature-based architecture

For every new feature, create `src/features/<feature-name>/` and keep its code together. Extend the existing feature folder when changing an existing feature.

Each feature follows these four responsibilities:

- `data.ts`: static feature data, defaults, constants, and storage key names only.
- `logic.ts`: pure calculations, transformations, and validation. When there are several functions, use `logic/` with one named function per file instead. Logic has no DOM, localStorage, or mutable application state.
- `state.ts`: the feature's mutable state and persistence. Keep other features' state out of this file.
- `ui.ts`: the feature's DOM rendering, forms, dialogs, and event listeners. DOM access belongs only in feature UI files and `src/shared/ui.ts`.
- Add `types.ts` beside these files when the feature needs shared TypeScript types.

Use `src/main.ts` to connect features and supply cross-feature data or callbacks. For example, pass the current catalog into cart state rather than importing product state inside the cart. Type-only imports between features are allowed.

Use `src/shared/` only for code actually used across features, such as currency formatting and page events. Keep feature-specific code in its feature folder. Import functions directly from their owning files.

Preserve existing behavior, page URLs, product IDs, and localStorage keys during structural refactors. Update affected test imports and the README feature guide, then run `npm test` and `npm run build` (which includes type checking).
