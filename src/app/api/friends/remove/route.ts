import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * API Route pour supprimer un ami ou annuler une demande
 * POST /api/friends/remove
 * Body: { odId: string, type: 'friend' | 'outgoing' }
 * Header: Authorization: Bearer <token>
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const adminDb = getAdminDb();
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { odId, type } = await request.json();

    if (!odId || !type) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Récupérer les profils
    const [userDoc, targetDoc] = await Promise.all([
      adminDb.collection('users').doc(userId).get(),
      adminDb.collection('users').doc(odId).get(),
    ]);

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Ton profil n\'existe pas' }, { status: 404 });
    }

    const batch = adminDb.batch();

    if (type === 'friend') {
      // Supprimer des amis des deux côtés
      batch.update(userDoc.ref, {
        friends: FieldValue.arrayRemove(odId),
      });
      
      if (targetDoc.exists) {
        batch.update(targetDoc.ref, {
          friends: FieldValue.arrayRemove(userId),
        });
      }
    } else if (type === 'outgoing') {
      // Annuler une demande sortante
      batch.update(userDoc.ref, {
        'friendRequests.outgoing': FieldValue.arrayRemove(odId),
      });
      
      if (targetDoc.exists) {
        batch.update(targetDoc.ref, {
          'friendRequests.incoming': FieldValue.arrayRemove(userId),
        });
      }
    } else {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }
    
    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: type === 'friend' ? 'Ami supprimé' : 'Demande annulée',
    });

  } catch (error) {
    console.error('Erreur suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
