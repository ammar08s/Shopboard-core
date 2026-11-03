interface EditorValues {
  editingId: number | null;
  uploadedImage: string;
  readingImage: boolean;
  uploadVersion: number;
}

// Input: none; output: isolated editing and upload state operations without DOM access.
export function createEditorState() {
  let values: EditorValues = { editingId: null, uploadedImage: '', readingImage: false, uploadVersion: 0 };
  return {
    // Input: none; output: a snapshot of the current editor values.
    get() { return { ...values }; },
    // Input: an optional product ID and uploaded image; output: a reset edit session.
    reset(editingId: number | null, uploadedImage = '') {
      values = { editingId, uploadedImage, readingImage: false, uploadVersion: values.uploadVersion + 1 };
    },
    // Input: none; output: invalidated pending reads while retaining any selected photo.
    cancelRead() { values.uploadVersion += 1; values.readingImage = false; },
    // Input: none; output: the version identifying a new upload, with its loading state set.
    startRead() {
      values.uploadVersion += 1;
      values.uploadedImage = '';
      values.readingImage = true;
      return values.uploadVersion;
    },
    // Input: an upload version; output: whether that upload still belongs to the active session.
    isCurrent(version: number) { return version === values.uploadVersion; },
    // Input: an upload version and decoded photo; output: a selected photo only for a current upload.
    setUpload(version: number, image: string) {
      if (version === values.uploadVersion) values.uploadedImage = image;
    },
    // Input: an upload version; output: cleared loading state only when that version remains current.
    finishRead(version: number) {
      if (version === values.uploadVersion) values.readingImage = false;
    },
  };
}

export type EditorState = ReturnType<typeof createEditorState>;
