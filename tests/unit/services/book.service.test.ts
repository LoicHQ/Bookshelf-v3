/**
 * @agent tests
 * Tests unitaires pour le service de gestion des livres
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookService } from '@/services/book.service';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userBook: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    book: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('BookService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserBooks', () => {
    it('should return user books with pagination', async () => {
      const mockBooks = [
        {
          id: '1',
          userId: 'user-1',
          bookId: 'book-1',
          status: 'TO_READ',
          rating: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          book: {
            id: 'book-1',
            title: 'Test Book',
            author: 'Test Author',
            authors: ['Test Author'],
            coverImage: null,
            thumbnail: null,
            isbn: '1234567890',
            isbn13: '9781234567890',
            publishedDate: '2020',
            pageCount: 100,
            categories: ['Fiction'],
          },
        },
      ];

      vi.mocked(prisma.userBook.findMany).mockResolvedValue(mockBooks as never);
      vi.mocked(prisma.userBook.count).mockResolvedValue(1);

      const result = await BookService.getUserBooks('user-1', {
        limit: 50,
        offset: 0,
      });

      expect(result.books).toEqual(mockBooks);
      expect(result.total).toBe(1);
      expect(prisma.userBook.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: expect.any(Object),
        orderBy: { updatedAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should filter by status when provided', async () => {
      vi.mocked(prisma.userBook.findMany).mockResolvedValue([]);
      vi.mocked(prisma.userBook.count).mockResolvedValue(0);

      await BookService.getUserBooks('user-1', {
        status: 'READING',
        limit: 50,
        offset: 0,
      });

      expect(prisma.userBook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', status: 'READING' },
        })
      );
    });
  });

  describe('addBookToLibrary', () => {
    it('should create book and userBook in transaction', async () => {
      const mockBook = {
        id: 'book-1',
        isbn: '1234567890',
        title: 'New Book',
        author: 'Author',
        authors: ['Author'],
      };

      const mockUserBook = {
        id: 'userbook-1',
        userId: 'user-1',
        bookId: 'book-1',
        status: 'TO_READ',
        book: mockBook,
      };

      const mockTransaction = vi.fn(async (callback) => {
        const tx = {
          book: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue(mockBook),
          },
          userBook: {
            findUnique: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue(mockUserBook),
          },
        };
        return callback(tx);
      });

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await BookService.addBookToLibrary('user-1', {
        title: 'New Book',
        author: 'Author',
      });

      expect(result).toEqual(mockUserBook);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should throw ConflictError if book already in library', async () => {
      const mockBook = { id: 'book-1' };
      const mockExistingUserBook = { id: 'userbook-1' };

      const mockTransaction = vi.fn(async (callback) => {
        const tx = {
          book: {
            findFirst: vi.fn().mockResolvedValue(mockBook),
          },
          userBook: {
            findUnique: vi.fn().mockResolvedValue(mockExistingUserBook),
          },
        };
        return callback(tx);
      });

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      await expect(
        BookService.addBookToLibrary('user-1', {
          title: 'Existing Book',
          isbn: '1234567890',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('updateBookStatus', () => {
    it('should update book status', async () => {
      const mockUserBook = {
        id: 'userbook-1',
        userId: 'user-1',
        bookId: 'book-1',
        status: 'READING',
      };

      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(mockUserBook as never);
      vi.mocked(prisma.userBook.update).mockResolvedValue({
        ...mockUserBook,
        status: 'COMPLETED',
        book: { id: 'book-1', title: 'Test' },
      } as never);

      const result = await BookService.updateBookStatus('user-1', 'userbook-1', 'COMPLETED');

      expect(result.status).toBe('COMPLETED');
      expect(prisma.userBook.update).toHaveBeenCalled();
    });

    it('should throw NotFoundError if userBook not found', async () => {
      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(null);

      await expect(
        BookService.updateBookStatus('user-1', 'userbook-1', 'COMPLETED')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('removeBookFromLibrary', () => {
    it('should delete userBook', async () => {
      const mockUserBook = {
        id: 'userbook-1',
        userId: 'user-1',
        bookId: 'book-1',
      };

      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(mockUserBook as never);
      vi.mocked(prisma.userBook.delete).mockResolvedValue(mockUserBook as never);

      const result = await BookService.removeBookFromLibrary('user-1', 'userbook-1');

      expect(result.success).toBe(true);
      expect(prisma.userBook.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if userBook not found', async () => {
      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(null);

      await expect(BookService.removeBookFromLibrary('user-1', 'userbook-1')).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
