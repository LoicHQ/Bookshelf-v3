/**
 * @agent backend-logic
 * API Route pour l'agrégation de métadonnées et couvertures de livres
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { aggregateBookData } from '@/lib/book-aggregator';
import { errorToResponse, ValidationError } from '@/lib/errors';
import { UserBookImageService } from '@/services/user-book-image.service';
import { prisma } from '@/lib/prisma';

const SOURCE_LABELS: Record<string, string> = {
  openlibrary: 'Open Library',
  librarything: 'LibraryThing',
  google: 'Google Books',
  isbndb: 'ISBNdb',
  database: 'Ma bibliothèque',
  user: 'Ma photo',
  babelio: 'Babelio',
  archive: 'Archive.org',
  'openlibrary-search': 'Open Library (recherche)',
};

/**
 * GET /api/books/aggregate?isbn=xxx&traceCover=true
 * Retourne un AggregatedBook avec métadonnées et options de couvertures
 * Si traceCover=true, retourne aussi des informations détaillées sur la provenance de chaque couverture
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get('isbn');
    const traceCover = searchParams.get('traceCover') === 'true';

    if (!isbn) {
      throw new ValidationError('Paramètre isbn requis');
    }

    const aggregatedBook = await aggregateBookData(isbn);

    if (!aggregatedBook) {
      return NextResponse.json({ error: 'Livre non trouvé', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Si l'utilisateur est connecté, charger les images existantes pour ce livre
    // Les images sont liées à un UserBook spécifique et sont supprimées si le livre est supprimé
    let existingUserBookImages: any[] = [];
    if (session?.user?.id) {
      try {
        // Chercher le livre par ISBN
        const book = await prisma.book.findFirst({
          where: {
            OR: [
              { isbn: aggregatedBook.isbn || undefined },
              { isbn13: aggregatedBook.isbn13 || undefined },
            ].filter(Boolean),
          },
        });

        if (book) {
          // Chercher le UserBook de l'utilisateur pour ce livre
          const userBook = await prisma.userBook.findFirst({
            where: {
              userId: session.user.id,
              bookId: book.id,
            },
          });

          if (userBook) {
            // Charger les images existantes pour ce UserBook
            existingUserBookImages = await UserBookImageService.getUserBookImages(userBook.id);
          }
          // Si le livre n'est plus dans la bibliothèque, les images ont été supprimées (Cascade)
        }
      } catch (error) {
        console.error('Error loading existing user book images:', error);
        // On continue même si le chargement échoue
      }
    }

    // Si traceCover est activé, ajouter des informations détaillées sur chaque couverture
    if (traceCover && aggregatedBook.coverOptions) {
      const coversWithTrace = await Promise.all(
        aggregatedBook.coverOptions.map(async (cover) => {
          // Vérifier si l'image est accessible
          let accessible = false;
          let statusCode = 0;
          let contentType = '';
          let size = 0;

          try {
            const headResponse = await fetch(cover.url, { method: 'HEAD' });
            accessible = headResponse.ok;
            statusCode = headResponse.status;
            contentType = headResponse.headers.get('content-type') || '';
            size = parseInt(headResponse.headers.get('content-length') || '0', 10);
          } catch (error) {
            // Ignorer les erreurs CORS ou autres
          }

          return {
            ...cover,
            trace: {
              accessible,
              statusCode,
              contentType,
              size,
              sourceLabel: SOURCE_LABELS[cover.source] || cover.source,
              fetchMethod: cover.fetchMethod || 'unknown',
              quality: cover.quality,
            },
          };
        })
      );

      return NextResponse.json({
        book: {
          ...aggregatedBook,
          coverOptions: coversWithTrace,
          existingUserBookImages: existingUserBookImages.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            source: img.source,
            createdAt: img.createdAt,
          })),
        },
      });
    }

    return NextResponse.json({
      book: {
        ...aggregatedBook,
        existingUserBookImages: existingUserBookImages.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          source: img.source,
          createdAt: img.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error aggregating book data:', error);
    const errorResponse = errorToResponse(error);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}
