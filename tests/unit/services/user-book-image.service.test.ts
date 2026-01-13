/**
 * @agent tests
 * Tests unitaires pour le service de gestion des images utilisateur
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserBookImageService } from '@/services/user-book-image.service';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userBookImage: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    userBook: {
      findFirst: vi.fn(),
    },
  },
}));

describe('UserBookImageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserBookImages', () => {
    it('should return user book images', async () => {
      const mockImages = [
        {
          id: 'img-1',
          userBookId: 'userbook-1',
          imageUrl: 'https://example.com/image1.jpg',
          source: 'user',
          createdAt: new Date(),
        },
        {
          id: 'img-2',
          userBookId: 'userbook-1',
          imageUrl: 'https://example.com/image2.jpg',
          source: 'user',
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.userBookImage.findMany).mockResolvedValue(mockImages as never);

      const result = await UserBookImageService.getUserBookImages('userbook-1');

      expect(result).toEqual(mockImages);
      expect(prisma.userBookImage.findMany).toHaveBeenCalledWith({
        where: { userBookId: 'userbook-1' },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });
    });
  });

  describe('getUserBookImageCount', () => {
    it('should return count of images', async () => {
      vi.mocked(prisma.userBookImage.count).mockResolvedValue(2);

      const result = await UserBookImageService.getUserBookImageCount('userbook-1');

      expect(result).toBe(2);
      expect(prisma.userBookImage.count).toHaveBeenCalledWith({
        where: { userBookId: 'userbook-1' },
      });
    });
  });

  describe('addUserBookImage', () => {
    it('should add image to user book', async () => {
      const mockUserBook = {
        id: 'userbook-1',
        userId: 'user-1',
        bookId: 'book-1',
      };

      const mockImage = {
        id: 'img-1',
        userBookId: 'userbook-1',
        imageUrl: 'https://example.com/image.jpg',
        source: 'user',
        createdAt: new Date(),
      };

      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(mockUserBook as never);
      vi.mocked(prisma.userBookImage.count).mockResolvedValue(0);
      vi.mocked(prisma.userBookImage.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.userBookImage.create).mockResolvedValue(mockImage as never);

      const result = await UserBookImageService.addUserBookImage(
        'user-1',
        'userbook-1',
        'https://example.com/image.jpg'
      );

      expect(result).toEqual(mockImage);
      expect(prisma.userBook.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'userbook-1',
          userId: 'user-1',
        },
      });
      expect(prisma.userBookImage.create).toHaveBeenCalledWith({
        data: {
          userBookId: 'userbook-1',
          imageUrl: 'https://example.com/image.jpg',
          source: 'user',
        },
      });
    });

    it('should throw NotFoundError if userBook not found', async () => {
      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(null);

      await expect(
        UserBookImageService.addUserBookImage(
          'user-1',
          'userbook-1',
          'https://example.com/image.jpg'
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if limit reached', async () => {
      const mockUserBook = {
        id: 'userbook-1',
        userId: 'user-1',
        bookId: 'book-1',
      };

      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(mockUserBook as never);
      vi.mocked(prisma.userBookImage.count).mockResolvedValue(3);

      await expect(
        UserBookImageService.addUserBookImage(
          'user-1',
          'userbook-1',
          'https://example.com/image.jpg'
        )
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if image already exists', async () => {
      const mockUserBook = {
        id: 'userbook-1',
        userId: 'user-1',
        bookId: 'book-1',
      };

      const mockExistingImage = {
        id: 'img-1',
        userBookId: 'userbook-1',
        imageUrl: 'https://example.com/image.jpg',
      };

      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(mockUserBook as never);
      vi.mocked(prisma.userBookImage.count).mockResolvedValue(0);
      vi.mocked(prisma.userBookImage.findFirst).mockResolvedValue(mockExistingImage as never);

      await expect(
        UserBookImageService.addUserBookImage(
          'user-1',
          'userbook-1',
          'https://example.com/image.jpg'
        )
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteUserBookImage', () => {
    it('should delete user book image', async () => {
      const mockImage = {
        id: 'img-1',
        userBookId: 'userbook-1',
        imageUrl: 'https://example.com/image.jpg',
        userBook: {
          userId: 'user-1',
        },
      };

      vi.mocked(prisma.userBookImage.findUnique).mockResolvedValue(mockImage as never);
      vi.mocked(prisma.userBookImage.delete).mockResolvedValue(mockImage as never);

      const result = await UserBookImageService.deleteUserBookImage('img-1', 'user-1');

      expect(result).toEqual({ success: true });
      expect(prisma.userBookImage.delete).toHaveBeenCalledWith({
        where: { id: 'img-1' },
      });
    });

    it('should throw NotFoundError if image not found', async () => {
      vi.mocked(prisma.userBookImage.findUnique).mockResolvedValue(null);

      await expect(UserBookImageService.deleteUserBookImage('img-1', 'user-1')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw NotFoundError if image does not belong to user', async () => {
      const mockImage = {
        id: 'img-1',
        userBookId: 'userbook-1',
        imageUrl: 'https://example.com/image.jpg',
        userBook: {
          userId: 'user-2',
        },
      };

      vi.mocked(prisma.userBookImage.findUnique).mockResolvedValue(mockImage as never);

      await expect(UserBookImageService.deleteUserBookImage('img-1', 'user-1')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('canAddImage', () => {
    it('should return true if user can add image', async () => {
      const mockUserBook = {
        id: 'userbook-1',
        userId: 'user-1',
        bookId: 'book-1',
      };

      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(mockUserBook as never);
      vi.mocked(prisma.userBookImage.count).mockResolvedValue(2);

      const result = await UserBookImageService.canAddImage('user-1', 'userbook-1');

      expect(result).toBe(true);
    });

    it('should return false if userBook not found', async () => {
      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(null);

      const result = await UserBookImageService.canAddImage('user-1', 'userbook-1');

      expect(result).toBe(false);
    });

    it('should return false if limit reached', async () => {
      const mockUserBook = {
        id: 'userbook-1',
        userId: 'user-1',
        bookId: 'book-1',
      };

      vi.mocked(prisma.userBook.findFirst).mockResolvedValue(mockUserBook as never);
      vi.mocked(prisma.userBookImage.count).mockResolvedValue(3);

      const result = await UserBookImageService.canAddImage('user-1', 'userbook-1');

      expect(result).toBe(false);
    });
  });
});
