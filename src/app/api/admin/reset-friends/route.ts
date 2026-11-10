import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

/**
 * API Route pour reset toutes les données d'amis (DEV ONLY)
 * POST /api/admin/reset-friends
 * Header: x-admin-secret: <ADMIN_SECRET from env>
 * 
 * ATTENTION: Cette route est uniquement pour le développement !
 */
export async function POST(request: NextRequest) {
  // Sécurité: vérifier le secret admin
  const adminSecret = request.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_SECRET;
  
  if (!expectedSecret || adminSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const adminDb = getAdminDb();
    
    // Récupérer tous les utilisateurs
    const usersSnapshot = await adminDb.collection('users').get();
    
    const batch = adminDb.batch();
    let count = 0;
    
    for (const doc of usersSnapshot.docs) {
      batch.update(doc.ref, {
        friends: [],
        friendRequests: {
          incoming: [],
          outgoing: [],
        },
      });
      count++;
    }
    
    await batch.commit();
    
    console.log(`[Admin] Reset friends data for ${count} users`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Reset effectué pour ${count} utilisateurs`,
      usersReset: count,
    });

  } catch (error) {
    console.error('Erreur reset friends:', error);
    return NextResponse.json(
      { error: 'Erreur lors du reset' },
      { status: 500 }
    );
  }
}
