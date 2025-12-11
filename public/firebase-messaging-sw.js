// Firebase Cloud Messaging service worker
// Docs: https://firebase.google.com/docs/cloud-messaging/js/receive

// Import the Firebase scripts for the service worker (compat version works bien con apps v9 modular)
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// IMPORTANTE: Estos valores deben coincidir con los de tu proyecto Firebase
// Puedes ajustarlos si cambian en el futuro.
firebase.initializeApp({
  apiKey: 'AIzaSyBovARunwRXUnSWy0fzZXGhdv0hKx2s2n0',
  authDomain: 'menushenu-2828b.firebaseapp.com',
  projectId: 'menushenu-2828b',
  storageBucket: 'menushenu-2828b.firebasestorage.app',
  messagingSenderId: '680910624455',
  appId: '1:680910624455:web:xxxxxxxxxxxxxxxx', // opcional, no crítico para FCM en SW
});

const messaging = firebase.messaging();

// Manejo opcional de notificaciones en segundo plano
// Aquí puedes personalizar cómo se muestran las notificaciones cuando la app está cerrada.

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Nueva notificación';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    data: payload.data || {},
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
