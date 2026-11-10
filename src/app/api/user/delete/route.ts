import { NextResponse } from 'next/server';
import { resend, EMAIL_FROM } from '@/lib/resend';
import { FieldValue } from 'firebase-admin/firestore';
import { withAuth } from '@/lib/api-auth';

function getAccountDeletedEmailHtml(userName: string | undefined, deletionDate: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; border: 1px solid #e5e5e5;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 24px 0; color: #171717;">
      Compte supprimé
    </h1>
    
    <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
      ${userName ? `Bonjour ${userName},` : 'Bonjour,'}
    </p>
    
    <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
      Nous confirmons la suppression de ton compte <strong>Parle avec tes mains</strong> effectuée le <strong>${deletionDate}</strong>.
    </p>
    
    <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Conformément au RGPD, tes données personnelles ont été anonymisées. Les scores agrégés sont conservés de manière anonyme pour les classements.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
    
    <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
      Tu peux créer un nouveau compte à tout moment si tu souhaites revenir.
    </p>
    
    <p style="color: #a3a3a3; font-size: 14px; margin: 16px 0 0 0;">
      À bientôt peut-être,<br>
      L'équipe Parle avec tes mains
    </p>
  </div>
</body>
</html>
  `.trim();
}

export const POST = withAuth(async ({ userId, auth, db }) => {
  // Récupérer les infos utilisateur avant suppression
  const user = await auth.getUser(userId);
  const userEmail = user.email!;
  const userName = user.displayName || undefined;

  // ===== ANONYMISATION DES DONNÉES (RGPD compliant) =====
  
  // 1. Anonymiser le profil utilisateur
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (userDoc.exists) {
    await userRef.update({
      displayName: 'Utilisateur supprimé',
      email: `deleted_${userId}@anonymous.local`,
      photoURL: null,
      isDeleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      // Conserver les stats agrégées de manière anonyme
      friends: [],
      friendRequests: { incoming: [], outgoing: [] },
    });
  }

  // 2. Anonymiser les records de sprint (garder pour le leaderboard anonyme)
  const sprintRef = db.collection('sprintRecords').doc(userId);
  const sprintDoc = await sprintRef.get();
  
  if (sprintDoc.exists) {
    await sprintRef.update({
      displayName: 'Utilisateur supprimé',
      isAnonymous: true,
    });
  }

  // 3. Anonymiser les challenges
  const challengesSnapshot = await db
    .collection('challenges')
    .where('creatorId', '==', userId)
    .get();
  
  const batch = db.batch();
  challengesSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      creatorDisplayName: 'Utilisateur supprimé',
      isAnonymous: true,
    });
  });
  await batch.commit();

  // 4. Retirer l'utilisateur des listes d'amis des autres
  const friendsSnapshot = await db
    .collection('users')
    .where('friends', 'array-contains', userId)
    .get();
  
  const friendsBatch = db.batch();
  friendsSnapshot.docs.forEach(doc => {
    friendsBatch.update(doc.ref, {
      friends: FieldValue.arrayRemove(userId),
    });
  });
  await friendsBatch.commit();

  // 5. Supprimer les données de présence (Realtime DB - optionnel car éphémère)
  // Note: Les données Realtime DB sont généralement éphémères

  // 6. Désactiver le compte Firebase Auth (soft delete, pas de suppression)
  await auth.updateUser(userId, {
    disabled: true,
    displayName: 'Utilisateur supprimé',
  });

  // Envoyer l'email de confirmation
  const deletionDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  await resend.emails.send({
    from: EMAIL_FROM,
    to: userEmail,
    subject: 'Confirmation de suppression de compte - Parle avec tes mains',
    html: getAccountDeletedEmailHtml(userName, deletionDate),
  });

  return NextResponse.json({ 
    success: true, 
    message: 'Ton compte a été supprimé et tes données anonymisées' 
  });
});
