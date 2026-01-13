/**
 * @agent backend-logic
 * API Routes pour la gestion d'un livre utilisateur spécifique
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { BookService } from '@/services/book.service';
import { errorToResponse, UnauthorizedError, ValidationError } from '@/lib/errors';
import { z } from 'zod';
import type { BookStatus } from '@/types';

/**
 * Schéma pour la mise à jour d'un livre utilisateur
 */
const updateUserBookSchema = z.object({
  status: z.enum(['TO_READ', 'READING', 'COMPLETED', 'ABANDONED', 'ON_HOLD']).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  favorite: z.boolean().optional(),
  currentPage: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().nullable().optional(),
  review: z.string().nullable().optional(),
});

/**
 * GET /api/books/[id] - Récupérer un livre utilisateur spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const userBook = await BookService.getUserBookById(session.user.id, resolvedParams.id);

    return NextResponse.json(userBook);
  } catch (error) {
    console.error('Error fetching book:', error);
    const errorResponse = errorToResponse(error);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}

/**
 * PATCH /api/books/[id] - Mettre à jour un livre utilisateur
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = updateUserBookSchema.parse(body);

    const userBook = await BookService.updateUserBook(
      session.user.id,
      resolvedParams.id,
      validatedData
    );

    return NextResponse.json(userBook);
  } catch (error) {
    console.error('Error updating book:', error);
    const errorResponse = errorToResponse(error);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}

/**
 * DELETE /api/books/[id] - Supprimer un livre de la bibliothèque utilisateur
 * (sans supprimer le livre de la base de données)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // #region agent log
    const resolvedParams = await Promise.resolve(params);
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/books/[id]/route.ts:91',
        message: 'DELETE handler called',
        data: { paramsId: resolvedParams.id, paramsType: typeof params },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion

    const session = await auth();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/books/[id]/route.ts:95',
        message: 'After auth check',
        data: { hasSession: !!session, hasUserId: !!session?.user?.id },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion

    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/books/[id]/route.ts:101',
        message: 'Before removeBookFromLibrary',
        data: { userId: session.user.id, userBookId: resolvedParams.id },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion

    await BookService.removeBookFromLibrary(session.user.id, resolvedParams.id);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/books/[id]/route.ts:105',
        message: 'After removeBookFromLibrary',
        data: { userId: session.user.id, userBookId: resolvedParams.id },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json({ success: true });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/books/[id]/route.ts:110',
        message: 'Exception in DELETE handler',
        data: {
          error: String(error),
          errorName: error instanceof Error ? error.name : 'unknown',
          errorMessage: error instanceof Error ? error.message : 'unknown',
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    console.error('Error deleting book:', error);
    const errorResponse = errorToResponse(error);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}
