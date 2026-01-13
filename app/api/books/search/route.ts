/**
 * @agent backend-logic
 * API Route pour la recherche de livres via Google Books et Open Library
 */
import { NextRequest, NextResponse } from 'next/server';
import { searchBooks, fetchBookByISBN } from '@/lib/books-api';
import { searchBooksQuerySchema } from '@/lib/validation';
import { errorToResponse, ValidationError } from '@/lib/errors';

/**
 * GET /api/books/search?q=xxx ou ?isbn=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = searchBooksQuerySchema.parse(query);

    let results;

    if (validatedQuery.isbn) {
      // Recherche par ISBN
      try {
        const book = await fetchBookByISBN(validatedQuery.isbn);
        results = book ? [book] : [];
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erreur lors de la recherche par ISBN';
        throw new ValidationError(errorMessage);
      }
    } else if (validatedQuery.q) {
      // Recherche par titre/auteur
      results = await searchBooks(validatedQuery.q, validatedQuery.limit);
    } else {
      throw new ValidationError('Paramètre q ou isbn requis');
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching books:', error);
    const errorResponse = errorToResponse(error);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}
