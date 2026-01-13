/**
 * @agent backend-logic
 * API Routes pour la gestion des livres utilisateur
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { BookService } from '@/services/book.service';
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
    const validatedData = createBookSchema.parse(body);
    
    const userBook = await BookService.addBookToLibrary(session.user.id, validatedData);

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
