// Input: the category navigation; output: measured indicator coordinates for its selected button.
export function updateCategoryIndicator(navigation: HTMLElement) {
  const selected = navigation.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
  if (!selected || !Number.isFinite(selected.offsetLeft) || selected.offsetWidth <= 0) return;
  navigation.style.setProperty('--category-indicator-x', `${selected.offsetLeft}px`);
  navigation.style.setProperty('--category-indicator-width', `${selected.offsetWidth}px`);
  navigation.setAttribute('data-indicator-ready', 'true');
}

// Input: the page navigation; output: indicator measurements kept aligned when responsive layout changes.
export function bindCategoryMotion() {
  if (typeof ResizeObserver === 'undefined') return;
  const navigation = document.querySelector<HTMLElement>('#category-navigation');
  // Input: a navigation resize; output: the selected button's current indicator geometry.
  const observer = new ResizeObserver(() => updateCategoryIndicator(navigation));
  observer.observe(navigation);
}
