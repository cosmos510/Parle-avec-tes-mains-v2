import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

export interface AuthenticatedRequest {
  userId: string;
  auth: Auth;
  db: Firestore;
  request: NextRequest;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiHandler = (ctx: AuthenticatedRequest) => Promise<NextResponse<any>>;

/**
 * Middleware d'authentification pour les routes API
 * Vérifie le token Firebase et injecte userId, auth et db dans le handler
 * 
 * @example
 * export const POST = withAuth(async ({ userId, db, request }) => {
 *   const body = await request.json();
 *   // ... logique métier
 *   return NextResponse.json({ success: true });
 * });
 */
export function withAuth(handler: ApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Vérifier l'authentification
      const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }

      const token = authHeader.split('Bearer ')[1];
      const auth = getAdminAuth();
      const db = getAdminDb();
      
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      return await handler({ userId, auth, db, request });
    } catch (error) {
      // Token invalide ou expiré
      if (error instanceof Error && error.message.includes('auth')) {
        return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
      }
      
      console.error('Erreur API:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return NextResponse.json(
        { error: 'Erreur serveur', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper pour retourner une erreur 400 avec un message
 */
export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Helper pour retourner une erreur 404 avec un message
 */
export function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Helper pour retourner une erreur 500 avec un message
 */
export function serverError(message: string, details?: string) {
  return NextResponse.json(
    { error: message, details: process.env.NODE_ENV === 'development' ? details : undefined },
    { status: 500 }
  );
}
