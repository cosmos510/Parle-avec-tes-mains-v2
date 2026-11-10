/**
 * Templates d'emails pour Resend
 * Contient à la fois les composants React (pour le rendu côté client si besoin)
 * et les fonctions qui retournent du HTML string (pour les API routes)
 */

interface EmailTemplateProps {
  userName?: string;
}

interface PasswordResetEmailProps extends EmailTemplateProps {
  resetLink: string;
}

interface DataExportEmailProps extends EmailTemplateProps {
  downloadLink: string;
}

interface AccountDeletedEmailProps extends EmailTemplateProps {
  deletionDate: string;
}

// ========== FONCTIONS HTML (pour les API routes) ==========

export function getPasswordResetEmailHtml({ userName, resetLink }: PasswordResetEmailProps): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 40px 20px; background-color: #ffffff;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #171717;">
          Reinitialisation de mot de passe
        </h1>
        
        <p style="font-size: 16px; color: #525252; line-height: 1.6;">
          Bonjour${userName ? ` ${userName}` : ''},
        </p>
        
        <p style="font-size: 16px; color: #525252; line-height: 1.6;">
          Tu as demande a reinitialiser ton mot de passe sur Parle avec tes mains.
          Clique sur le bouton ci-dessous pour creer un nouveau mot de passe.
        </p>
        
        <div style="margin: 30px 0;">
          <a
            href="${resetLink}"
            style="display: inline-block; padding: 14px 28px; background-color: #171717; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 16px;"
          >
            Reinitialiser mon mot de passe
          </a>
        </div>
        
        <p style="font-size: 14px; color: #737373; line-height: 1.6;">
          Ce lien expire dans 1 heure. Si tu n'as pas demande cette reinitialisation,
          ignore simplement cet email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #a3a3a3;">
          Parle avec tes mains - Apprends la langue des signes
        </p>
      </div>
    </div>
  `;
}

export function getDataExportEmailHtml({ userName, downloadLink }: DataExportEmailProps): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 40px 20px; background-color: #ffffff;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #171717;">
          Export de tes donnees
        </h1>
        
        <p style="font-size: 16px; color: #525252; line-height: 1.6;">
          Bonjour${userName ? ` ${userName}` : ''},
        </p>
        
        <p style="font-size: 16px; color: #525252; line-height: 1.6;">
          Suite a ta demande, voici l'export de toutes tes donnees personnelles
          conformement au RGPD.
        </p>
        
        <div style="margin: 30px 0;">
          <a
            href="${downloadLink}"
            style="display: inline-block; padding: 14px 28px; background-color: #171717; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 16px;"
          >
            Telecharger mes donnees
          </a>
        </div>
        
        <p style="font-size: 14px; color: #737373; line-height: 1.6;">
          Ce lien est valable pendant 24 heures.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #a3a3a3;">
          Parle avec tes mains - Apprends la langue des signes
        </p>
      </div>
    </div>
  `;
}

