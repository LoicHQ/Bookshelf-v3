/**
 * @agent backend-logic
 * API Route pour l'enregistrement d'un nouvel utilisateur
 */
import { NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { registerUserSchema } from '@/lib/validation';
import { errorToResponse } from '@/lib/errors';

/**
 * POST /api/auth/register - Créer un nouveau compte utilisateur
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerUserSchema.parse(body);
    
    const user = await UserService.createUser(validatedData);

    return NextResponse.json(
      {
        message: 'Compte créé avec succès',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    const errorResponse = errorToResponse(error);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}
