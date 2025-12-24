import { useState, useEffect } from 'react';
import { notificationService } from '@/lib/notifications';

export function useNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'Notification' in window && 
                       'serviceWorker' in navigator && 
                       'PushManager' in window;
      setIsSupported(supported);

      if (supported) {
        const initialized = await notificationService.initialize();
        setIsInitialized(initialized);
      }
    };

    checkSupport();
  }, []);

  return {
    isSupported,
    isInitialized,
    notify: notificationService.notify.bind(notificationService),
    notifyNewOrder: notificationService.notifyNewOrder.bind(notificationService),
    playSound: notificationService.playNotificationSound.bind(notificationService),
    getToken: () => notificationService.getToken()
  };
}
