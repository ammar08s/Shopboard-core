// Input: the current document; output: its page identifier or null for a document without one.
export function getPage() { return document.body?.dataset.page ?? null; }

// Input: storage/pageshow callbacks; output: registered page listeners forwarding relevant browser events.
export function bindPageEvents({ onStorage, onPageShow }: { onStorage: (key: string | null) => void; onPageShow: () => void }) {
  // Input: a storage event; output: forwards its changed key to the injected feature coordinator.
  window.addEventListener('storage', (event) => onStorage(event.key));
  window.addEventListener('pageshow', onPageShow);
}
