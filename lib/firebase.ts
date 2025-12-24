import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};


// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.appId
  );
};

// Initialize Firebase only if properly configured
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let messaging: any = null;

if (isFirebaseConfigured()) {
  try {
    console.log('✅ Firebase configuration is valid. Initializing...');
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getDatabase(app);
    storage = getStorage(app);

    // Initialize Messaging only in browser and if supported
    if (typeof window !== 'undefined') {
      isSupported()
        .then((supported) => {
          if (!supported) {
            console.warn('⚠️  Firebase Messaging is not supported in this browser.');
            return;
          }
          try {
            messaging = getMessaging(app);
            console.log('✅ Firebase Messaging initialized successfully');
          } catch (err) {
            console.error('❌ Failed to initialize Firebase Messaging:', err);
          }
        })
        .catch((err) => {
          console.error('❌ Error checking Firebase Messaging support:', err);
        });
    }

    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    // Firebase will remain null, features using it should handle gracefully
  }
} else {
  console.warn('⚠️  Firebase is not configured. Firebase features will be disabled.');
  console.warn('   Please set the required environment variables in your deployment platform:');
  console.warn('   - NEXT_PUBLIC_FIREBASE_API_KEY');
  console.warn('   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  console.warn('   - NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  console.warn('   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  console.warn('   - NEXT_PUBLIC_FIREBASE_APP_ID');
}

// Helper to safely get the messaging instance
export const getFirebaseMessaging = () => {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) return null;
  return messaging;
};

// Obtain FCM browser token, requesting notification permissions when needed
export const getFcmBrowserToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isFirebaseConfigured()) {
    console.warn('⚠️  Firebase is not configured. Cannot obtain FCM token.');
    return null;
  }

  if (!('Notification' in window)) {
    console.warn('⚠️  Notifications are not supported in this environment.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️  Notification permission not granted by the user.');
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('⚠️  Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY env var. Cannot obtain FCM token.');
      return null;
    }

    const msg = getFirebaseMessaging();
    if (!msg) {
      console.warn('⚠️  Firebase Messaging is not available.');
      return null;
    }

    const token = await getToken(msg, { vapidKey });
    if (!token) {
      console.warn('⚠️  Failed to obtain FCM browser token.');
      return null;
    }

    console.log('✅ Obtained FCM browser token:', token);
    return token;
  } catch (error) {
    console.error('❌ Error while obtaining FCM browser token:', error);
    return null;
  }
};

export { app, auth, db, storage, isFirebaseConfigured };
