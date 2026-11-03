// Input: none; output: isolated operations for the dashboard's pending product deletion.
export function createDeletionState() {
  let pendingId: number | null = null;
  return {
    // Input: a product ID; output: that product selected for confirmation.
    select(id: number) { pendingId = id; },
    // Input: none; output: the current pending product ID or null.
    get() { return pendingId; },
    // Input: none; output: cleared pending deletion state.
    clear() { pendingId = null; },
  };
}
