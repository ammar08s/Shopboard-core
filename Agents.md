stack: Vite (vanilla), HTML, CSS

- Semantic HTML first
- Every input has a label
- Mobile-first, min-width media queries
- No !important
- Explain every change

## Architecture
- data.js: product data only
- logic.js: pure functions, no DOM, no localStorage 
- state.js: the cart and saving 
- ui.js: the only file that touches the DOM 
- main.js: connects them