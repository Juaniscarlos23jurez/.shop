# Dashboard de Catálogo de Productos

Aplicación web desarrollada con Next.js y Firebase que permite a los usuarios autenticarse, ver catálogos de productos y realizar compras.

## Características

- Autenticación de usuarios con Firebase Auth
- Catálogo de productos con búsqueda y filtrado
- Carrito de compras con vista previa
- Páginas dinámicas para catálogos de usuario
- Diseño responsivo para móviles y escritorio

## Tecnologías

- Next.js 14
- TypeScript
- Firebase (Auth, Realtime Database)
- Tailwind CSS
- shadcn/ui

## Configuración

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   pnpm install
   ```
3. Crea un archivo `.env.local` con tus credenciales de Firebase
4. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

## Variables de Entorno

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
```
