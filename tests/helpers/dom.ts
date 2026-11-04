// Input: an optional tag name; output: a small DOM double with tree/focus bookkeeping.
export function createElement(tag = 'div') {
  return {
    tagName: tag.toUpperCase(), value: '', innerHTML: '', textContent: '', className: '',
    id: '', dataset: {}, attributes: {}, listeners: {}, children: [], parentElement: null,
    hidden: false, isConnected: true, hovered: false,
    offsetLeft: 0, offsetWidth: 0,
    style: {
      values: {},
      // Input: a CSS custom property and value; output: its inline value for layout assertions.
      setProperty(name, value) { this.values[name] = value; },
    },
    // Input: event type and handler; output: records a simulated interaction handler.
    addEventListener(type, handler) { this.listeners[type] = handler; },
    // Input: attribute name/value; output: reflects the attribute on the element.
    setAttribute(name, value) { this.attributes[name] = value; this[name] = value; },
    // Input: an attribute name; output: its value or null.
    getAttribute(name) { return this.attributes[name] ?? null; },
    // Input: child nodes; output: appends them and records their parent.
    append(...nodes) {
      for (const node of nodes) {
        if (node.parentElement) node.parentElement.children = node.parentElement.children.filter((child) => child !== node);
        this.children.push(node);
        node.parentElement = this;
        node.isConnected = true;
      }
    },
    // Input: replacement children; output: replaces rendered contents.
    replaceChildren(...nodes) { this.children = []; this.append(...nodes); },
    // Input: none; output: removes this element from its parent tree.
    remove() {
      if (this.parentElement) this.parentElement.children = this.parentElement.children.filter((node) => node !== this);
      this.isConnected = false;
    },
    // Input: a potential descendant; output: whether it belongs to this subtree.
    contains(target) { return target === this || this.children.some((node) => node.contains(target)); },
    // Input: a supported selector; output: whether this element matches it.
    matches(selector) {
      if (selector === ':hover') return this.hovered;
      if (selector === '[data-category]') return Object.hasOwn(this.dataset, 'category');
      if (selector === '[aria-pressed="true"]') return this.attributes['aria-pressed'] === 'true';
      if (selector.startsWith('.')) return this.className.split(' ').includes(selector.slice(1));
      const data = selector.match(/^\[data-notification-id="(\d+)"\]$/);
      return data ? this.dataset.notificationId === data[1] : this.tagName.toLowerCase() === selector;
    },
    // Input: a supported selector; output: its first matching descendant.
    querySelector(selector) {
      for (const child of this.children) {
        if (child.matches(selector)) return child;
        const nested = child.querySelector(selector);
        if (nested) return nested;
      }
      return null;
    },
    // Input: a supported selector; output: all matching descendants in document order.
    querySelectorAll(selector) {
      // Input: a child; output: its own match followed by matching descendants.
      return this.children.flatMap((child) => [ ...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector) ]);
    },
    // Input: none; output: updates the document's focused element.
    focus() { globalThis.document.activeElement = this; },
    // Input: ancestor visibility; output: no layout rectangle for hidden elements or closed dialogs.
    getClientRects() {
      for (let node = this; node; node = node.parentElement) {
        if (node.hidden || (node.tagName === 'DIALOG' && !node.open)) return [];
      }
      return [{}];
    },
    // Input: none; output: native-valid default outside constraint-validation tests.
    checkValidity() { return true; },
  };
}
