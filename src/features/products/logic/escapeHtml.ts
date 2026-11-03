// Input: any display value; output: a string with HTML-sensitive characters escaped.
export function escapeHtml(value: unknown) {
  // Input: an HTML-sensitive character; output: its corresponding safe HTML entity.
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  } as Record<string, string>)[character]);
}
