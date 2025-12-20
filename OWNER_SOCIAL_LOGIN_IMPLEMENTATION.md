# Owner Social Login Implementation - Firebase + Laravel

## Overview
Implemented Firebase social login for company owners (similar to client flow) using hybrid architecture where Firebase handles authentication and Laravel issues API tokens.

## Architecture

### Hybrid Flow: Firebase + Laravel
- **Firebase**: Handles OAuth2 authentication (Google/Apple)
- **Laravel**: Validates Firebase tokens, manages users, issues Sanctum tokens
- **Next.js Frontend**: Uses Firebase SDK, sends ID token to Laravel

## Database Changes

### Migration: `2025_12_19_130000_add_firebase_fields_to_users_table.php`
Added fields to `users` table:
- `firebase_uid` - Unique Firebase user identifier
- `provider` - OAuth provider (google.com, apple.com)
- `provider_id` - Provider's user ID
- `email_verified` - Boolean for email verification status
- `email_verified_at` - Timestamp when email was verified
- `profile_photo_path` - URL to profile photo from Firebase

## Model Updates

### User Model (`app/Models/User.php`)
Updated `$fillable` array to include:
```php
'firebase_uid',
'provider', 
'provider_id',
'email_verified',
'email_verified_at',
'profile_photo_path',
```

## Controller Implementation

### AuthController (`app/Http/Controllers/Api/AuthController.php`)

#### New Methods:
1. **`verifyFirebaseIdToken(string $idToken): array`**
   - Verifies Firebase ID token with Firebase Admin SDK
   - Returns user data: uid, email, name, picture, email_verified

2. **Enhanced `register(Request $request)`**
   - Supports both traditional and Firebase social registration
   - Auto-creates user if doesn't exist
   - Updates Firebase profile data
   - Issues Laravel Sanctum token

3. **Enhanced `login(Request $request)`**
   - Supports both traditional and Firebase social login
   - Finds user by firebase_uid or email
   - Updates profile data from Firebase
   - Issues Laravel Sanctum token

## API Endpoints

### Authentication Routes (`routes/api.php`)
```php
Route::prefix('auth')->group(function () {
    // Support both traditional and Firebase social login
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        Route::get('/profile/company', [AuthController::class, 'getCompanyProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/fcm-token', [AuthController::class, 'updateFcmToken']);
    });
});
```

## Request/Response Formats

### Social Registration/Login Request
```json
{
  "idToken": "firebase_id_token_here",
  "provider": "google.com", // or "apple.com"
  "fcm_browser_token": "notification_token_optional"
}
```

### Successful Response
```json
{
  "status": "success",
  "message": "Usuario registrado exitosamente", // or "Login exitoso"
  "user": {
    "id": 123,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "firebase_uid": "firebase_uid_123",
    "provider": "google.com",
    "profile_photo_path": "https://lh3.googleusercontent.com/...",
    "email_verified": true,
    "is_active": true,
    "created_at": "2025-12-19T13:00:00.000000Z",
    "updated_at": "2025-12-19T13:00:00.000000Z"
  },
  "access_token": "sanctum_token_here",
  "token_type": "Bearer"
}
```

## Next.js Integration

### 1. Firebase Configuration
```javascript
// firebase.config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 2. Social Login Component
```javascript
// components/OwnerAuth.js
import { signInWithPopup, GoogleAuthProvider, getIdToken } from 'firebase/auth';
import { auth } from './firebase.config';

const loginWithGoogle = async () => {
  try {
    // 1. Authenticate with Firebase
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // 2. Get Firebase ID Token
    const idToken = await user.getIdToken();
    
    // 3. Send to Laravel
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        idToken: idToken,
        provider: 'google.com',
        fcm_browser_token: fcmToken, // optional
      }),
    });
    
    const data = await response.json();
    
    // 4. Store Laravel token
    if (data.status === 'success') {
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect to dashboard
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### 3. Apple Login Component
```javascript
const loginWithApple = async () => {
  try {
    const provider = new AppleAuthProvider();
    provider.addScope('email');
    provider.addScope('name');
    
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    
    // Same flow as Google...
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: idToken,
        provider: 'apple.com',
      }),
    });
    
    // Handle response...
  } catch (error) {
    console.error('Apple login error:', error);
  }
};
```

## Flow Summary

### Registration Flow (New User)
1. **Next.js**: User clicks "Register with Google/Apple"
2. **Firebase**: OAuth popup → User authenticates
3. **Firebase**: Returns ID token and user data
4. **Next.js**: Sends ID token to `/api/auth/register`
5. **Laravel**: Verifies Firebase token → Creates user → Issues Sanctum token
6. **Next.js**: Stores Laravel token → Redirects to dashboard

### Login Flow (Existing User)
1. **Next.js**: User clicks "Login with Google/Apple"
2. **Firebase**: OAuth popup → User authenticates
3. **Firebase**: Returns ID token
4. **Next.js**: Sends ID token to `/api/auth/login`
5. **Laravel**: Verifies token → Finds user → Updates data → Issues token
6. **Next.js**: Stores Laravel token → Redirects to dashboard

## Security Features

- **Firebase Token Verification**: Laravel validates every Firebase ID token
- **Token Expiration**: Firebase tokens expire after 1 hour
- **User Matching**: Finds users by firebase_uid or email
- **Data Sync**: Updates profile data from Firebase on each login
- **Sanctum Tokens**: Laravel issues its own API tokens for session management

## Migration Required

Run the migration to add Firebase fields to users table:

```bash
php artisan migrate
```

## Testing

### Test with Postman/cURL
```bash
# Social Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "your_firebase_id_token",
    "provider": "google.com"
  }'

# Social Registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "your_firebase_id_token", 
    "provider": "google.com",
    "fcm_browser_token": "optional_fcm_token"
  }'
```

## Benefits

1. **Security**: Firebase handles OAuth2 securely
2. **Flexibility**: Laravel controls business logic
3. **Consistency**: Same Sanctum tokens for all auth methods
4. **Scalability**: Separation of concerns
5. **User Experience**: One-click social login
6. **Data Sync**: Automatic profile updates from Firebase

## Files Modified/Created

- `/database/migrations/2025_12_19_130000_add_firebase_fields_to_users_table.php` - New migration
- `/app/Models/User.php` - Updated fillable fields
- `/app/Http/Controllers/Api/AuthController.php` - Added Firebase support
- `/routes/api.php` - Updated routes (removed old Firebase routes)
- `/OWNER_SOCIAL_LOGIN_IMPLEMENTATION.md` - This documentation
