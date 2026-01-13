export type BookStatus = 'TO_READ' | 'READING' | 'COMPLETED' | 'ABANDONED' | 'ON_HOLD';

export interface Book {
  id: string;
  isbn?: string | null;
  isbn13?: string | null;
  title: string;
  author: string;
  authors: string[];
  description?: string | null;
  coverImage?: string | null;
  thumbnail?: string | null;
  coverSource?: string | null;
  publishedDate?: string | null;
  publisher?: string | null;
  pageCount?: number | null;
  categories: string[];
  language?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  status: BookStatus;
  rating?: number | null; // 1-5
  notes?: string | null;
  review?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  book?: Book;
}

export interface BookSearchResult {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  coverImage?: string;
  thumbnail?: string;
  coverSource?: string;
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  categories?: string[];
  isbn?: string;
  isbn13?: string;
}

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    language?: string;
  };
}

export interface OpenLibraryBook {
  title: string;
  authors?: Array<{ name: string }>;
  description?: string | { value: string };
  publish_date?: string;
  publishers?: string[];
  number_of_pages?: number;
  subjects?: string[];
  covers?: number[];
  isbn_10?: string[];
  isbn_13?: string[];
}
