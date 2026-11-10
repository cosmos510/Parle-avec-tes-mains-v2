import { NextRequest, NextResponse } from 'next/server';
import { resend, EMAIL_FROM } from '@/lib/resend';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

function getDataExportNotificationHtml(userName: string | undefined, exportDate: string): string {
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
      Export de données effectué
    </h1>
    
    <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
      ${userName ? `Bonjour ${userName},` : 'Bonjour,'}
    </p>
    
    <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
      Un export de tes données personnelles a été effectué le <strong>${exportDate}</strong> sur ton compte <strong>Parle avec tes mains</strong>.
    </p>
    
    <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Si tu n'es pas à l'origine de cette demande, nous te conseillons de changer ton mot de passe immédiatement.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
    
    <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
      Cet email a été envoyé automatiquement pour des raisons de sécurité.
    </p>
    
    <p style="color: #a3a3a3; font-size: 14px; margin: 16px 0 0 0;">
      L'équipe Parle avec tes mains
    </p>
  </div>
</body>
</html>
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification via le token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const adminDb = getAdminDb();
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Récupérer toutes les données de l'utilisateur
    const userData: Record<string, unknown> = {};

    // 1. Profil utilisateur (collection users)
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (userDoc.exists) {
      userData.profile = userDoc.data();
    }

    // 2. Progression (collection userProgress)
    const progressDoc = await adminDb.collection('userProgress').doc(userId).get();
    if (progressDoc.exists) {
      userData.progression = progressDoc.data();
    }

    // 3. Records sprint
    const sprintDoc = await adminDb.collection('sprintRecords').doc(userId).get();
    if (sprintDoc.exists) {
      userData.sprintRecords = sprintDoc.data();
    }

    // 4. Challenges créés
    const challengesSnapshot = await adminDb
      .collection('challenges')
      .where('creatorId', '==', userId)
      .get();
    userData.challenges = challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 5. Ajouter métadonnées
    userData.exportDate = new Date().toISOString();
    userData.userId = userId;

    // Envoyer un email de notification (sans les données, juste pour prévenir)
    const user = await auth.getUser(userId);
    const exportDate = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email!,
      subject: 'Export de données effectué - Parle avec tes mains',
      html: getDataExportNotificationHtml(user.displayName || undefined, exportDate),
    });

    // Retourner les données pour téléchargement immédiat côté client
    return NextResponse.json({ 
      success: true, 
      data: userData 
    });
  } catch (error) {
    console.error('Erreur export données:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}
