import admin from 'firebase-admin';

let app: admin.app.App | null = null;

export function getFirebaseAdminApp() {
  if (app) return app;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin env vars: FIREBASE_ADMIN_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY');
  }

  // Handle escaped newlines from .env (\n)
  if (privateKey?.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (!admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    app = admin.app();
  }
  return app;
}

export function getMessaging() {
  const a = getFirebaseAdminApp();
  return admin.messaging(a);
}
