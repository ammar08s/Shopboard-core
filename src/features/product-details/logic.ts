// Input: the page query string; output: one positive safe integer product ID, or null for invalid URLs.
export function getProductId(search: string) {
  const parameters = new URLSearchParams(search);
  const values = parameters.getAll('id');
  if (values.length !== 1 || !/^[1-9]\d*$/.test(values[0])) return null;
  const id = Number(values[0]);
  return Number.isSafeInteger(id) ? id : null;
}
