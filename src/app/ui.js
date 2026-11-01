import { escapeHtml, isProductImage, maxImageBytes } from './logic.js';

const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// readImageFile validates an uploaded raster image and returns a persistent data URL.
async function readImageFile(file) {
  if (!file || !imageTypes.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, or GIF photo.');
  if (file.size === 0 || file.size > maxImageBytes) throw new Error('Choose a photo smaller than 1 MB.');
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The photo could not be read. Please choose it again.'));
    reader.onabort = () => reject(new Error('The photo upload was canceled.'));
    reader.readAsDataURL(file);
  });
  if (!isProductImage(source)) throw new Error('This photo format is not supported.');
  const image = new Image();
  image.src = source;
  try { await image.decode(); }
  catch { throw new Error('This file could not be opened as a photo.'); }
  return source;
}

// readProductControls reads the current search, category, and sort values from the page.
export function readProductControls() {
  const searchInput = document.querySelector('#searchInput');
  const categorySelect = document.querySelector('#categorySelect');
  const sortSelect = document.querySelector('#sortSelect');
  return {
    searchTerm: searchInput.value,
    selectedCategory: categorySelect.value,
    selectedSort: sortSelect.value,
  };
}

// renderCategories fills the category dropdown while keeping the All Categories option.
export function renderCategories(categories) {
  const categorySelect = document.querySelector('#categorySelect');
  const selectedCategory = categorySelect.value;
  categorySelect.innerHTML = '<option value="">All Categories</option>' + categories.map((category) => `
    <option value="${escapeHtml(category)}">${escapeHtml(category)}</option>
  `).join('');
  categorySelect.value = categories.includes(selectedCategory) ? selectedCategory : '';
}

// renderProductCards displays semantic product cards or the empty-results message.
export function renderProductCards(products) {
  const productContainer = document.querySelector('#products .products');
  productContainer.innerHTML = products.length === 0
    ? '<p role="status">No products found</p>'
    : products.map((product) => `
      <article class="product-card" aria-labelledby="product-${product.id}-title">
        <img class="product-photo" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" width="800" height="640" loading="lazy" />
        <div class="product-details">
        <h3 id="product-${product.id}-title">${escapeHtml(product.name)}</h3>
        <p class="category-label">${escapeHtml(product.category)}</p>
        <p class="price">$${product.price.toFixed(2)} USD</p>
        <p class="stock-label ${product.inStock ? '' : 'out-of-stock'}">${product.inStock ? 'In stock' : 'Out of stock'}</p>
        <button class="button" type="button" ${product.inStock ? '' : 'disabled'} data-add-to-cart="${product.id}" aria-label="Add ${escapeHtml(product.name)} to cart">${product.inStock ? 'Add to cart <span aria-hidden="true">+</span>' : 'Out of stock'}</button>
        </div>
      </article>
    `).join('');
}

// bindProductControls connects search input and dropdown changes to the shared update function.
export function bindProductControls(onChange) {
  const searchInput = document.querySelector('#searchInput');
  const categorySelect = document.querySelector('#categorySelect');
  const sortSelect = document.querySelector('#sortSelect');
  searchInput.addEventListener('input', onChange);
  categorySelect.addEventListener('change', onChange);
  sortSelect.addEventListener('change', onChange);
}

