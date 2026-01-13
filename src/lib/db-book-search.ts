/**
 * @agent backend-logic
 * Recherche de livres dans la base de données locale
 */
import { prisma } from '@/lib/prisma';
import type { BookSearchResult, Book } from '@/types';

/**
 * Recherche un livre dans la BDD locale par ISBN
 */
export async function searchBookInDatabase(
  isbn10: string | null,
  isbn13: string | null
): Promise<BookSearchResult | null> {
  if (!isbn10 && !isbn13) return null;

  const book = await prisma.book.findFirst({
    where: {
      OR: [...(isbn10 ? [{ isbn: isbn10 }] : []), ...(isbn13 ? [{ isbn13: isbn13 }] : [])],
    },
  });

  if (!book) return null;

  // Mapper Book (Prisma) vers BookSearchResult
  return mapBookToSearchResult(book);
}

/**
 * Mapper Book (Prisma) vers BookSearchResult
 */
function mapBookToSearchResult(book: Book): BookSearchResult {
  return {
    id: book.id,
    title: book.title,
    authors: book.authors,
    description: book.description || undefined,
    coverImage: book.coverImage || undefined,
    thumbnail: book.thumbnail || undefined,
    publishedDate: book.publishedDate || undefined,
    publisher: book.publisher || undefined,
    pageCount: book.pageCount || undefined,
    categories: book.categories,
    isbn: book.isbn || undefined,
    isbn13: book.isbn13 || undefined,
  };
}
