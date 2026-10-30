let state = { searchTerm: '', selectedCategory: '', selectedSort: '' };

// getState returns a copy of the current product selections.
export function getState() {
  return { ...state };
}

// setState updates the product selections without exposing the stored object.
export function setState(selections) {
  state = { ...state, ...selections };
}
