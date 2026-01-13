/**
 * @agent backend-logic
 * API client pour la recherche de livres via Google Books et Open Library
 */
import type { BookSearchResult, GoogleBooksVolume, OpenLibraryBook } from '@/types';
import { normalizeISBN } from './isbn-utils';
import { searchBookInDatabase } from './db-book-search';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const OPEN_LIBRARY_API = 'https://openlibrary.org';

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
 * Recherche un livre par ISBN avec priorité BDD locale
 */
export async function fetchBookByISBN(isbn: string): Promise<BookSearchResult | null> {
  // 1. Normaliser l'ISBN
  const { isbn10, isbn13, isValid } = normalizeISBN(isbn);

  if (!isValid) {
    throw new Error(`ISBN invalide: "${isbn}". Un ISBN doit contenir 10 ou 13 chiffres.`);
  }

  // 2. Recherche en BDD d'abord
  const dbResult = await searchBookInDatabase(isbn10, isbn13);
  if (dbResult) {
    return dbResult;
  }

  // 3. Essayer Google Books
  const targetISBN = isbn13 || isbn10!;
  try {
    const googleResult = await searchGoogleBooks(`isbn:${targetISBN}`, 1);
    if (googleResult.length > 0) {
      return googleResult[0];
    }
  } catch (error) {
    console.error('Google Books error:', error);
  }

  // 4. Fallback sur Open Library
  try {
    const olResult = await fetchFromOpenLibrary(targetISBN);
    if (olResult) {
      return olResult;
    }
  } catch (error) {
    console.error('Open Library error:', error);
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
    coverImage: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : undefined,
    thumbnail: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
    isbn: (doc.isbn as string[])?.[0],
  }));
}

/**
 * Recherche combinÃ©e Google Books + Open Library
 */
export async function searchBooks(query: string, maxResults = 10): Promise<BookSearchResult[]> {
  // Utiliser Google Books par dÃ©faut (meilleurs rÃ©sultats)
  try {
    const results = await searchGoogleBooks(query, maxResults);
    if (results.length > 0) {
      return results;
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
    imageLinks.extraLarge?.replace('http:', 'https:') ||
    imageLinks.large?.replace('http:', 'https:') ||
    imageLinks.medium?.replace('http:', 'https:') ||
    imageLinks.thumbnail?.replace('http:', 'https:') ||
    imageLinks.smallThumbnail?.replace('http:', 'https:');

  const thumbnail =
    imageLinks.smallThumbnail?.replace('http:', 'https:') ||
    imageLinks.thumbnail?.replace('http:', 'https:');

  return {
    id: volume.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors || [],
    description: volumeInfo.description,
    coverImage: coverImage || undefined,
    thumbnail: thumbnail || undefined,
    publishedDate: volumeInfo.publishedDate,
    publisher: volumeInfo.publisher,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories,
    isbn: isbn10,
    isbn13: isbn13,
  };
}

function mapOpenLibraryToResult(book: OpenLibraryBook, isbn: string): BookSearchResult {
  const description =
    typeof book.description === 'string' ? book.description : book.description?.value;

  const coverId = book.covers?.[0];

  // Extraire publisher (peut être string ou objet avec name)
  const publisher = book.publishers?.[0];
  const publisherString =
    typeof publisher === 'string' ? publisher : (publisher as { name?: string })?.name || undefined;

  // Extraire categories (peut être string[] ou objet[] avec name)
  const categories =
    book.subjects
      ?.slice(0, 5)
      .map((subj) =>
        typeof subj === 'string'
          ? subj
          : (subj as { name?: string })?.name || (subj as { value?: string })?.value || String(subj)
      ) || [];

  return {
    id: `ol-${isbn}`,
    title: book.title,
    authors: book.authors?.map((a) => a.name) || [],
    description,
    coverImage: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : undefined,
    thumbnail: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined,
    publishedDate: book.publish_date,
    publisher: publisherString,
    pageCount: book.number_of_pages,
    categories,
    isbn: book.isbn_10?.[0] || isbn,
    isbn13: book.isbn_13?.[0],
  };
}
