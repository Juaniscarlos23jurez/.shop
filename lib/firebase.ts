import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

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

// Log Firebase configuration status
console.log('🔥 Firebase Configuration Check:');
console.log('  NEXT_PUBLIC_FIREBASE_API_KEY:', firebaseConfig.apiKey ? `✅ Set (${firebaseConfig.apiKey.substring(0, 10)}...)` : '❌ Missing');
console.log('  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', firebaseConfig.authDomain ? `✅ ${firebaseConfig.authDomain}` : '❌ Missing');
console.log('  NEXT_PUBLIC_FIREBASE_PROJECT_ID:', firebaseConfig.projectId ? `✅ ${firebaseConfig.projectId}` : '❌ Missing');
console.log('  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', firebaseConfig.storageBucket ? `✅ ${firebaseConfig.storageBucket}` : '❌ Missing');
console.log('  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', firebaseConfig.messagingSenderId ? `✅ ${firebaseConfig.messagingSenderId}` : '❌ Missing');
console.log('  NEXT_PUBLIC_FIREBASE_APP_ID:', firebaseConfig.appId ? `✅ Set (${firebaseConfig.appId.substring(0, 15)}...)` : '❌ Missing');
console.log('  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:', firebaseConfig.measurementId ? `✅ ${firebaseConfig.measurementId}` : '⚠️  Optional - Missing');
console.log('  NEXT_PUBLIC_FIREBASE_DATABASE_URL:', firebaseConfig.databaseURL ? `✅ ${firebaseConfig.databaseURL}` : '⚠️  Optional - Missing');

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
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured()) {
  try {
    console.log('✅ Firebase configuration is valid. Initializing...');
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getDatabase(app);
    storage = getStorage(app);
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

export { app, auth, db, storage, isFirebaseConfigured };
