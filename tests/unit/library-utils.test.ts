import { describe, it, expect } from 'vitest';
import type { UserBook, BookStatus } from '@/types';

type FilterStatus = 'ALL' | BookStatus;

// Fonctions utilitaires pour tester la logique de filtrage et statistiques
function filterBooks(books: UserBook[], filter: FilterStatus): UserBook[] {
  if (filter === 'ALL') return books;
  return books.filter((book) => book.status === filter);
}

function calculateStats(books: UserBook[]) {
  return {
    total: books.length,
    toRead: books.filter((b) => b.status === 'TO_READ').length,
    reading: books.filter((b) => b.status === 'READING').length,
    completed: books.filter((b) => b.status === 'COMPLETED').length,
    abandoned: books.filter((b) => b.status === 'ABANDONED').length,
  };
}

describe('Library Utils', () => {
  const mockBooks: UserBook[] = [
    {
      id: '1',
      userId: 'user1',
      bookId: 'book1',
      status: 'TO_READ',
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'user1',
      bookId: 'book2',
      status: 'READING',
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      userId: 'user1',
      bookId: 'book3',
      status: 'COMPLETED',
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      userId: 'user1',
      bookId: 'book4',
      status: 'TO_READ',
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      userId: 'user1',
      bookId: 'book5',
      status: 'ABANDONED',
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('filterBooks', () => {
    it('should return all books when filter is ALL', () => {
      const result = filterBooks(mockBooks, 'ALL');
      expect(result).toHaveLength(5);
      expect(result).toEqual(mockBooks);
    });

    it('should filter books by TO_READ status', () => {
      const result = filterBooks(mockBooks, 'TO_READ');
      expect(result).toHaveLength(2);
      expect(result.every((book) => book.status === 'TO_READ')).toBe(true);
    });

    it('should filter books by READING status', () => {
      const result = filterBooks(mockBooks, 'READING');
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('READING');
    });

    it('should filter books by COMPLETED status', () => {
      const result = filterBooks(mockBooks, 'COMPLETED');
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('COMPLETED');
    });

    it('should filter books by ABANDONED status', () => {
      const result = filterBooks(mockBooks, 'ABANDONED');
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('ABANDONED');
    });

    it('should return empty array when no books match filter', () => {
      const emptyBooks: UserBook[] = [];
      const result = filterBooks(emptyBooks, 'TO_READ');
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateStats', () => {
    it('should calculate correct statistics', () => {
      const stats = calculateStats(mockBooks);
      expect(stats.total).toBe(5);
      expect(stats.toRead).toBe(2);
      expect(stats.reading).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.abandoned).toBe(1);
    });

    it('should return zero stats for empty array', () => {
      const stats = calculateStats([]);
      expect(stats.total).toBe(0);
      expect(stats.toRead).toBe(0);
      expect(stats.reading).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.abandoned).toBe(0);
    });

    it('should handle books with only one status', () => {
      const singleStatusBooks: UserBook[] = [
        {
          id: '1',
          userId: 'user1',
          bookId: 'book1',
          status: 'TO_READ',
          favorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'user1',
          bookId: 'book2',
          status: 'TO_READ',
          favorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const stats = calculateStats(singleStatusBooks);
      expect(stats.total).toBe(2);
      expect(stats.toRead).toBe(2);
      expect(stats.reading).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.abandoned).toBe(0);
    });
  });
});