export function getAccountDeletedEmailHtml({ userName, deletionDate }: AccountDeletedEmailProps): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 40px 20px; background-color: #ffffff;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #171717;">
          Confirmation de suppression de compte
        </h1>
        
        <p style="font-size: 16px; color: #525252; line-height: 1.6;">
          Bonjour${userName ? ` ${userName}` : ''},
        </p>
        
        <p style="font-size: 16px; color: #525252; line-height: 1.6;">
          Nous confirmons que ton compte a ete supprime le ${deletionDate}.
        </p>
        
        <p style="font-size: 16px; color: #525252; line-height: 1.6;">
          Merci d'avoir utilise Parle avec tes mains.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #a3a3a3;">
          Parle avec tes mains - Apprends la langue des signes
        </p>
      </div>
    </div>
  `;
}

// ========== COMPOSANTS REACT (conservés pour compatibilité) ==========

export function PasswordResetEmail({ userName, resetLink }: PasswordResetEmailProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ padding: '40px 20px', backgroundColor: '#ffffff' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#171717' }}>
          Réinitialisation de mot de passe
        </h1>
        
        <p style={{ fontSize: '16px', color: '#525252', lineHeight: '1.6' }}>
          Bonjour{userName ? ` ${userName}` : ''},
        </p>
        
        <p style={{ fontSize: '16px', color: '#525252', lineHeight: '1.6' }}>
          Tu as demandé à réinitialiser ton mot de passe sur Parle avec tes mains.
          Clique sur le bouton ci-dessous pour créer un nouveau mot de passe.
        </p>
        
        <div style={{ margin: '30px 0' }}>
          <a
            href={resetLink}
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              backgroundColor: '#171717',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '9999px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Réinitialiser mon mot de passe
          </a>
        </div>
        
        <p style={{ fontSize: '14px', color: '#737373', lineHeight: '1.6' }}>
          Ce lien expire dans 1 heure. Si tu n{"'"}as pas demandé cette réinitialisation,
          ignore simplement cet email.
        </p>
        
        <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '30px 0' }} />
        
        <p style={{ fontSize: '12px', color: '#a3a3a3' }}>
          Parle avec tes mains - Apprends la langue des signes
        </p>
      </div>
    </div>
  );
}

export function DataExportEmail({ userName, downloadLink }: DataExportEmailProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ padding: '40px 20px', backgroundColor: '#ffffff' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#171717' }}>
          Export de tes données
        </h1>
        
        <p style={{ fontSize: '16px', color: '#525252', lineHeight: '1.6' }}>
          Bonjour{userName ? ` ${userName}` : ''},
        </p>
        
        <p style={{ fontSize: '16px', color: '#525252', lineHeight: '1.6' }}>
          Suite à ta demande, voici l{"'"}export de toutes tes données personnelles
          conformément au RGPD (Règlement Général sur la Protection des Données).
        </p>
        
        <div style={{ margin: '30px 0' }}>
          <a
            href={downloadLink}
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              backgroundColor: '#171717',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '9999px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Télécharger mes données
          </a>
        </div>
        
        <p style={{ fontSize: '14px', color: '#737373', lineHeight: '1.6' }}>
          Ce lien est valable pendant 24 heures. L{"'"}archive contient toutes tes données
          au format JSON : profil, progression, badges, statistiques, etc.
        </p>
        
        <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '30px 0' }} />
        
        <p style={{ fontSize: '12px', color: '#a3a3a3' }}>
          Parle avec tes mains - Apprends la langue des signes
        </p>
      </div>
    </div>
  );
}

export function AccountDeletedEmail({ userName, deletionDate }: AccountDeletedEmailProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ padding: '40px 20px', backgroundColor: '#ffffff' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#171717' }}>
          Confirmation de suppression de compte
        </h1>
        
        <p style={{ fontSize: '16px', color: '#525252', lineHeight: '1.6' }}>
          Bonjour{userName ? ` ${userName}` : ''},
        </p>
        
        <p style={{ fontSize: '16px', color: '#525252', lineHeight: '1.6' }}>
          Nous confirmons que ton compte a été supprimé le {deletionDate}.
        </p>
        
        <p style={{ fontSize: '16px', color: '#525252', lineHeight: '1.6' }}>
          Conformément au RGPD, tes données personnelles ont été anonymisées.
          Les données statistiques agrégées peuvent être conservées de manière anonyme.
        </p>
        
        <p style={{ fontSize: '16px', color: '#525252', lineHeight: '1.6' }}>
          Merci d{"'"}avoir utilisé Parle avec tes mains. Tu es toujours le bienvenu
          si tu souhaites créer un nouveau compte à l{"'"}avenir.
        </p>
        
        <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '30px 0' }} />
        
        <p style={{ fontSize: '12px', color: '#a3a3a3' }}>
          Parle avec tes mains - Apprends la langue des signes
        </p>
      </div>
    </div>
  );
}
