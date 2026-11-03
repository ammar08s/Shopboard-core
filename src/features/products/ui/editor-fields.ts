import { isProductImage } from '../logic/isProductImage.ts';
import type { EditorState } from '../editor/state.ts';
import type { EditorElements } from './editor-elements.ts';

// Input: editor elements and state; output: the image chosen by the active source field.
export function selectedImage(elements: EditorElements, state: EditorState) {
  if (elements.source.value === 'upload') return state.get().uploadedImage;
  if (elements.source.value === 'url') return elements.url.value.trim();
  return elements.demo.value;
}

// Input: editor elements and state; output: a matching photo preview or its empty placeholder.
export function updatePreview(elements: EditorElements, state: EditorState) {
  const source = selectedImage(elements, state);
  const hasImage = isProductImage(source);
  elements.preview.hidden = !hasImage;
  elements.placeholder.hidden = hasImage;
  if (hasImage) elements.preview.src = source;
  else elements.preview.removeAttribute('src');
}

// Input: editor elements; output: an enabled, required category name field only for new categories.
export function updateCategory(elements: EditorElements) {
  const isNew = elements.category.value === '__new__';
  elements.newCategoryField.hidden = !isNew;
  elements.newCategory.disabled = !isNew;
  elements.newCategory.required = isNew;
}

// Input: editor elements and state; output: enabled fields for the chosen photo source and preview.
export function updateImageFields(elements: EditorElements, state: EditorState) {
  const { source, file, url, demo, save } = elements;
  const values = state.get();
  for (const option of ['upload', 'url', 'demo']) {
    document.querySelector<HTMLElement>(`#image-${option}-field`).hidden = source.value !== option;
  }
  file.disabled = source.value !== 'upload';
  file.required = source.value === 'upload' && !values.uploadedImage;
  url.disabled = source.value !== 'url';
  url.required = source.value === 'url';
  demo.disabled = source.value !== 'demo';
  demo.required = source.value === 'demo';
  save.disabled = values.readingImage;
  updatePreview(elements, state);
}
