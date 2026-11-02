// escapeHtml displays admin-entered text literally when it is inserted into HTML templates.
export function escapeHtml(value: unknown) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  } as Record<string, string>)[character]);
}
