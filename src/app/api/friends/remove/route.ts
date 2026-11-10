import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { withAuth, badRequest, notFound } from '@/lib/api-auth';

/**
 * API Route pour supprimer un ami ou annuler une demande
 * POST /api/friends/remove
 * Body: { odId: string, type: 'friend' | 'outgoing' }
 * Header: Authorization: Bearer <token>
 */
export const POST = withAuth(async ({ userId, db, request }) => {
  const { odId, type } = await request.json();

  if (!odId || !type) {
    return badRequest('Paramètres manquants');
  }

  // Récupérer les profils
  const [userDoc, targetDoc] = await Promise.all([
    db.collection('users').doc(userId).get(),
    db.collection('users').doc(odId).get(),
  ]);

  if (!userDoc.exists) {
    return notFound("Ton profil n'existe pas");
  }

  const batch = db.batch();

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
    return badRequest('Type invalide');
  }
  
  await batch.commit();

  return NextResponse.json({ 
    success: true, 
    message: type === 'friend' ? 'Ami supprimé' : 'Demande annulée',
  });
});
