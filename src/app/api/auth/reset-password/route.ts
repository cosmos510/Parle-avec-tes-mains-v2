import { NextRequest, NextResponse } from 'next/server';
import { resend, EMAIL_FROM } from '@/lib/resend';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getPasswordResetEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // URL de l'app
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://parle-avec-tes-mains.fr');
    
    // Générer le lien de reset via Firebase Admin
    // Ce lien pointe vers Firebase, on va extraire le oobCode
    const auth = getAdminAuth();
    const firebaseResetLink = await auth.generatePasswordResetLink(email, {
      url: `${appUrl}/login`, // continueUrl (pas utilisé car on extrait le code)
    });

    // Extraire le oobCode du lien Firebase
    // Le lien ressemble à: https://xxx.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=ABC123&...
    const url = new URL(firebaseResetLink);
    const oobCode = url.searchParams.get('oobCode');
    
    if (!oobCode) {
      throw new Error('Impossible de générer le code de réinitialisation');
    }

    // Construire notre propre lien qui pointe directement vers notre page
    const resetLink = `${appUrl}/reset-password?oobCode=${oobCode}`;

    // Récupérer le nom de l'utilisateur si possible
    let userName: string | undefined;
    try {
      const user = await auth.getUserByEmail(email);
      userName = user.displayName || undefined;
    } catch {
      // Utilisateur non trouvé, on continue pour éviter l'énumération
    }

    // Générer le HTML de l'email
    const htmlContent = getPasswordResetEmailHtml({ userName, resetLink });

    // Envoyer l'email via Resend
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Reinitialisation de ton mot de passe - Parle avec tes mains',
      html: htmlContent,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur reset password:', error);
    // On retourne toujours un succès pour éviter l'énumération des emails
    return NextResponse.json({ success: true });
  }
}
