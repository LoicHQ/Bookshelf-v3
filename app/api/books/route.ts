import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/books - Récupérer les livres de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = {
      userId: session.user.id,
      ...(status && { status: status as never }),
    };

    const [books, total] = await Promise.all([
      prisma.userBook.findMany({
        where,
        include: {
          book: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userBook.count({ where }),
    ]);

    return NextResponse.json({ books, total });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des livres' },
      { status: 500 }
    );
  }
}

// POST /api/books - Ajouter un livre à la bibliothèque
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      isbn,
      isbn13,
      title,
      author,
      authors,
      description,
      coverImage,
      thumbnail,
      publishedDate,
      publisher,
      pageCount,
      categories,
      language,
      status = 'TO_READ',
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    // Chercher si le livre existe déjà (par ISBN ou titre+auteur)
    let book = null;
    if (isbn || isbn13) {
      book = await prisma.book.findFirst({
        where: {
          OR: [...(isbn ? [{ isbn }] : []), ...(isbn13 ? [{ isbn13 }] : [])],
        },
      });
    }

    // Si le livre n'existe pas, le créer
    if (!book) {
      book = await prisma.book.create({
        data: {
          isbn,
          isbn13,
          title,
          author: author || authors?.[0] || 'Auteur inconnu',
          authors: authors || (author ? [author] : []),
          description,
          coverImage,
          thumbnail,
          publishedDate,
          publisher,
          pageCount,
          categories: categories || [],
          language,
        },
      });
    }

    // Vérifier si l'utilisateur a déjà ce livre
    const existingUserBook = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: book.id,
        },
      },
    });

    if (existingUserBook) {
      return NextResponse.json(
        { error: 'Ce livre est déjà dans votre bibliothèque', userBook: existingUserBook },
        { status: 409 }
      );
    }

    // Ajouter le livre à la bibliothèque de l'utilisateur
    const userBook = await prisma.userBook.create({
      data: {
        userId: session.user.id,
        bookId: book.id,
        status,
      },
      include: {
        book: true,
      },
    });

    return NextResponse.json({ userBook }, { status: 201 });
  } catch (error) {
    console.error('Error adding book:', error);
    return NextResponse.json({ error: "Erreur lors de l'ajout du livre" }, { status: 500 });
  }
}
