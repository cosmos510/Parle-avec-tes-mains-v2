import { Resend } from 'resend';

// En dev, on peut ne pas avoir la clé API
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey && process.env.NODE_ENV === 'production') {
  throw new Error('RESEND_API_KEY manquant dans les variables d\'environnement');
}

export const resend = new Resend(resendApiKey || 'dummy_key_for_dev');

export const EMAIL_FROM = 'Parle avec tes mains <noreply@parle-avec-tes-mains.fr>';
