/**
 * @agent tests
 * Tests unitaires pour la recherche de livres dans la base de données
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchBookInDatabase } from '@/lib/db-book-search';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    book: {
      findFirst: vi.fn(),
    },
  },
}));

describe('db-book-search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchBookInDatabase', () => {
    it('should return null if no ISBN provided', async () => {
      const result = await searchBookInDatabase(null, null);
      expect(result).toBeNull();
      expect(prisma.book.findFirst).not.toHaveBeenCalled();
    });

    it('should search by ISBN10', async () => {
      const mockBook = {
        id: 'book-1',
        title: 'Test Book',
        authors: ['Author 1'],
        description: 'Description',
        coverImage: 'cover.jpg',
        thumbnail: 'thumb.jpg',
        publishedDate: '2020',
        publisher: 'Publisher',
        pageCount: 100,
        categories: ['Fiction'],
        isbn: '1234567890',
        isbn13: '9781234567890',
      };

      vi.mocked(prisma.book.findFirst).mockResolvedValue(mockBook as never);

      const result = await searchBookInDatabase('1234567890', null);

      expect(result).toEqual({
        id: 'book-1',
        title: 'Test Book',
        authors: ['Author 1'],
        description: 'Description',
        coverImage: 'cover.jpg',
        thumbnail: 'thumb.jpg',
        publishedDate: '2020',
        publisher: 'Publisher',
        pageCount: 100,
        categories: ['Fiction'],
        isbn: '1234567890',
        isbn13: '9781234567890',
      });

      expect(prisma.book.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ isbn: '1234567890' }],
        },
      });
    });

    it('should search by ISBN13', async () => {
      const mockBook = {
        id: 'book-1',
        title: 'Test Book',
        authors: ['Author 1'],
        description: null,
        coverImage: null,
        thumbnail: null,
        publishedDate: null,
        publisher: null,
        pageCount: null,
        categories: [],
        isbn: null,
        isbn13: '9781234567890',
      };

      vi.mocked(prisma.book.findFirst).mockResolvedValue(mockBook as never);

      const result = await searchBookInDatabase(null, '9781234567890');

      expect(result).toEqual({
        id: 'book-1',
        title: 'Test Book',
        authors: ['Author 1'],
        description: undefined,
        coverImage: undefined,
        thumbnail: undefined,
        publishedDate: undefined,
        publisher: undefined,
        pageCount: undefined,
        categories: [],
        isbn: undefined,
        isbn13: '9781234567890',
      });

      expect(prisma.book.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ isbn13: '9781234567890' }],
        },
      });
    });

    it('should search by both ISBN10 and ISBN13', async () => {
      vi.mocked(prisma.book.findFirst).mockResolvedValue(null);

      await searchBookInDatabase('1234567890', '9781234567890');

      expect(prisma.book.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ isbn: '1234567890' }, { isbn13: '9781234567890' }],
        },
      });
    });

    it('should return null if book not found', async () => {
      vi.mocked(prisma.book.findFirst).mockResolvedValue(null);

      const result = await searchBookInDatabase('1234567890', null);

      expect(result).toBeNull();
    });
  });
});
