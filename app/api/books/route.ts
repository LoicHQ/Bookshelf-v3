/**
 * @agent backend-logic
 * API Routes pour la gestion des livres utilisateur
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { BookService } from '@/services/book.service';
import { UserBookImageService } from '@/services/user-book-image.service';
import { listBooksQuerySchema, createBookSchema } from '@/lib/validation';
import { errorToResponse, UnauthorizedError, ValidationError } from '@/lib/errors';

/**
 * GET /api/books - Récupérer les livres de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = listBooksQuerySchema.parse(query);
    const result = await BookService.getUserBooks(session.user.id, validatedQuery);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching books:', error);
    const errorResponse = errorToResponse(error);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}

/**
 * POST /api/books - Ajouter un livre à la bibliothèque
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/books/route.ts:41',
        message: 'POST /api/books received body',
        data: {
          coverImage: body.coverImage,
          thumbnail: body.thumbnail,
          isbn: body.isbn,
          isbn13: body.isbn13,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    // Nettoyer pageCount : convertir 0, null, ou valeurs invalides en undefined
    // Nettoyer publisher et categories : extraire les strings des objets si nécessaire
    const cleanedBody = {
      ...body,
      pageCount: body.pageCount && body.pageCount > 0 ? body.pageCount : undefined,
      publisher:
        typeof body.publisher === 'string'
          ? body.publisher
          : body.publisher?.name || body.publisher?.[0]?.name || body.publisher?.[0] || undefined,
      categories: Array.isArray(body.categories)
        ? body.categories.map((cat: unknown) =>
            typeof cat === 'string'
              ? cat
              : (cat as { name?: string })?.name ||
                (cat as { value?: string })?.value ||
                String(cat)
          )
        : undefined,
    };
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/books/route.ts:57',
        message: 'POST /api/books cleanedBody',
        data: {
          coverImage: cleanedBody.coverImage,
          thumbnail: cleanedBody.thumbnail,
          isbn: cleanedBody.isbn,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    const validatedData = createBookSchema.parse(cleanedBody);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/books/route.ts:68',
        message: 'POST /api/books validatedData',
        data: {
          coverImage: validatedData.coverImage,
          thumbnail: validatedData.thumbnail,
          isbn: validatedData.isbn,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    const userBook = await BookService.addBookToLibrary(session.user.id, validatedData);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/books/route.ts:70',
        message: 'POST /api/books userBook returned',
        data: {
          userBookId: userBook.id,
          coverImage: userBook.book?.coverImage,
          thumbnail: userBook.book?.thumbnail,
          bookId: userBook.bookId,
          isExisting: !!userBook.userBookImages,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'H2',
      }),
    }).catch(() => {});
    // #endregion

    // Si une image utilisateur a été sélectionnée, l'ajouter à UserBookImage
    if (body.selectedImageSource === 'user' && body.selectedUserImageUrl) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'api/books/route.ts:82',
          message: 'Adding user book image',
          data: { userBookId: userBook.id, imageUrl: body.selectedUserImageUrl },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H3',
        }),
      }).catch(() => {});
      // #endregion
      try {
        const addedImage = await UserBookImageService.addUserBookImage(
          session.user.id,
          userBook.id,
          body.selectedUserImageUrl
        );
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'api/books/route.ts:88',
            message: 'User book image added successfully',
            data: {
              imageId: addedImage.id,
              userBookId: userBook.id,
              imageUrl: addedImage.imageUrl,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'H3',
          }),
        }).catch(() => {});
        // #endregion
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'api/books/route.ts:92',
            message: 'Error adding user book image',
            data: { error: String(error), userBookId: userBook.id },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'H3',
          }),
        }).catch(() => {});
        // #endregion
        console.error('Error adding user book image:', error);
        // On continue même si l'ajout de l'image échoue
      }
    }

    return NextResponse.json({ userBook }, { status: 201 });
  } catch (error) {
    console.error('Error adding book:', error);
    const errorResponse = errorToResponse(error);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}
