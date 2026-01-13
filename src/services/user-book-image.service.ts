/**
 * @agent backend-logic
 * Service de gestion des images importées par les utilisateurs pour leurs livres
 */
import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError } from '@/lib/errors';

const MAX_IMAGES_PER_BOOK = 3;

export class UserBookImageService {
  /**
   * Récupère les images d'un UserBook
   */
  static async getUserBookImages(userBookId: string) {
    return prisma.userBookImage.findMany({
      where: { userBookId },
      orderBy: { createdAt: 'desc' },
      take: MAX_IMAGES_PER_BOOK,
    });
  }

  /**
   * Compte le nombre d'images d'un UserBook
   */
  static async getUserBookImageCount(userBookId: string): Promise<number> {
    return prisma.userBookImage.count({
      where: { userBookId },
    });
  }

  /**
   * Ajoute une image à un UserBook
   * Vérifie la limite de 3 images par livre
   */
  static async addUserBookImage(userId: string, userBookId: string, imageUrl: string) {
    // Vérifier que le UserBook appartient à l'utilisateur
    const userBook = await prisma.userBook.findFirst({
      where: {
        id: userBookId,
        userId,
      },
    });

    if (!userBook) {
      throw new NotFoundError('Livre utilisateur');
    }

    // Vérifier la limite de 3 images
    const currentCount = await this.getUserBookImageCount(userBookId);
    if (currentCount >= MAX_IMAGES_PER_BOOK) {
      throw new ConflictError(`Limite de ${MAX_IMAGES_PER_BOOK} images atteinte pour ce livre`);
    }

    // Vérifier si l'image existe déjà pour ce livre
    const existingImage = await prisma.userBookImage.findFirst({
      where: {
        userBookId,
        imageUrl,
      },
    });

    if (existingImage) {
      throw new ConflictError('Cette image existe déjà pour ce livre');
    }

    // Créer l'image
    return prisma.userBookImage.create({
      data: {
        userBookId,
        imageUrl,
        source: 'user',
      },
    });
  }

  /**
   * Supprime une image utilisateur
   * Vérifie que l'image appartient à l'utilisateur
   */
  static async deleteUserBookImage(imageId: string, userId: string) {
    // Vérifier que l'image existe et appartient à l'utilisateur
    const image = await prisma.userBookImage.findUnique({
      where: { id: imageId },
      include: {
        userBook: {
          select: { userId: true },
        },
      },
    });

    if (!image) {
      throw new NotFoundError('Image');
    }

    if (image.userBook.userId !== userId) {
      throw new NotFoundError('Image');
    }

    // Supprimer l'image
    await prisma.userBookImage.delete({
      where: { id: imageId },
    });

    return { success: true };
  }

  /**
   * Vérifie si un utilisateur peut ajouter une image à un UserBook
   */
  static async canAddImage(userId: string, userBookId: string): Promise<boolean> {
    const userBook = await prisma.userBook.findFirst({
      where: {
        id: userBookId,
        userId,
      },
    });

    if (!userBook) {
      return false;
    }

    const currentCount = await this.getUserBookImageCount(userBookId);
    return currentCount < MAX_IMAGES_PER_BOOK;
  }
}
