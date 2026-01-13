import { NextRequest, NextResponse } from 'next/server';
import { searchBooks, fetchBookByISBN } from '@/lib/books-api';

// GET /api/books/search?q=xxx ou ?isbn=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const isbn = searchParams.get('isbn');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query && !isbn) {
      return NextResponse.json({ error: 'Paramètre q ou isbn requis' }, { status: 400 });
    }

    let results;

    if (isbn) {
      // Recherche par ISBN
      try {
        const book = await fetchBookByISBN(isbn);
        results = book ? [book] : [];
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la recherche par ISBN';
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
    } else if (query) {
      // Recherche par titre/auteur
      results = await searchBooks(query, limit);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
}
