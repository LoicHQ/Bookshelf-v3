/**
 * @agent backend-logic
 * Service de gestion des livres avec logique métier
 */
import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError } from '@/lib/errors';
import type { CreateBookInput, ListBooksQuery } from '@/lib/validation';
import type { BookStatus } from '@/types';

export class BookService {
  /**
   * Récupère les livres d'un utilisateur avec pagination
   */
  static async getUserBooks(userId: string, query: ListBooksQuery) {
    const where = {
      userId,
      ...(query.status && { status: query.status }),
    };

    const [books, total] = await Promise.all([
      prisma.userBook.findMany({
        where,
        select: {
          id: true,
          userId: true,
          bookId: true,
          status: true,
          rating: true,
          createdAt: true,
          updatedAt: true,
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              authors: true,
              coverImage: true,
              thumbnail: true,
              isbn: true,
              isbn13: true,
              publishedDate: true,
              pageCount: true,
              categories: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.userBook.count({ where }),
    ]);

    return {
      books,
      total,
    };
  }

  /**
   * Ajoute un livre à la bibliothèque d'un utilisateur
   * Utilise une transaction pour garantir la cohérence
   */
  static async addBookToLibrary(userId: string, input: CreateBookInput) {
    return prisma.$transaction(async (tx) => {
      // Chercher si le livre existe déjà (par ISBN)
      let book = null;
      if (input.isbn || input.isbn13) {
        book = await tx.book.findFirst({
          where: {
            OR: [
              ...(input.isbn ? [{ isbn: input.isbn }] : []),
              ...(input.isbn13 ? [{ isbn13: input.isbn13 }] : []),
            ],
          },
        });
      }

      // Si le livre n'existe pas, le créer
      if (!book) {
        book = await tx.book.create({
          data: {
            isbn: input.isbn || null,
            isbn13: input.isbn13 || null,
            title: input.title,
            author: input.author || input.authors?.[0] || 'Auteur inconnu',
            authors: input.authors || (input.author ? [input.author] : []),
            description: input.description || null,
            coverImage: input.coverImage || null,
            thumbnail: input.thumbnail || null,
            publishedDate: input.publishedDate || null,
            publisher: input.publisher || null,
            pageCount: input.pageCount || null,
            categories: input.categories || [],
            language: input.language || null,
          },
        });
      }

      // Vérifier si l'utilisateur a déjà ce livre
      const existingUserBook = await tx.userBook.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId: book.id,
          },
        },
      });

      if (existingUserBook) {
        throw new ConflictError('Ce livre est déjà dans votre bibliothèque');
      }

      // Ajouter le livre à la bibliothèque de l'utilisateur
      const userBook = await tx.userBook.create({
        data: {
          userId,
          bookId: book.id,
          status: input.status || 'TO_READ',
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              authors: true,
              coverImage: true,
              thumbnail: true,
              isbn: true,
              isbn13: true,
            },
          },
        },
      });

      return userBook;
    });
  }

  /**
   * Met à jour le statut d'un livre utilisateur
   */
  static async updateBookStatus(
    userId: string,
    userBookId: string,
    status: BookStatus
  ) {
    const userBook = await prisma.userBook.findFirst({
      where: {
        id: userBookId,
        userId,
      },
    });

    if (!userBook) {
      throw new NotFoundError('Livre utilisateur');
    }

    return prisma.userBook.update({
      where: { id: userBookId },
      data: { status },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            authors: true,
            coverImage: true,
            thumbnail: true,
          },
        },
      },
    });
  }

  /**
   * Supprime un livre de la bibliothèque utilisateur
   */
  static async removeBookFromLibrary(userId: string, userBookId: string) {
    const userBook = await prisma.userBook.findFirst({
      where: {
        id: userBookId,
        userId,
      },
    });

    if (!userBook) {
      throw new NotFoundError('Livre utilisateur');
    }

    await prisma.userBook.delete({
      where: { id: userBookId },
    });

    return { success: true };
  }
}
