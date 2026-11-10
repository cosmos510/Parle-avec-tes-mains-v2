import admin from 'firebase-admin';

let initialized = false;

export function initializeFirebase() {
  if (initialized) return;

  // Check for service account credentials
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  
  // Individual env vars (like frontend .env.local)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (serviceAccountJson) {
    // Parse JSON from environment variable
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('[Firebase] Initialized with service account JSON');
  } else if (serviceAccountPath) {
    // Load from file path
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('[Firebase] Initialized with service account file');
  } else if (projectId && clientEmail && privateKey) {
    // Use individual environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    });
    console.log('[Firebase] Initialized with individual env vars');
  } else {
    console.error('[Firebase] No credentials found!');
    console.error('Set either:');
    console.error('  - FIREBASE_SERVICE_ACCOUNT_JSON (full JSON)');
    console.error('  - FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON file)');
    console.error('  - FIREBASE_PROJECT_ID + FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY');
    process.exit(1);
  }

  initialized = true;
}

export const getFirestore = () => admin.firestore();
export const getAuth = () => admin.auth();
