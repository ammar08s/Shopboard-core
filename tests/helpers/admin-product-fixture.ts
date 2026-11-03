// Input: none; output: an isolated dashboard DOM, real catalog operations, and captured notifications.
export async function createAdminProductFixture() {
  // Input: a UI event; output: no browser default action in this simulated DOM.
  function preventDefault() {}
  const storage = new Map();
  globalThis.localStorage = {
    // Input: a storage key; output: its saved value or null.
    getItem: (key) => storage.get(key) ?? null,
    // Input: a storage key and value; output: the saved value in this fixture's browser storage.
    setItem: (key, value) => storage.set(key, value),
  };
  const elements = new Map();
  // Input: a CSS selector; output: a persistent simulated dashboard element.
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      value: '', textContent: '', innerHTML: '', hidden: false, open: false, files: [], listeners: {},
      // Input: an event name and handler; output: a registered event handler.
      addEventListener(event, handler) { this.listeners[event] = handler; },
      // Input: none; output: a focused element.
      focus() { this.focused = true; },
      // Input: a status element; output: whether it belongs to this simulated editor dialog.
      contains(node) { return selector === '#product-dialog' && node === element('#editor-status'); },
      // Input: an attribute name; output: that attribute removed from this element.
      removeAttribute(name) { delete this[name]; },
      // Input: none; output: true, allowing production validation to run.
      reportValidity() { return true; },
      // Input: none; output: reset product form values and defaults.
      reset() {
        for (const id of ['#product-name', '#product-category', '#new-category', '#product-price', '#product-upload', '#product-image-url']) element(id).value = '';
        element('#product-image').value = '/images/product-1.jpg';
        element('#product-stock').value = 'true';
        element('#image-source').value = 'upload';
      },
      // Input: none; output: an open modal.
      showModal() { this.open = true; },
      // Input: none; output: a closed modal.
      close() { this.open = false; },
      // Input: the current input value; output: its numeric value or NaN.
      get valueAsNumber() { return this.value === '' ? NaN : Number(this.value); },
    });
    return elements.get(selector);
  }
  globalThis.document = {
    // Input: a CSS selector; output: its stable control or the currently open modal.
    querySelector(selector) {
      if (selector === 'dialog[open]') return [element('#product-dialog'), element('#delete-dialog')].find((dialog) => dialog.open) ?? null;
      return element(selector);
    },
  };
  const notifications = [];
  const catalog = await import('../../src/features/products/state.ts');
  const { initializeAdmin } = await import('../../src/features/products/ui/admin.ts');
  const view = initializeAdmin({
    // Input: none; output: the real product state array.
    getProducts: () => catalog.products,
    // Input: none; output: the real category state array.
    getCategories: () => catalog.categories,
    saveProduct: catalog.saveProduct, deleteProduct: catalog.deleteProduct, photoOptions: catalog.products,
    // Input: an emitted notification; output: that notification captured for assertions.
    notify: (notification) => notifications.push(notification),
  });
  return {
    element, notifications, products: catalog.products, view, preventDefault,
    // Input: none; output: a product form submission through the actual listener.
    submit() { element('#product-form').listeners.submit({ preventDefault }); },
    // Input: row action name and product ID; output: the actual delegated row action.
    action(type, id) {
      element('#admin-products').listeners.click({
        // Input: a selector; output: the clicked action button's dataset.
        target: { closest: () => ({ dataset: { action: type, id: String(id) } }) },
      });
    },
    // Input: delete/cancel button value; output: a deletion form submission.
    confirm(value) { element('#delete-form').listeners.submit({ preventDefault, submitter: { value } }); },
    // Input: none; output: global browser test doubles removed.
    cleanup() {
      delete globalThis.document;
      delete globalThis.localStorage;
      delete globalThis.FileReader;
      delete globalThis.Image;
    },
  };
}
