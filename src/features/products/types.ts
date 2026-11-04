import type { Notify } from '../notifications/types.ts';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  inStock: boolean;
  description?: string;
}

export type ProductValues = Omit<Product, 'id'> & { id?: number };

export interface ProductSelections {
  searchTerm: string;
  selectedCategory: string;
  selectedSort: string;
}

export interface CatalogOperations {
  getProducts: () => Product[];
  getCategories: () => string[];
  saveProduct: (values: ProductValues, id?: number) => Product;
  deleteProduct: (id: number) => void;
  photoOptions: Product[];
  notify?: Notify;
}
