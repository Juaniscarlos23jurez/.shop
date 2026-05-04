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

  // Debugging private key format
  console.log('--- DEBUG PRIVATE KEY ---');
  console.log('Original length:', privateKey.length);
  console.log('Starts with:', privateKey.substring(0, 10));
  console.log('Ends with:', privateKey.substring(privateKey.length - 10));
  console.log('Has raw newlines:', privateKey.includes('\n'));
  console.log('Has escaped newlines:', privateKey.includes('\\n'));
  console.log('Has quotes:', privateKey.startsWith('"') || privateKey.startsWith("'"));

  // Clean the private key
  privateKey = privateKey.replace(/^['"]|['"]$/g, '');
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  console.log('Cleaned length:', privateKey.length);
  console.log('Cleaned starts with:', privateKey.substring(0, 10));
  console.log('Cleaned ends with:', privateKey.substring(privateKey.length - 10));
  console.log('Cleaned has raw newlines:', privateKey.includes('\n'));
  console.log('-------------------------');

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
