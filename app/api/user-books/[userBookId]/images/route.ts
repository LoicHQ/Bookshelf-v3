/**
 * @agent backend-logic
 * API pour gérer les images importées par les utilisateurs pour leurs livres
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserBookImageService } from '@/services/user-book-image.service';
import { z } from 'zod';

const addImageSchema = z.object({
  imageUrl: z.string().url("URL d'image invalide"),
});

/**
 * GET /api/user-books/[userBookId]/images
 * Récupère les images d'un UserBook
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userBookId: string }> }
) {
  try {
    const session = await auth();
    const { userBookId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const images = await UserBookImageService.getUserBookImages(userBookId);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching user book images:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des images' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-books/[userBookId]/images
 * Ajoute une image à un UserBook
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userBookId: string }> }
) {
  try {
    const session = await auth();
    const { userBookId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const validation = addImageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { imageUrl } = validation.data;

    const image = await UserBookImageService.addUserBookImage(
      session.user.id,
      userBookId,
      imageUrl
    );

    return NextResponse.json({ image }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding user book image:', error);

    if (error.message?.includes('Limite')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message?.includes('existe déjà')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error.message?.includes('Livre utilisateur')) {
      return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ error: "Erreur lors de l'ajout de l'image" }, { status: 500 });
  }
}
