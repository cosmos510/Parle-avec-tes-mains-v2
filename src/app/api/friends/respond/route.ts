import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { withAuth, badRequest, notFound } from '@/lib/api-auth';

/**
 * API Route pour répondre à une demande d'ami (accepter/refuser)
 * POST /api/friends/respond
 * Body: { fromUserId: string, action: 'accept' | 'decline' }
 * Header: Authorization: Bearer <token>
 */
export const POST = withAuth(async ({ userId, db, request }) => {
  const { fromUserId, action } = await request.json();

  if (!fromUserId || !action) {
    return badRequest('Paramètres manquants');
  }

  if (action !== 'accept' && action !== 'decline') {
    return badRequest('Action invalide');
  }

  // Récupérer les profils
  const [userDoc, fromDoc] = await Promise.all([
    db.collection('users').doc(userId).get(),
    db.collection('users').doc(fromUserId).get(),
  ]);

  if (!userDoc.exists || !fromDoc.exists) {
    return notFound('Utilisateur introuvable');
  }

  const userData = userDoc.data()!;

  // Vérifier qu'il y a bien une demande entrante
  if (!userData.friendRequests?.incoming?.includes(fromUserId)) {
    return badRequest('Aucune demande de cet utilisateur');
  }

  const batch = db.batch();

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
});
