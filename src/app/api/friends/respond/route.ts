import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * API Route pour répondre à une demande d'ami (accepter/refuser)
 * POST /api/friends/respond
 * Body: { fromUserId: string, action: 'accept' | 'decline' }
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

    const { fromUserId, action } = await request.json();

    if (!fromUserId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

    // Récupérer les profils
    const [userDoc, fromDoc] = await Promise.all([
      adminDb.collection('users').doc(userId).get(),
      adminDb.collection('users').doc(fromUserId).get(),
    ]);

    if (!userDoc.exists || !fromDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const userData = userDoc.data()!;

    // Vérifier qu'il y a bien une demande entrante
    if (!userData.friendRequests?.incoming?.includes(fromUserId)) {
      return NextResponse.json({ error: 'Aucune demande de cet utilisateur' }, { status: 400 });
    }

    const batch = adminDb.batch();

    if (action === 'accept') {
      // Accepter : ajouter aux amis des deux côtés
      batch.update(userDoc.ref, {
        friends: FieldValue.arrayUnion(fromUserId),
        'friendRequests.incoming': FieldValue.arrayRemove(fromUserId),
      });
      
      batch.update(fromDoc.ref, {
        friends: FieldValue.arrayUnion(userId),
        'friendRequests.outgoing': FieldValue.arrayRemove(userId),
      });
    } else {
      // Refuser : juste retirer des listes
      batch.update(userDoc.ref, {
        'friendRequests.incoming': FieldValue.arrayRemove(fromUserId),
      });
      
      batch.update(fromDoc.ref, {
        'friendRequests.outgoing': FieldValue.arrayRemove(userId),
      });
    }
    
    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: action === 'accept' ? 'Demande acceptée !' : 'Demande refusée',
    });

  } catch (error) {
    console.error('Erreur réponse demande d\'ami:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réponse' },
      { status: 500 }
    );
  }
}
