// Input: the editor page DOM; output: typed references to its form, fields, image, and status.
export function getEditorElements() {
  return {
    dialog: document.querySelector<HTMLDialogElement>('#product-dialog'),
    form: document.querySelector<HTMLFormElement>('#product-form'),
    name: document.querySelector<HTMLInputElement>('#product-name'),
    description: document.querySelector<HTMLTextAreaElement>('#product-description'),
    category: document.querySelector<HTMLSelectElement>('#product-category'),
    newCategory: document.querySelector<HTMLInputElement>('#new-category'),
    price: document.querySelector<HTMLInputElement>('#product-price'),
    stock: document.querySelector<HTMLSelectElement>('#product-stock'),
    source: document.querySelector<HTMLSelectElement>('#image-source'),
    demo: document.querySelector<HTMLSelectElement>('#product-image'),
    file: document.querySelector<HTMLInputElement>('#product-upload'),
    url: document.querySelector<HTMLInputElement>('#product-image-url'),
    preview: document.querySelector<HTMLImageElement>('#image-preview'),
    placeholder: document.querySelector<HTMLElement>('#image-placeholder'),
    status: document.querySelector<HTMLElement>('#editor-status'),
    save: document.querySelector<HTMLButtonElement>('#save-product'),
    title: document.querySelector<HTMLElement>('#editor-title'),
    newCategoryField: document.querySelector<HTMLElement>('#new-category-field'),
  };
}

export type EditorElements = ReturnType<typeof getEditorElements>;
