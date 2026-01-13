/**
 * @agent tests
 * Tests unitaires pour le service de gestion des utilisateurs
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/services/user.service';
import { ConflictError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userBook: {
      groupBy: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const result = await UserService.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
        select: expect.any(Object),
      });
    });

    it('should generate name from email if not provided', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'test',
        image: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      await UserService.createUser({
        email: 'test@example.com',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'test',
        },
        select: expect.any(Object),
      });
    });

    it('should throw ConflictError if user already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as never);

      await expect(
        UserService.createUser({
          email: 'test@example.com',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await UserService.getUserById('user-1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(UserService.getUserById('user-1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserReadingStats', () => {
    it('should return reading statistics', async () => {
      const mockStats = [
        { status: 'TO_READ', _count: 5 },
        { status: 'READING', _count: 2 },
        { status: 'COMPLETED', _count: 10 },
      ];

      vi.mocked(prisma.userBook.groupBy).mockResolvedValue(mockStats as never);
      vi.mocked(prisma.userBook.count).mockResolvedValue(17);
      vi.mocked(prisma.userBook.aggregate).mockResolvedValue({
        _avg: { rating: 4.5 },
      } as never);

      const result = await UserService.getUserReadingStats('user-1');

      expect(result.total).toBe(17);
      expect(result.averageRating).toBe(4.5);
      expect(result.byStatus).toEqual({
        TO_READ: 5,
        READING: 2,
        COMPLETED: 10,
      });
    });

    it('should handle zero average rating', async () => {
      vi.mocked(prisma.userBook.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.userBook.count).mockResolvedValue(0);
      vi.mocked(prisma.userBook.aggregate).mockResolvedValue({
        _avg: { rating: null },
      } as never);

      const result = await UserService.getUserReadingStats('user-1');

      expect(result.averageRating).toBe(0);
    });
  });
});
