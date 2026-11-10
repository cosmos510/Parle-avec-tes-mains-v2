import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';

interface SearchResult {
  odId: string;
  displayName: string;
  email?: string;
  photoURL: string | null;
}

/**
 * API Route pour rechercher des utilisateurs de manière sécurisée
 * POST /api/users/search
 * Body: { searchTerm: string }
 * Header: Authorization: Bearer <token>
 */
export const POST = withAuth(async ({ userId, db, request }) => {
  const { searchTerm } = await request.json();
  
  // Validation
  if (!searchTerm || searchTerm.length < 2) {
    return NextResponse.json({ users: [] });
  }
  
  const searchLower = searchTerm.toLowerCase();
  
  // Récupérer les utilisateurs depuis Firestore Admin
  const usersSnapshot = await db.collection('users').get();
  
  const results: SearchResult[] = [];
  
  for (const doc of usersSnapshot.docs) {
    const user = doc.data();
    
    // Exclure l'utilisateur courant
    if (user.odId === userId || doc.id === userId) continue;
    
    // Exclure les utilisateurs supprimés
    if (user.isDeleted === true) continue;
    
    // Recherche case-insensitive
    const nameMatch = user.displayName?.toLowerCase().includes(searchLower);
    const emailMatch = user.email?.toLowerCase().includes(searchLower);
    
    if (nameMatch || emailMatch) {
      // Retourner seulement les champs publics nécessaires
      results.push({
        odId: user.odId || doc.id,
        displayName: user.displayName || 'Utilisateur',
        email: user.email,
        photoURL: user.photoURL || null,
      });
    }
  }
  
  // Limiter à 10 résultats
  return NextResponse.json({ users: results.slice(0, 10) });
});
