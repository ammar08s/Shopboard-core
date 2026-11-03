# TypeScript setup and migration

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

