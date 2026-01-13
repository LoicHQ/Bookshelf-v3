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
  currentPage?: number | null;
  isWishlist: boolean;
  createdAt: Date;
  updatedAt: Date;
  book?: Book;
}

export type NoteType = 'NOTE' | 'QUOTE' | 'HIGHLIGHT';

export interface BookNote {
  id: string;
  userBookId: string;
  content: string;
  page?: number | null;
  type: NoteType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingGoal {
  id: string;
  userId: string;
  year: number;
  target: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingSession {
  id: string;
  userBookId: string;
  pagesRead: number;
  duration?: number | null;
  date: Date;
  createdAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  emoji?: string | null;
  color?: string | null;
  userId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookSearchResult {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  coverImage?: string;
  thumbnail?: string;
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
