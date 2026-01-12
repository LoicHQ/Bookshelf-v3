import type { BookSearchResult, GoogleBooksVolume, OpenLibraryBook } from '@/types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const OPEN_LIBRARY_API = 'https://openlibrary.org';

/**
 * Normalise et valide un ISBN
 * - Retire les espaces et tirets
 * - Corrige les erreurs courantes (ISBN trop long se terminant par 0)
 * - Valide la longueur (ISBN-10 = 10, ISBN-13 = 13)
 */
function normalizeISBN(isbn: string): string | null {
  // Nettoyer l'ISBN (retirer les tirets et espaces)
  let cleanISBN = isbn.replace(/[-\s]/g, '');

  // Si l'ISBN a 14 chiffres et se termine par 0, retirer le dernier 0
  // (erreur courante de saisie)
  if (cleanISBN.length === 14 && cleanISBN.endsWith('0')) {
    cleanISBN = cleanISBN.slice(0, 13);
  }

  // Valider la longueur (ISBN-10 ou ISBN-13)
  if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
    return null;
  }

  // Vérifier que ce sont uniquement des chiffres (ISBN-13 peut commencer par 978 ou 979)
  if (!/^\d+$/.test(cleanISBN)) {
    return null;
  }

  return cleanISBN;
}

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
 * Recherche un livre par ISBN via Google Books
 */
export async function fetchBookByISBN(isbn: string): Promise<BookSearchResult | null> {
  // Normaliser l'ISBN
  const normalizedISBN = normalizeISBN(isbn);
  
  if (!normalizedISBN) {
    throw new Error(`ISBN invalide: "${isbn}". Un ISBN doit contenir 10 ou 13 chiffres.`);
  }

  // Essayer Google Books d'abord
  try {
    const googleResult = await searchGoogleBooks(`isbn:${normalizedISBN}`, 1);
    if (googleResult.length > 0) {
      return googleResult[0];
    }
  } catch (error) {
    console.error('Google Books error:', error);
  }

  // Fallback sur Open Library
  try {
    const olResult = await fetchFromOpenLibrary(normalizedISBN);
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

  return {
    id: volume.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors || [],
    description: volumeInfo.description,
    coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
    thumbnail: volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:'),
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

  return {
    id: `ol-${isbn}`,
    title: book.title,
    authors: book.authors?.map((a) => a.name) || [],
    description,
    coverImage: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : undefined,
    thumbnail: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined,
    publishedDate: book.publish_date,
    publisher: book.publishers?.[0],
    pageCount: book.number_of_pages,
    categories: book.subjects?.slice(0, 5),
    isbn: book.isbn_10?.[0] || isbn,
    isbn13: book.isbn_13?.[0],
  };
}
