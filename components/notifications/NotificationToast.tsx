'use client';

import { useEffect, useState } from 'react';
import { Bell, X, ShoppingCart } from 'lucide-react';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'order';
  duration?: number;
  onClick?: () => void;
}

interface NotificationToastProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            notification-toast pointer-events-auto
            relative overflow-hidden rounded-lg shadow-lg border
            ${notification.type === 'order' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}
            ${notification.onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}
          `}
          onClick={notification.onClick}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          {/* Animated border pulse for order notifications */}
          {notification.type === 'order' && (
            <div
              className="absolute inset-0 border-2 border-emerald-400 rounded-lg animate-pulse"
            />
          )}

          <div className="relative p-4 flex items-start gap-3">
            {/* Icon */}
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              ${notification.type === 'order' ? 'bg-emerald-100 animate-bounce' : 'bg-slate-100'}
            `}>
              {notification.type === 'order' ? (
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
              ) : (
                <Bell className="h-5 w-5 text-slate-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={`
                font-semibold text-sm mb-1
                ${notification.type === 'order' ? 'text-emerald-900' : 'text-slate-900'}
              `}>
                {notification.title}
              </h4>
              <p className={`
                text-sm
                ${notification.type === 'order' ? 'text-emerald-700' : 'text-slate-600'}
              `}>
                {notification.message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.id);
              }}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          {notification.duration && (
            <div className="h-1 bg-slate-200 overflow-hidden">
              <div
                className={`h-full ${notification.type === 'order' ? 'bg-emerald-400' : 'bg-slate-400'}`}
                style={{
                  animation: `shrinkWidth ${notification.duration}ms linear`
                }}
              />
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export function useNotificationToast() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const showNotification = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const duration = notification.duration || 5000;

    const newNotification: ToastNotification = {
      ...notification,
      id,
      duration,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-dismiss after duration
    setTimeout(() => {
      dismissNotification(id);
    }, duration);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const showOrderNotification = (orderData: { id?: string; customer_name?: string; total?: string }) => {
    showNotification({
      title: '🛒 ¡Nueva Orden Recibida!',
      message: `Orden #${orderData.id || 'Nueva'} de ${orderData.customer_name || 'Cliente'} - Total: $${orderData.total || '0.00'}`,
      type: 'order',
      duration: 8000,
      onClick: () => {
        window.location.href = '/dashboard/ordenes-pendientes';
      },
    });
  };

  return {
    notifications,
    showNotification,
    showOrderNotification,
    dismissNotification,
  };
}
