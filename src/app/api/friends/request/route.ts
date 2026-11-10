import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { withAuth, badRequest, notFound } from '@/lib/api-auth';

/**
 * API Route pour envoyer une demande d'ami
 * POST /api/friends/request
 * Body: { toUserId: string }
 * Header: Authorization: Bearer <token>
 */
export const POST = withAuth(async ({ userId, db, request }) => {
  const { toUserId } = await request.json();

  if (!toUserId) {
    return badRequest('ID utilisateur manquant');
  }

  if (userId === toUserId) {
    return badRequest("Tu ne peux pas t'ajouter toi-même");
  }

  // Vérifier que les deux utilisateurs existent
  const [fromDoc, toDoc] = await Promise.all([
    db.collection('users').doc(userId).get(),
    db.collection('users').doc(toUserId).get(),
  ]);

  if (!fromDoc.exists) {
    return notFound("Ton profil n'existe pas");
  }

  if (!toDoc.exists) {
    return notFound('Utilisateur introuvable');
  }

  const fromData = fromDoc.data()!;

  // Vérifier s'ils sont déjà amis
  if (fromData.friends?.includes(toUserId)) {
    return badRequest('Vous êtes déjà amis');
  }

  // Vérifier si une demande est déjà en cours
  if (fromData.friendRequests?.outgoing?.includes(toUserId)) {
    return badRequest('Demande déjà envoyée');
  }

  // Vérifier si l'autre a déjà envoyé une demande (accepter automatiquement)
  if (fromData.friendRequests?.incoming?.includes(toUserId)) {
    // L'autre a déjà envoyé une demande, on accepte
    const batch = db.batch();
    
    batch.update(fromDoc.ref, {
      friends: FieldValue.arrayUnion(toUserId),
      'friendRequests.incoming': FieldValue.arrayRemove(toUserId),
    });
    
    batch.update(toDoc.ref, {
      friends: FieldValue.arrayUnion(userId),
      'friendRequests.outgoing': FieldValue.arrayRemove(userId),
    });
    
    await batch.commit();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Demande acceptée, vous êtes maintenant amis !',
      status: 'accepted'
    });
  }

  // Envoyer la demande
  const batch = db.batch();
  
  batch.update(fromDoc.ref, {
    'friendRequests.outgoing': FieldValue.arrayUnion(toUserId),
  });
  
  batch.update(toDoc.ref, {
    'friendRequests.incoming': FieldValue.arrayUnion(userId),
  });
  
  await batch.commit();

  return NextResponse.json({ 
    success: true, 
    message: 'Demande envoyée !',
    status: 'pending'
  });
});
