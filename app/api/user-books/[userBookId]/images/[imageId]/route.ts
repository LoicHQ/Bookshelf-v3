/**
 * @agent backend-logic
 * API pour supprimer une image utilisateur
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserBookImageService } from '@/services/user-book-image.service';

/**
 * DELETE /api/user-books/[userBookId]/images/[imageId]
 * Supprime une image utilisateur
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userBookId: string; imageId: string }> }
) {
  try {
    const session = await auth();
    const { imageId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await UserBookImageService.deleteUserBookImage(imageId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user book image:', error);

    if (error.message?.includes('Image')) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'image" },
      { status: 500 }
    );
  }
}
