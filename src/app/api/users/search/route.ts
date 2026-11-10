import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

interface SearchResult {
  odId: string;
  displayName: string;
  email?: string;
  photoURL: string | null;
}

/**
 * API Route pour rechercher des utilisateurs de manière sécurisée
 * POST /api/users/search
 * Body: { searchTerm: string, currentUserId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { searchTerm, currentUserId } = await request.json();
    
    // Validation
    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({ users: [] });
    }
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    // Récupérer les utilisateurs depuis Firestore Admin
    const adminDb = getAdminDb();
    const usersSnapshot = await adminDb.collection('users').get();
    
    const results: SearchResult[] = [];
    
    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      
      // Exclure l'utilisateur courant
      if (user.odId === currentUserId || doc.id === currentUserId) continue;
      
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
    
  } catch (error) {
    console.error('Erreur recherche utilisateurs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    }, { status: 500 });
  }
}
