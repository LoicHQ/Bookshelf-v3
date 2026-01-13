/**
 * @agent backend-logic
 * Types pour les réponses API standardisées
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface BookListResponse {
  books: Array<{
    id: string;
    userId: string;
    bookId: string;
    status: string;
    rating?: number | null;
    createdAt: Date;
    updatedAt: Date;
    book: {
      id: string;
      title: string;
      author: string;
      authors: string[];
      coverImage?: string | null;
      thumbnail?: string | null;
    };
  }>;
  total: number;
}
