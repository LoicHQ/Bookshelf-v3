import type { BookSearchResult, GoogleBooksVolume, OpenLibraryBook } from '@/types';
import { enhanceGoogleBooksImage, getOpenLibraryImageUrl, getBestImageUrl } from './image-utils';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const OPEN_LIBRARY_API = 'https://openlibrary.org';
const ISBNDB_API = 'https://api.isbndb.com';

/**
 * Recherche des livres via Google Books API
 */
export async function searchGoogleBooks(
  query: string,
  maxResults = 10
): Promise<BookSearchResult[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = new URL(GOOGLE_BOOKS_API);
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', maxResults.toString());
  if (apiKey) {
    url.searchParams.set('key', apiKey);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.items || []).map(mapGoogleBookToResult);
}

/**
 * Recherche un livre par ISBN avec fallback multi-sources
 * Priorité : Google Books > Open Library > ISBNdb
 */
export async function fetchBookByISBN(isbn: string): Promise<BookSearchResult | null> {
  // Nettoyer l'ISBN (retirer les tirets)
  const cleanISBN = isbn.replace(/[-\s]/g, '');

  // 1. Essayer Google Books d'abord (meilleure qualité d'images)
  try {
    const googleResult = await searchGoogleBooks(`isbn:${cleanISBN}`, 1);
    if (googleResult.length > 0) {
      const result = googleResult[0];
      // Améliorer l'image Google Books pour haute qualité
      if (result.coverImage) {
        result.coverImage = enhanceGoogleBooksImage(result.coverImage, 2);
      }
      result.coverSource = 'google';
      return result;
    }
  } catch (error) {
    console.error('Google Books error:', error);
  }

  // 2. Fallback sur Open Library
  try {
    const olResult = await fetchFromOpenLibrary(cleanISBN);
    if (olResult) {
      olResult.coverSource = 'openlibrary';
      return olResult;
    }
  } catch (error) {
    console.error('Open Library error:', error);
  }

  // 3. Fallback sur ISBNdb (si configuré)
  if (process.env.ISBNDB_API_KEY) {
    try {
      const isbndbResult = await fetchFromISBNdb(cleanISBN);
      if (isbndbResult) {
        isbndbResult.coverSource = 'isbndb';
        return isbndbResult;
      }
    } catch (error) {
      console.error('ISBNdb error:', error);
    }
  }

  return null;
}

/**
 * Recherche via Open Library API
 */
async function fetchFromOpenLibrary(isbn: string): Promise<BookSearchResult | null> {
  const url = `${OPEN_LIBRARY_API}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`);
  }

  const data = await response.json();
  const bookData = data[`ISBN:${isbn}`] as OpenLibraryBook | undefined;

  if (!bookData) {
    return null;
  }

  return mapOpenLibraryToResult(bookData, isbn);
}

/**
 * Recherche via ISBNdb API (optionnel, nécessite clé API)
 */
async function fetchFromISBNdb(isbn: string): Promise<BookSearchResult | null> {
  const apiKey = process.env.ISBNDB_API_KEY;
  if (!apiKey) {
    return null;
  }

  const url = `${ISBNDB_API}/book/${isbn}`;
  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`ISBNdb API error: ${response.status}`);
  }

  const data = await response.json();
  const book = data.book;

  if (!book) {
    return null;
  }

  return {
    id: `isbndb-${isbn}`,
    title: book.title,
    authors: book.authors || [],
    description: book.synopsis,
    coverImage: book.image,
    thumbnail: book.image,
    publishedDate: book.date_published,
    publisher: book.publisher,
    pageCount: book.pages,
    isbn: book.isbn13 || book.isbn,
    isbn13: book.isbn13 || book.isbn,
  };
}

/**
 * Recherche de livres par titre/auteur via Open Library
 */
export async function searchOpenLibrary(query: string, limit = 10): Promise<BookSearchResult[]> {
  const url = new URL(`${OPEN_LIBRARY_API}/search.json`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Open Library search error: ${response.status}`);
  }

  const data = await response.json();
  return (data.docs || []).map((doc: Record<string, unknown>) => ({
    id: doc.key as string,
    title: doc.title as string,
    authors: (doc.author_name as string[]) || [],
    publishedDate: doc.first_publish_year?.toString(),
    coverImage: doc.cover_i ? getOpenLibraryImageUrl(doc.cover_i as number, 'L') : undefined,
    thumbnail: doc.cover_i ? getOpenLibraryImageUrl(doc.cover_i as number, 'M') : undefined,
    coverSource: 'openlibrary',
    isbn: (doc.isbn as string[])?.[0],
  }));
}

/**
 * Recherche combinée Google Books + Open Library
 */
export async function searchBooks(query: string, maxResults = 10): Promise<BookSearchResult[]> {
  // Utiliser Google Books par défaut (meilleurs résultats)
  try {
    const results = await searchGoogleBooks(query, maxResults);
    if (results.length > 0) {
      // Améliorer les images pour haute qualité
      return results.map((result) => {
        if (result.coverImage) {
          result.coverImage = enhanceGoogleBooksImage(result.coverImage, 2);
        }
        result.coverSource = 'google';
        return result;
      });
    }
  } catch (error) {
    console.error('Google Books search failed:', error);
  }

  // Fallback sur Open Library
  return searchOpenLibrary(query, maxResults);
}

// ============================================================================
// MAPPERS
// ============================================================================

function mapGoogleBookToResult(volume: GoogleBooksVolume): BookSearchResult {
  const { volumeInfo } = volume;
  const identifiers = volumeInfo.industryIdentifiers || [];

  const isbn10 = identifiers.find((id) => id.type === 'ISBN_10')?.identifier;
  const isbn13 = identifiers.find((id) => id.type === 'ISBN_13')?.identifier;

  // Utiliser la meilleure qualité d'image disponible
  const imageLinks = volumeInfo.imageLinks || {};
  const coverImage =
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail;

  return {
    id: volume.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors || [],
    description: volumeInfo.description,
    coverImage: coverImage?.replace('http:', 'https:'),
    thumbnail: imageLinks.smallThumbnail?.replace('http:', 'https:'),
    publishedDate: volumeInfo.publishedDate,
    publisher: volumeInfo.publisher,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories,
    isbn: isbn10,
    isbn13: isbn13,
    coverSource: 'google',
  };
}

function mapOpenLibraryToResult(book: OpenLibraryBook, isbn: string): BookSearchResult {
  const description =
    typeof book.description === 'string' ? book.description : book.description?.value;

  const coverId = book.covers?.[0];

  return {
    id: `ol-${isbn}`,
    title: book.title,
    authors: book.authors?.map((a) => a.name) || [],
    description,
    coverImage: coverId ? getOpenLibraryImageUrl(coverId, 'L') : undefined,
    thumbnail: coverId ? getOpenLibraryImageUrl(coverId, 'M') : undefined,
    publishedDate: book.publish_date,
    publisher: book.publishers?.[0],
    pageCount: book.number_of_pages,
    categories: book.subjects?.slice(0, 5),
    isbn: book.isbn_10?.[0] || isbn,
    isbn13: book.isbn_13?.[0],
    coverSource: 'openlibrary',
  };
}
