import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';

export const GET = withAuth(async ({ userId, db }) => {
  // Récupérer le profil de l'utilisateur
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    return NextResponse.json({ friends: [], pending: { incoming: [], outgoing: [] } });
  }

  const userData = userDoc.data()!;
  const friendIds: string[] = userData.friends || [];
  const incomingIds: string[] = userData.friendRequests?.incoming || [];
  const outgoingIds: string[] = userData.friendRequests?.outgoing || [];

  // Récupérer tous les profils nécessaires en une seule fois
  const allIds = [...new Set([...friendIds, ...incomingIds, ...outgoingIds])];
  
  if (allIds.length === 0) {
    return NextResponse.json({ friends: [], pending: { incoming: [], outgoing: [] } });
  }

  // Firestore getAll pour récupérer plusieurs docs en une requête
  const refs = allIds.map(id => db.collection('users').doc(id));
  const snapshots = await db.getAll(...refs);
  
  // Créer un map pour accès rapide
  const profileMap = new Map<string, { odId: string; displayName: string; photoURL?: string }>();
  snapshots.forEach((snap) => {
    if (snap.exists) {
      const data = snap.data()!;
      profileMap.set(snap.id, {
        odId: snap.id,
        displayName: data.displayName || 'Joueur',
        photoURL: data.photoURL,
      });
    }
  });

  // Construire les listes
  const friends = friendIds
    .map(id => profileMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const incoming = incomingIds
    .map(id => profileMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const outgoing = outgoingIds
    .map(id => profileMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return NextResponse.json({
    friends,
    pending: { incoming, outgoing },
  });
});
