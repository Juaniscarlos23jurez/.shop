# Solución al Error de Firebase en Producción

## Problema
Error en producción: `Firebase: Error (auth/invalid-api-key)`

Este error ocurre porque Firebase intenta inicializarse con variables de entorno que no están configuradas en tu servidor de producción.

## Solución Implementada

### 1. Validación de Configuración
Actualicé `/lib/firebase.ts` para:
- ✅ Verificar que todas las variables de Firebase estén configuradas antes de inicializar
- ✅ Mostrar logs detallados de qué variables están presentes y cuáles faltan
- ✅ Prevenir que Firebase se inicialice con API keys inválidas
- ✅ Hacer que Firebase sea opcional si no está configurado

### 2. Logs Agregados
Ahora verás en la consola del navegador:
```
🔥 Firebase Configuration Check:
  NEXT_PUBLIC_FIREBASE_API_KEY: ✅ Set (AIzaSyB...) o ❌ Missing
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ✅ tu-proyecto.firebaseapp.com o ❌ Missing
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: ✅ tu-proyecto o ❌ Missing
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ✅ tu-proyecto.appspot.com o ❌ Missing
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ✅ 123456789 o ❌ Missing
  NEXT_PUBLIC_FIREBASE_APP_ID: ✅ Set (1:123456789...) o ❌ Missing
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ✅ G-XXXXXXXXXX o ⚠️ Optional - Missing
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: ✅ https://... o ⚠️ Optional - Missing
```

## Cómo Configurar Variables de Entorno en Producción

### Opción 1: Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las siguientes variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com
```

4. Redeploy tu aplicación

### Opción 2: Netlify
1. Site settings → Environment variables
2. Agrega las mismas variables que arriba
3. Redeploy

### Opción 3: Otros Proveedores
Busca la sección de "Environment Variables" o "Build Settings" y agrega las variables.

## Dónde Obtener los Valores de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a Project Settings (⚙️ icono)
4. Scroll hasta "Your apps" → Web app
5. En "SDK setup and configuration", selecciona "Config"
6. Copia los valores de `firebaseConfig`

Ejemplo:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "proyecto.firebaseapp.com",  // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "proyecto",            // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "proyecto.appspot.com",   // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",   // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abc123",  // → NEXT_PUBLIC_FIREBASE_APP_ID
  measurementId: "G-XXXXXXXXXX"     // → NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

## Verificar la Solución

1. Despliega los cambios a producción
2. Abre la consola del navegador en tu sitio de producción
3. Busca los logs de "🔥 Firebase Configuration Check:"
4. Verifica que todas las variables requeridas muestren ✅
5. Si alguna muestra ❌, configúrala en tu plataforma de deployment

## Variables Requeridas vs Opcionales

### ✅ Requeridas (el app no funcionará sin estas):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### ⚠️ Opcionales (el app funcionará sin estas):
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (solo para Analytics)
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL` (solo si usas Realtime Database)

## Comportamiento Actual

### Si Firebase NO está configurado:
- ✅ La app seguirá funcionando
- ✅ Las funciones que usan Firebase fallarán gracefully
- ⚠️ No podrás subir imágenes (usa URLs externas temporalmente)
- ⚠️ No podrás usar autenticación de Firebase

### Si Firebase SÍ está configurado:
- ✅ Todas las funciones de Firebase funcionarán normalmente
- ✅ Podrás subir imágenes a Firebase Storage
- ✅ Autenticación funcionará correctamente

## Notas Importantes

1. **Prefijo NEXT_PUBLIC_**: Es OBLIGATORIO para que Next.js exponga estas variables al navegador
2. **Rebuild requerido**: Después de agregar variables, debes hacer redeploy
3. **No son secretas**: Estas variables son públicas y se envían al navegador (es normal en Firebase)
4. **Seguridad**: Firebase usa reglas de seguridad en el backend, no en las API keys del frontend

## Solución Temporal (Sin Firebase)

Si no quieres configurar Firebase ahora, la app funcionará pero:
- Usa URLs de imágenes externas (Imgur, Cloudinary, etc.)
- Las funciones de subida de archivos no funcionarán
- Verás warnings en la consola pero no errores

## Próximos Pasos

1. ✅ Verifica los logs en producción
2. ✅ Configura las variables de entorno faltantes
3. ✅ Redeploy la aplicación
4. ✅ Verifica que el error desaparezca
