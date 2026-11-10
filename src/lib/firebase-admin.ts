import { initializeApp, getApps, cert, type ServiceAccount, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let app: App | null = null;
let authInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

function getApp(): App {
  if (app) return app;
  
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }
  
  // Créer le service account depuis les variables d'environnement
  const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  };
  
  app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
  
  return app;
}

function getAdminAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getApp());
  }
  return authInstance;
}

function getAdminDb(): Firestore {
  if (!adminDbInstance) {
    adminDbInstance = getFirestore(getApp());
  }
  return adminDbInstance;
}

// Named exports
export { getAdminAuth, getAdminDb };

// Legacy exports pour compatibilité (déprécié, utiliser les fonctions)
export const auth = {
  get instance() {
    return getAdminAuth();
  }
};

export const adminDb = {
  get instance() {
    return getAdminDb();
  }
};
