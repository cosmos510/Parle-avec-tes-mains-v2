import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * API Route pour envoyer une demande d'ami
 * POST /api/friends/request
 * Body: { toUserId: string }
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
    const fromUserId = decodedToken.uid;

    const { toUserId } = await request.json();

    if (!toUserId) {
      return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 });
    }

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: 'Tu ne peux pas t\'ajouter toi-même' }, { status: 400 });
    }

    // Vérifier que les deux utilisateurs existent
    const [fromDoc, toDoc] = await Promise.all([
      adminDb.collection('users').doc(fromUserId).get(),
      adminDb.collection('users').doc(toUserId).get(),
    ]);

    if (!fromDoc.exists) {
      return NextResponse.json({ error: 'Ton profil n\'existe pas' }, { status: 404 });
    }

    if (!toDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const fromData = fromDoc.data()!;

    // Vérifier s'ils sont déjà amis
    if (fromData.friends?.includes(toUserId)) {
      return NextResponse.json({ error: 'Vous êtes déjà amis' }, { status: 400 });
    }

    // Vérifier si une demande est déjà en cours
    if (fromData.friendRequests?.outgoing?.includes(toUserId)) {
      return NextResponse.json({ error: 'Demande déjà envoyée' }, { status: 400 });
    }

    // Vérifier si l'autre a déjà envoyé une demande (accepter automatiquement)
    if (fromData.friendRequests?.incoming?.includes(toUserId)) {
      // L'autre a déjà envoyé une demande, on accepte
      const batch = adminDb.batch();
      
      batch.update(fromDoc.ref, {
        friends: FieldValue.arrayUnion(toUserId),
        'friendRequests.incoming': FieldValue.arrayRemove(toUserId),
      });
      
      batch.update(toDoc.ref, {
        friends: FieldValue.arrayUnion(fromUserId),
        'friendRequests.outgoing': FieldValue.arrayRemove(fromUserId),
      });
      
      await batch.commit();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Demande acceptée, vous êtes maintenant amis !',
        status: 'accepted'
      });
    }

    // Envoyer la demande
    const batch = adminDb.batch();
    
    batch.update(fromDoc.ref, {
      'friendRequests.outgoing': FieldValue.arrayUnion(toUserId),
    });
    
    batch.update(toDoc.ref, {
      'friendRequests.incoming': FieldValue.arrayUnion(fromUserId),
    });
    
    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: 'Demande envoyée !',
      status: 'pending'
    });

  } catch (error) {
    console.error('Erreur demande d\'ami:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la demande' },
      { status: 500 }
    );
  }
}
