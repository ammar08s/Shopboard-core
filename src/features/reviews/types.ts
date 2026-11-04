export interface Rating { productId: number; score: number }
export interface ProductComment { id: string; productId: number; name: string; body: string; createdAt: string }
export interface Reviews { ratings: Rating[]; comments: ProductComment[] }
export interface ReviewOperations {
  getSnapshot: () => Reviews;
  refresh: () => void;
  rate: (productId: number, score: number) => void;
  addComment: (productId: number, name: string, body: string) => void;
}
