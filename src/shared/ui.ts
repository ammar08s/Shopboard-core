// getPage identifies which page main.ts should initialize without exposing DOM details.
export function getPage() { return document.body?.dataset.page ?? null; }

// bindPageEvents forwards browser storage and navigation events to the application controller.
export function bindPageEvents({ onStorage, onPageShow }: { onStorage: (key: string | null) => void; onPageShow: () => void }) {
  window.addEventListener('storage', (event) => onStorage(event.key));
  window.addEventListener('pageshow', onPageShow);
}
