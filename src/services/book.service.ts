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
          userBookImages: {
            select: {
              id: true,
              imageUrl: true,
              source: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 3,
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

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'book.service.ts:79',
          message: 'addBookToLibrary before create/update',
          data: {
            bookExists: !!book,
            bookCoverImage: book?.coverImage,
            inputCoverImage: input.coverImage,
            inputThumbnail: input.thumbnail,
            isbn: input.isbn,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'C',
        }),
      }).catch(() => {});
      // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'book.service.ts:97',
            message: 'Book created',
            data: { bookId: book.id, coverImage: book.coverImage, thumbnail: book.thumbnail },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
          }),
        }).catch(() => {});
        // #endregion
      } else {
        // Mettre à jour le livre existant si de nouvelles données sont fournies
        const updateData: any = {};
        if (input.coverImage !== undefined) updateData.coverImage = input.coverImage || null;
        if (input.thumbnail !== undefined) updateData.thumbnail = input.thumbnail || null;
        if (input.description !== undefined && !book.description)
          updateData.description = input.description || null;
        if (input.publishedDate !== undefined && !book.publishedDate)
          updateData.publishedDate = input.publishedDate || null;
        if (input.publisher !== undefined && !book.publisher)
          updateData.publisher = input.publisher || null;
        if (input.pageCount !== undefined && !book.pageCount)
          updateData.pageCount = input.pageCount || null;

        const needsUpdate = Object.keys(updateData).length > 0;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'book.service.ts:108',
            message: 'Book exists, checking update',
            data: {
              needsUpdate,
              updateData,
              bookCoverImage: book.coverImage,
              inputCoverImage: input.coverImage,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
          }),
        }).catch(() => {});
        // #endregion
        if (needsUpdate) {
          book = await tx.book.update({
            where: { id: book.id },
            data: updateData,
          });
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6333b291-2b13-42e9-8b1c-448e178a5664', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'book.service.ts:119',
              message: 'Book updated',
              data: { bookId: book.id, coverImage: book.coverImage, thumbnail: book.thumbnail },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'C',
            }),
          }).catch(() => {});
          // #endregion
        }
      }

      // Recharger le livre pour s'assurer d'avoir les dernières données
      book = await tx.book.findUnique({
        where: { id: book.id },
      });

      // Vérifier si l'utilisateur a déjà ce livre
      const existingUserBook = await tx.userBook.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId: book.id,
          },
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
          userBookImages: {
            select: {
              id: true,
              imageUrl: true,
              source: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 3,
          },
        },
      });

      if (existingUserBook) {
        // Le livre a été mis à jour, retourner le UserBook existant avec les nouvelles données
        return existingUserBook;
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
          userBookImages: {
            select: {
              id: true,
              imageUrl: true,
              source: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 3,
          },
        },
      });

      return userBook;
    });
  }

  /**
   * Récupère un livre utilisateur par son ID
   */
  static async getUserBookById(userId: string, userBookId: string) {
    const userBook = await prisma.userBook.findFirst({
      where: {
        id: userBookId,
        userId,
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
            publishedDate: true,
            pageCount: true,
            categories: true,
            description: true,
            publisher: true,
            language: true,
          },
        },
        userBookImages: {
          select: {
            id: true,
            imageUrl: true,
            source: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3,
        },
      },
    });

    if (!userBook) {
      throw new NotFoundError('Livre utilisateur');
    }

    return userBook;
  }

  /**
   * Met à jour le statut d'un livre utilisateur
   */
  static async updateBookStatus(userId: string, userBookId: string, status: BookStatus) {
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
        userBookImages: {
          select: {
            id: true,
            imageUrl: true,
            source: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3,
        },
      },
    });
  }

  /**
   * Met à jour un livre utilisateur (statut, rating, favorite, currentPage, etc.)
   */
  static async updateUserBook(
    userId: string,
    userBookId: string,
    data: {
      status?: BookStatus;
      rating?: number | null;
      favorite?: boolean;
      currentPage?: number | null;
      notes?: string | null;
      review?: string | null;
    }
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
      data,
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
            publishedDate: true,
            pageCount: true,
            categories: true,
            description: true,
            publisher: true,
            language: true,
          },
        },
        userBookImages: {
          select: {
            id: true,
            imageUrl: true,
            source: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3,
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
