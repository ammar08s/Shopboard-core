import type { Notify } from '../../notifications/types.ts';
import type { EditorState } from '../editor/state.ts';
import type { EditorElements } from './editor-elements.ts';
import { updateImageFields, updatePreview } from './editor-fields.ts';
import { readImageFile } from './read-image-file.ts';
import { showProductStatus } from './status.ts';

// Input: editor elements, upload state, and notifier; output: bound image controls with safe cancellation.
export function bindEditorImages(elements: EditorElements, state: EditorState, notify?: Notify) {
  // Input: a source selection change; output: invalidated pending reads and refreshed image fields.
  elements.source.addEventListener('change', () => {
    state.cancelRead();
    elements.status.textContent = '';
    updateImageFields(elements, state);
  });
  // Input: an uploaded file selection; output: a current decoded preview or matching error feedback.
  elements.file.addEventListener('change', async () => {
    const version = state.startRead();
    elements.status.textContent = 'Reading photo...';
    updateImageFields(elements, state);
    try {
      const image = await readImageFile(elements.file.files[0]);
      if (!state.isCurrent(version)) return;
      state.setUpload(version, image);
      elements.status.textContent = 'Photo ready. Save the product to keep it.';
    } catch (error) {
      if (!state.isCurrent(version)) return;
      showProductStatus(elements.status, error.message, notify, 'error');
      elements.file.value = '';
    } finally {
      if (state.isCurrent(version)) {
        state.finishRead(version);
        updateImageFields(elements, state);
      }
    }
  });
  // Input: a URL edit or demo selection; output: a preview for the currently selected source.
  function preview() { updatePreview(elements, state); }
  elements.url.addEventListener('input', preview);
  elements.demo.addEventListener('change', preview);
  // Input: a failed preview image; output: a placeholder and actionable inline/toast feedback.
  elements.preview.addEventListener('error', () => {
    elements.preview.hidden = true;
    elements.placeholder.hidden = false;
    showProductStatus(elements.status, 'This photo could not be displayed. Check the image URL or choose another photo.', notify, 'error');
  });
}
