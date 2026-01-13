/**
 * @agent backend-logic
 * Service de gestion des utilisateurs avec logique métier
 */
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ConflictError, NotFoundError, UnauthorizedError } from '@/lib/errors';
import type { RegisterUserInput, LoginUserInput } from '@/lib/validation';

export class UserService {
  /**
   * Crée un nouvel utilisateur avec mot de passe hashé
   */
  static async createUser(input: RegisterUserInput) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('Un compte avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // Créer le nouvel utilisateur
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name || input.email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Vérifie les identifiants de connexion
   */
  static async verifyCredentials(input: LoginUserInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Récupère un utilisateur par ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Utilisateur');
    }

    return user;
  }

  /**
   * Récupère les statistiques de lecture d'un utilisateur
   */
  static async getUserReadingStats(userId: string) {
    const stats = await prisma.userBook.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    });

    const total = await prisma.userBook.count({
      where: { userId },
    });

    const averageRating = await prisma.userBook.aggregate({
      where: {
        userId,
        rating: { not: null },
      },
      _avg: {
        rating: true,
      },
    });

    return {
      byStatus: stats.reduce(
        (acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      total,
      averageRating: averageRating._avg.rating || 0,
    };
  }
}
