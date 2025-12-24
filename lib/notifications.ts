import { getFirebaseMessaging, getFcmBrowserToken } from './firebase';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  sound?: string;
}

interface MessagePayload {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    badge?: string;
  };
  data?: Record<string, any>;
}

class NotificationService {
  private audio: HTMLAudioElement | null = null;
  private isSupported = false;
  private token: string | null = null;

  constructor() {
    this.initializeAudio();
    this.checkSupport();
  }

  private initializeAudio() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio('/audio.mp3');
      this.audio.volume = 0.5;
    }
  }

  private async checkSupport() {
    if (typeof window === 'undefined') {
      this.isSupported = false;
      return;
    }

    this.isSupported = 'Notification' in window && 
                     'serviceWorker' in navigator && 
                     'PushManager' in window;
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('⚠️ Notifications are not supported in this browser');
      return false;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ Notification permission not granted');
        return false;
      }

      // Get FCM token
      this.token = await getFcmBrowserToken();
      if (!this.token) {
        console.warn('⚠️ Could not get FCM token');
        return false;
      }

      // Setup foreground message handler (with error handling)
      try {
        this.setupForegroundMessageHandler();
      } catch (error) {
        console.warn('⚠️ Could not setup foreground message handler:', error);
        // Continue initialization even if foreground messages fail
      }
      
      console.log('✅ Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
      return false;
    }
  }

  private setupForegroundMessageHandler() {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.warn('⚠️ Firebase Messaging is not available');
      return;
    }

    // Check if onMessage method exists
    if (typeof messaging.onMessage !== 'function') {
      console.warn('⚠️ messaging.onMessage is not available. This might be due to missing service worker or Firebase configuration.');
      return;
    }

    // Handle foreground messages
    messaging.onMessage((payload: MessagePayload) => {
      console.log('📬 Received foreground message:', payload);
      
      const notification = payload.notification;
      const data = payload.data;

      if (notification) {
        this.showNotification({
          title: notification.title || 'Nueva Notificación',
          body: notification.body || '',
          icon: notification.icon || '/favicon.ico',
          badge: notification.badge || '/favicon.ico',
          tag: data?.tag || 'default',
          data: data,
          sound: data?.sound || 'bell'
        });
      }
    });
  }

  async showNotification(notificationData: NotificationData) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    try {
      // Play sound
      this.playSound(notificationData.sound || 'bell');

      // Show browser notification
      const notification = new Notification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        data: notificationData.data,
        requireInteraction: false,
        silent: false
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        notification.close();
        
        // Handle navigation based on notification data
        if (notificationData.data?.url) {
          window.open(notificationData.data.url, '_blank');
        } else if (notificationData.data?.path) {
          window.location.href = notificationData.data.path;
        }
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }
  }

  private playSound(soundName: string = 'bell') {
    if (!this.audio) return;

    try {
      // Reset audio to start
      this.audio.currentTime = 0;
      this.audio.play().catch(error => {
        console.warn('⚠️ Could not play notification sound:', error);
      });
    } catch (error) {
      console.warn('⚠️ Error playing sound:', error);
    }
  }

  async playNotificationSound() {
    this.playSound('bell');
  }

  getToken(): string | null {
    return this.token;
  }

  isInitialized(): boolean {
    return this.isSupported && this.token !== null;
  }

  // Order-specific notification
  notifyNewOrder(orderData: any) {
    this.showNotification({
      title: '🛒 ¡Nueva Orden Recibida!',
      body: `Orden #${orderData.id || 'Nueva'} de ${orderData.customer_name || 'Cliente'} - Total: $${orderData.total || '0.00'}`,
      icon: '/favicon.ico',
      tag: 'new-order',
      data: {
        type: 'new_order',
        orderId: orderData.id,
        url: '/dashboard/ordenes-pendientes'
      },
      sound: 'bell'
    });
  }

  // Generic notification method
  notify(title: string, body: string, options: Partial<NotificationData> = {}) {
    this.showNotification({
      title,
      body,
      icon: '/favicon.ico',
      sound: 'bell',
      ...options
    });
  }
}

// Singleton instance
export const notificationService = new NotificationService();
