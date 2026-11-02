import type { Product, CatalogOperations } from './types.ts';
import { imageTypes, maxImageBytes } from './data.ts';
import { isProductImage } from './logic/isProductImage.ts';
import { escapeHtml } from './logic/escapeHtml.ts';
import { money } from '../../shared/formatting.ts';

// readImageFile validates an uploaded raster image and returns a persistent data URL.
async function readImageFile(file: File) {
  if (!file || !imageTypes.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, or GIF photo.');
  if (file.size === 0 || file.size > maxImageBytes) throw new Error('Choose a photo smaller than 1 MB.');
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
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
  const searchInput = document.querySelector<HTMLInputElement>('#searchInput');
  const categorySelect = document.querySelector<HTMLSelectElement>('#categorySelect');
  const sortSelect = document.querySelector<HTMLSelectElement>('#sortSelect');
  return {
    searchTerm: searchInput.value,
    selectedCategory: categorySelect.value,
    selectedSort: sortSelect.value,
  };
}

// renderCategories fills the category dropdown while keeping the All Categories option.
export function renderCategories(categories: string[]) {
  const categorySelect = document.querySelector<HTMLSelectElement>('#categorySelect');
  const selectedCategory = categorySelect.value;
  categorySelect.innerHTML = '<option value="">All Categories</option>' + categories.map((category) => `
    <option value="${escapeHtml(category)}">${escapeHtml(category)}</option>
  `).join('');
  categorySelect.value = categories.includes(selectedCategory) ? selectedCategory : '';
}

// renderProductCards displays semantic product cards or the empty-results message.
export function renderProductCards(products: Product[]) {
  const productContainer = document.querySelector<HTMLElement>('#products .products');
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
export function bindProductControls(onChange: () => void) {
  const searchInput = document.querySelector<HTMLInputElement>('#searchInput');
  const categorySelect = document.querySelector<HTMLSelectElement>('#categorySelect');
  const sortSelect = document.querySelector<HTMLSelectElement>('#sortSelect');
  searchInput.addEventListener('input', onChange);
  categorySelect.addEventListener('change', onChange);
  sortSelect.addEventListener('change', onChange);
}

// renderCollectionSummary keeps the shop counts in sync with admin catalog changes.
export function renderCollectionSummary(productCount: number, categoryCount: number) {
  const summary = document.querySelector<HTMLElement>('#collection-summary');
  if (summary) summary.textContent = `${productCount} essentials / ${categoryCount} categories`;
}



// renderDashboard updates the dashboard summaries and catalog table without changing saved data.
export function renderDashboard(products: Product[], categories: string[]) {
  document.querySelector<HTMLElement>('#product-count').textContent = products.length as unknown as string;
  document.querySelector<HTMLElement>('#category-count').textContent = categories.length as unknown as string;
  const averagePrice = products.length === 0 ? 0 : products.reduce((total, product) => total + product.price, 0) / products.length;
  document.querySelector<HTMLElement>('#average-price').textContent = money.format(averagePrice);
  document.querySelector<HTMLElement>('#admin-products').innerHTML = products.length === 0
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
export function createProductEditor({ onSave, saveProduct, getProducts, getCategories, photoOptions }: Omit<CatalogOperations, 'deleteProduct'> & { onSave: (product: Product, isEditing: boolean) => void }) {
  const dialog = document.querySelector<HTMLDialogElement>('#product-dialog');
  const form = document.querySelector<HTMLFormElement>('#product-form');
  const nameInput = document.querySelector<HTMLInputElement>('#product-name');
  const categorySelect = document.querySelector<HTMLSelectElement>('#product-category');
  const newCategoryInput = document.querySelector<HTMLInputElement>('#new-category');
  const priceInput = document.querySelector<HTMLInputElement>('#product-price');
  const stockSelect = document.querySelector<HTMLSelectElement>('#product-stock');
  const sourceSelect = document.querySelector<HTMLSelectElement>('#image-source');
  const demoSelect = document.querySelector<HTMLSelectElement>('#product-image');
  const fileInput = document.querySelector<HTMLInputElement>('#product-upload');
  const urlInput = document.querySelector<HTMLInputElement>('#product-image-url');
  const preview = document.querySelector<HTMLImageElement>('#image-preview');
  const message = document.querySelector<HTMLElement>('#editor-status');
  const saveButton = document.querySelector<HTMLButtonElement>('#save-product');
  let editingId: number | null = null;
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
    document.querySelector<HTMLElement>('#image-placeholder').hidden = hasImage;
    if (hasImage) preview.src = source;
    else preview.removeAttribute('src');
  }

  // updateCategory reveals a required name field only when adding a new category.
  function updateCategory() {
    const isNewCategory = categorySelect.value === '__new__';
    document.querySelector<HTMLElement>('#new-category-field').hidden = !isNewCategory;
    newCategoryInput.disabled = !isNewCategory;
    newCategoryInput.required = isNewCategory;
  }

  // updateImageFields enables only the inputs belonging to the chosen photo source.
  function updateImageFields() {
    for (const source of ['upload', 'url', 'demo']) {
      document.querySelector<HTMLElement>(`#image-${source}-field`).hidden = sourceSelect.value !== source;
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
  function open(product: Product | null = null) {
    uploadVersion += 1;
    readingImage = false;
    editingId = product?.id ?? null;
    uploadedImage = '';
    form.reset();
    message.textContent = '';
    categorySelect.innerHTML = '<option value="">Choose a category</option>' + getCategories().map((category) => `<option value="existing:${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('') + '<option value="__new__">+ Add a new category...</option>';
    sourceSelect.value = 'upload';
    document.querySelector<HTMLElement>('#editor-title').textContent = product ? 'Edit product' : 'Add product';
    saveButton.textContent = product ? 'Save changes' : 'Add product';
    if (product) {
      nameInput.value = product.name;
      categorySelect.value = `existing:${product.category}`;
      priceInput.value = product.price as unknown as string;
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
  function submit(event: Event) {
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
    document.querySelector<HTMLElement>('#image-placeholder').hidden = false;
    message.textContent = 'This photo could not be displayed. Check the image URL or choose another photo.';
  });
  document.querySelector<HTMLElement>('#cancel-edit').addEventListener('click', close);
  document.querySelector<HTMLElement>('#close-editor').addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  return { open };
}

// initializeAdmin binds dashboard actions to injected catalog operations.
export function initializeAdmin({ getProducts, getCategories, saveProduct, deleteProduct, photoOptions }: CatalogOperations) {
  let pendingDeleteId: number | null = null;
  const status = document.querySelector<HTMLElement>('#admin-status');
  const deleteDialog = document.querySelector<HTMLDialogElement>('#delete-dialog');
  const editor = createProductEditor({
    saveProduct, getProducts, getCategories, photoOptions,
    onSave(product, isEditing) {
      renderDashboard(getProducts(), getCategories());
      status.textContent = `${product.name} ${isEditing ? 'updated' : 'added'}. Changes saved in this browser.`;
      document.querySelector<HTMLElement>('#add-product').focus();
    },
  });

  // handleProductAction routes row actions to the editor, stock update, or deletion confirmation.
  function handleProductAction(event: Event) {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-action]');
    if (!button) return;
    const product = getProducts().find((item) => item.id === Number(button.dataset.id));
    if (!product) { status.textContent = 'This product no longer exists. Refresh the catalog.'; return; }
    if (button.dataset.action === 'edit') {
      editor.open(product);
    } else if (button.dataset.action === 'delete') {
      pendingDeleteId = product.id;
      document.querySelector<HTMLElement>('#delete-description').textContent = `Delete ${product.name} from this browser's catalog? It will also be removed from the shop and cart.`;
      deleteDialog.showModal();
    } else if (button.dataset.action === 'stock') {
      try {
        const updated = saveProduct({ ...product, inStock: !product.inStock });
        renderDashboard(getProducts(), getCategories());
        status.textContent = `${updated.name} marked ${updated.inStock ? 'in stock' : 'out of stock'}.`;
        document.querySelector<HTMLElement>(`[data-action="stock"][data-id="${product.id}"]`).focus();
      } catch (error) {
        status.textContent = `Could not update availability. ${error.message}`;
      }
    }
  }

  // confirmDelete removes a product only when the confirmation button is submitted.
  function confirmDelete(event: SubmitEvent) {
    event.preventDefault();
    if ((event.submitter as HTMLButtonElement)?.value !== 'delete') {
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
      document.querySelector<HTMLElement>('#catalog-title').focus();
    } catch (error) {
      deleteDialog.close();
      status.textContent = `Could not delete product. ${error.message}`;
    }
  }

  document.querySelector<HTMLElement>('#add-product').addEventListener('click', () => editor.open());
  document.querySelector<HTMLElement>('#admin-products').addEventListener('click', handleProductAction);
  document.querySelector<HTMLFormElement>('#delete-form').addEventListener('submit', confirmDelete);
  deleteDialog.addEventListener('cancel', () => { pendingDeleteId = null; });
  renderDashboard(getProducts(), getCategories());
  return {
    refresh() { renderDashboard(getProducts(), getCategories()); },
    notify(message: string) { status.textContent = message; },
  };

}
