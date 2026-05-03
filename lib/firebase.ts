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

    console.log('🔍 VAPID Key validation:', {
      length: vapidKey.trim().length,
      isTrimmed: vapidKey === vapidKey.trim(),
      start: vapidKey.substring(0, 5) + '...'
    });

    const msg = getFirebaseMessaging();
    if (!msg) {
      console.warn('⚠️  Firebase Messaging is not available.');
      return null;
    }

    // Explicitly register and wait for service worker to ensure it's in a good state
    console.log('🔄 Registering Service Worker for FCM...');
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      
      // Wait for the service worker to be ready and active
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker is ready and active');
    } catch (swError) {
      console.error('❌ Failed to register Service Worker:', swError);
    }

    console.log('🔄 Requesting FCM token (this may fail if VAPID key is mismatched)...');
    try {
      const token = await getToken(msg, { 
        vapidKey: vapidKey.trim(),
        serviceWorkerRegistration: registration
      });

      if (!token) {
        console.warn('⚠️  Failed to obtain FCM browser token (returned empty).');
        return null;
      }

      console.log('✅ Obtained FCM browser token successfully');
      return token;
    } catch (getTokenError: any) {
      if (getTokenError.message?.includes('missing required authentication credential')) {
        console.error('❌ FCM AUTH ERROR: "Missing authentication credential".');
        console.error('   POSSIBLE CAUSES:');
        console.error('   1. The VAPID Key in .env does not match the one in Firebase Console (Settings -> Cloud Messaging -> Web Push certificates).');
        console.error('   2. The API Key used has "API Restrictions" in Google Cloud Console that do not include "Firebase Cloud Messaging API".');
        console.error('   3. The Firebase Messaging Service is not enabled for this project.');
      }
      throw getTokenError;
    }
  } catch (error) {
    console.error('❌ Error while obtaining FCM browser token:', error);
    return null;
  }
};

export { app, auth, db, storage, isFirebaseConfigured };