// renderCollectionSummary keeps the shop counts in sync with admin catalog changes.
export function renderCollectionSummary(productCount, categoryCount) {
  const summary = document.querySelector('#collection-summary');
  if (summary) summary.textContent = `${productCount} essentials / ${categoryCount} categories`;
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// renderDashboard updates the dashboard summaries and catalog table without changing saved data.
export function renderDashboard(products, categories) {
  document.querySelector('#product-count').textContent = products.length;
  document.querySelector('#category-count').textContent = categories.length;
  const averagePrice = products.length === 0 ? 0 : products.reduce((total, product) => total + product.price, 0) / products.length;
  document.querySelector('#average-price').textContent = money.format(averagePrice);
  document.querySelector('#admin-products').innerHTML = products.length === 0
    ? '<tr><td colspan="5">No products yet. Choose Add product to start your collection.</td></tr>'
    : products.map((product) => `
      <tr>
        <td><div class="catalog-product"><img src="${escapeHtml(product.image)}" alt="" width="48" height="48" loading="lazy" /><span>${escapeHtml(product.name)}</span></div></td>
        <td>${escapeHtml(product.category)}</td>
        <td>${money.format(product.price)}</td>
        <td><span class="stock-label ${product.inStock ? '' : 'out-of-stock'}">${product.inStock ? 'In stock' : 'Out of stock'}</span></td>
        <td><div class="row-actions">
          <button class="button secondary-button" type="button" data-action="edit" data-id="${product.id}" aria-label="Edit ${escapeHtml(product.name)}">Edit</button>
          <button class="button secondary-button" type="button" data-action="stock" data-id="${product.id}" aria-label="Mark ${escapeHtml(product.name)} as ${product.inStock ? 'out of stock' : 'in stock'}">${product.inStock ? 'Mark out of stock' : 'Mark in stock'}</button>
          <button class="button danger-button" type="button" data-action="delete" data-id="${product.id}" aria-label="Delete ${escapeHtml(product.name)}">Delete</button>
        </div></td>
      </tr>
    `).join('');
}

// createProductEditor owns the modal form and exposes an open method to the dashboard controller.
export function createProductEditor({ onSave, saveProduct, getProducts, getCategories, photoOptions }) {
  const dialog = document.querySelector('#product-dialog');
  const form = document.querySelector('#product-form');
  const nameInput = document.querySelector('#product-name');
  const categorySelect = document.querySelector('#product-category');
  const newCategoryInput = document.querySelector('#new-category');
  const priceInput = document.querySelector('#product-price');
  const stockSelect = document.querySelector('#product-stock');
  const sourceSelect = document.querySelector('#image-source');
  const demoSelect = document.querySelector('#product-image');
  const fileInput = document.querySelector('#product-upload');
  const urlInput = document.querySelector('#product-image-url');
  const preview = document.querySelector('#image-preview');
  const message = document.querySelector('#editor-status');
  const saveButton = document.querySelector('#save-product');
  let editingId = null;
  let uploadedImage = '';
  let readingImage = false;
  let uploadVersion = 0;

  demoSelect.innerHTML = photoOptions.map((product) => `<option value="/images/product-${product.id}.jpg">${escapeHtml(product.name)} demo photo</option>`).join('');

  // selectedImage reads the image source for the active photo option.
  function selectedImage() {
    if (sourceSelect.value === 'upload') return uploadedImage;
    if (sourceSelect.value === 'url') return urlInput.value.trim();
    return demoSelect.value;
  }

  // updatePreview displays the selected photo or a helpful empty state.
  function updatePreview() {
    const source = selectedImage();
    const hasImage = isProductImage(source);
    preview.hidden = !hasImage;
    document.querySelector('#image-placeholder').hidden = hasImage;
    if (hasImage) preview.src = source;
    else preview.removeAttribute('src');
  }

  // updateCategory reveals a required name field only when adding a new category.
  function updateCategory() {
    const isNewCategory = categorySelect.value === '__new__';
    document.querySelector('#new-category-field').hidden = !isNewCategory;
    newCategoryInput.disabled = !isNewCategory;
    newCategoryInput.required = isNewCategory;
  }

  // updateImageFields enables only the inputs belonging to the chosen photo source.
  function updateImageFields() {
    for (const source of ['upload', 'url', 'demo']) {
      document.querySelector(`#image-${source}-field`).hidden = sourceSelect.value !== source;
    }
    fileInput.disabled = sourceSelect.value !== 'upload';
    fileInput.required = sourceSelect.value === 'upload' && !uploadedImage;
    urlInput.disabled = sourceSelect.value !== 'url';
    urlInput.required = sourceSelect.value === 'url';
    demoSelect.disabled = sourceSelect.value !== 'demo';
    demoSelect.required = sourceSelect.value === 'demo';
    saveButton.disabled = readingImage;
    updatePreview();
  }

  // open resets the modal and loads a product for editing or prepares an empty create form.
  function open(product = null) {
    uploadVersion += 1;
    readingImage = false;
    editingId = product?.id ?? null;
    uploadedImage = '';
    form.reset();
    message.textContent = '';
    categorySelect.innerHTML = '<option value="">Choose a category</option>' + getCategories().map((category) => `<option value="existing:${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('') + '<option value="__new__">+ Add a new category...</option>';
    sourceSelect.value = 'upload';
    document.querySelector('#editor-title').textContent = product ? 'Edit product' : 'Add product';
    saveButton.textContent = product ? 'Save changes' : 'Add product';
    if (product) {
      nameInput.value = product.name;
      categorySelect.value = `existing:${product.category}`;
      priceInput.value = product.price;
      stockSelect.value = String(product.inStock);
      if (product.image.startsWith('data:')) {
        uploadedImage = product.image;
      } else if (product.image.startsWith('/images/')) {
        sourceSelect.value = 'demo';
        demoSelect.value = product.image;
      } else {
        sourceSelect.value = 'url';
        urlInput.value = product.image;
      }
    }
    updateCategory();
    updateImageFields();
    dialog.showModal();
    nameInput.focus();
  }

  // close cancels pending image reads and dismisses the editor without saving changes.
  function close() {
    uploadVersion += 1;
    readingImage = false;
    dialog.close();
  }

  // loadUpload reads a selected file and ignores results from a canceled or replaced selection.
  async function loadUpload() {
    const version = ++uploadVersion;
    uploadedImage = '';
    readingImage = true;
    message.textContent = 'Reading photo...';
    updateImageFields();
    try {
      const image = await readImageFile(fileInput.files[0]);
      if (version !== uploadVersion) return;
      uploadedImage = image;
      message.textContent = 'Photo ready. Save the product to keep it.';
    } catch (error) {
      if (version !== uploadVersion) return;
      message.textContent = error.message;
      fileInput.value = '';
    } finally {
      if (version === uploadVersion) {
        readingImage = false;
        updateImageFields();
      }
    }
  }

  // submit saves the active form and keeps the modal open when validation or storage fails.
  function submit(event) {
    event.preventDefault();
    if (readingImage || !form.reportValidity()) return;
    try {
      const isEditing = editingId !== null;
      if (isEditing && !getProducts().some((product) => product.id === editingId)) throw new Error('This product was deleted in another tab.');
      const product = saveProduct({
        name: nameInput.value,
        category: categorySelect.value === '__new__' ? newCategoryInput.value : categorySelect.value.slice('existing:'.length),
        price: priceInput.valueAsNumber,
        inStock: stockSelect.value === 'true',
        image: selectedImage(),
      }, editingId ?? undefined);
      close();
      onSave(product, isEditing);
    } catch (error) {
      message.textContent = `Could not save product. ${error.message}`;
    }
  }

  form.addEventListener('submit', submit);
  categorySelect.addEventListener('change', updateCategory);
  sourceSelect.addEventListener('change', () => {
    uploadVersion += 1;
    readingImage = false;
    message.textContent = '';
    updateImageFields();
  });
  fileInput.addEventListener('change', loadUpload);
  urlInput.addEventListener('input', updatePreview);
  demoSelect.addEventListener('change', updatePreview);
  preview.addEventListener('error', () => {
    preview.hidden = true;
    document.querySelector('#image-placeholder').hidden = false;
    message.textContent = 'This photo could not be displayed. Check the image URL or choose another photo.';
  });
  document.querySelector('#cancel-edit').addEventListener('click', close);
  document.querySelector('#close-editor').addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  return { open };
}

// initializeAdmin binds dashboard actions to injected catalog operations.
export function initializeAdmin({ getProducts, getCategories, saveProduct, deleteProduct, photoOptions }) {
  let pendingDeleteId = null;
  const status = document.querySelector('#admin-status');
  const deleteDialog = document.querySelector('#delete-dialog');
  const editor = createProductEditor({
    saveProduct, getProducts, getCategories, photoOptions,
    onSave(product, isEditing) {
      renderDashboard(getProducts(), getCategories());
      status.textContent = `${product.name} ${isEditing ? 'updated' : 'added'}. Changes saved in this browser.`;
      document.querySelector('#add-product').focus();
    },
  });

  // handleProductAction routes row actions to the editor, stock update, or deletion confirmation.
  function handleProductAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const product = getProducts().find((item) => item.id === Number(button.dataset.id));
    if (!product) { status.textContent = 'This product no longer exists. Refresh the catalog.'; return; }
    if (button.dataset.action === 'edit') {
      editor.open(product);
    } else if (button.dataset.action === 'delete') {
      pendingDeleteId = product.id;
      document.querySelector('#delete-description').textContent = `Delete ${product.name} from this browser's catalog? It will also be removed from the shop and cart.`;
      deleteDialog.showModal();
    } else if (button.dataset.action === 'stock') {
      try {
        const updated = saveProduct({ ...product, inStock: !product.inStock });
        renderDashboard(getProducts(), getCategories());
        status.textContent = `${updated.name} marked ${updated.inStock ? 'in stock' : 'out of stock'}.`;
        document.querySelector(`[data-action="stock"][data-id="${product.id}"]`).focus();
      } catch (error) {
        status.textContent = `Could not update availability. ${error.message}`;
      }
    }
  }

  // confirmDelete removes a product only when the confirmation button is submitted.
  function confirmDelete(event) {
    event.preventDefault();
    if (event.submitter?.value !== 'delete') {
      deleteDialog.close();
      pendingDeleteId = null;
      return;
    }
    try {
      const product = getProducts().find((item) => item.id === pendingDeleteId);
      deleteProduct(pendingDeleteId);
      pendingDeleteId = null;
      deleteDialog.close();
      renderDashboard(getProducts(), getCategories());
      status.textContent = `${product.name} deleted. Changes saved in this browser.`;
      document.querySelector('#catalog-title').focus();
    } catch (error) {
      deleteDialog.close();
      status.textContent = `Could not delete product. ${error.message}`;
    }
  }

  document.querySelector('#add-product').addEventListener('click', () => editor.open());
  document.querySelector('#admin-products').addEventListener('click', handleProductAction);
  document.querySelector('#delete-form').addEventListener('submit', confirmDelete);
  deleteDialog.addEventListener('cancel', () => { pendingDeleteId = null; });
  renderDashboard(getProducts(), getCategories());
  return {
    refresh() { renderDashboard(getProducts(), getCategories()); },
    notify(message) { status.textContent = message; },
  };

}


// initializeCart renders the cart and connects its labeled controls to state operations.
export function initializeCart({ getCart, getCartProducts, cartTotal, onAdd, onQuantityChange, onClear }) {
  const list = document.querySelector('#cart-items');
  const status = document.querySelector('#cart-status');

  // refreshCart displays current items, totals, and accessible quantity and remove controls.
  function refreshCart(message = '') {
    const cart = getCart();
    const products = getCartProducts();
    list.replaceChildren();
    for (const [id, quantity] of Object.entries(cart)) {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = products[id].name;
      const price = document.createElement('p');
      price.textContent = `${money.format(products[id].price / 100)} each / ${money.format(products[id].price * quantity / 100)} subtotal`;
      const label = document.createElement('label');
      label.htmlFor = `quantity-${id}`;
      label.textContent = `Quantity for ${products[id].name}`;
      const input = document.createElement('input');
      Object.assign(input, { id: label.htmlFor, type: 'number', min: '1', max: '99', step: '1', value: String(quantity), required: true });
      input.addEventListener('change', () => {
        if (!input.checkValidity()) { input.reportValidity(); return; }
        const warning = onQuantityChange(id, input.valueAsNumber);
        refreshCart(`${products[id].name} quantity updated.${warning}`);
        document.getElementById(input.id)?.focus();
      });
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'button'; remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${products[id].name} from cart`);
      remove.addEventListener('click', () => {
        const warning = onQuantityChange(id, 0);
        refreshCart(`${products[id].name} removed.${warning}`);
        document.querySelector('#cart-title').focus();
      });
      item.append(name, price, label, input, remove); list.append(item);
    }
    document.querySelector('#cart-count').textContent = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    document.querySelector('#cart-total').textContent = money.format(cartTotal() / 100);
    document.querySelector('#cart-empty').hidden = Object.keys(cart).length > 0;
    document.querySelector('#clear-cart').disabled = Object.keys(cart).length === 0;
    if (message) status.textContent = message;
  }

  document.querySelector('#products .products').addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-to-cart]');
    if (!button) return;
    const product = getCartProducts()[button.dataset.addToCart];
    try {
      const warning = onAdd(button.dataset.addToCart);
      refreshCart(`${product.name} added to cart.${warning}`);
    } catch (error) { status.textContent = error.message; }
  });
  document.querySelector('#clear-cart').addEventListener('click', () => {
    const warning = onClear(); refreshCart(`Cart cleared.${warning}`);
    document.querySelector('#cart-title').focus();
  });
  refreshCart();
  return { refresh: refreshCart };
}

// getPage identifies which page main.js should initialize without exposing DOM details.
export function getPage() { return document.body?.dataset.page ?? null; }

// bindPageEvents forwards browser storage and navigation events to the application controller.
export function bindPageEvents({ onStorage, onPageShow }) {
  window.addEventListener('storage', (event) => onStorage(event.key));
  window.addEventListener('pageshow', onPageShow);
}

// initializeLogin opens the public demo dashboard without transmitting or saving credentials.
export function initializeLogin() {
  document.querySelector('#admin-login-form').addEventListener('submit', (event) => {
    event.preventDefault(); event.currentTarget.reset();
    window.location.assign('/admin-dashboard.html');
  });
}

// initializeRegistration keeps demo registration local after native form validation.
export function initializeRegistration() {
  document.querySelector('#register form').addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#register-status').textContent = 'Your details passed validation. This demo has not created an account.';
  });
}
