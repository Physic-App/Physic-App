import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2, Zap, RotateCw } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface VisualFeedbackSystemProps {
  themeMode: 'light' | 'dark';
}

export const VisualFeedbackSystem: React.FC<VisualFeedbackSystemProps> = ({ themeMode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Set loading state
  const setLoading = useCallback((elementId: string, isLoading: boolean) => {
    setLoadingStates(prev => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(elementId);
      } else {
        newSet.delete(elementId);
      }
      return newSet;
    });
  }, []);

  // Set hover state
  const setHover = useCallback((elementId: string | null) => {
    setHoveredElement(elementId);
  }, []);

  // Expose methods globally for use throughout the app
  useEffect(() => {
    (window as any).visualFeedback = {
      addNotification,
      removeNotification,
      setLoading,
      setHover,
      success: (title: string, message: string, duration?: number) => 
        addNotification({ type: 'success', title, message, duration }),
      error: (title: string, message: string, duration?: number) => 
        addNotification({ type: 'error', title, message, duration }),
      warning: (title: string, message: string, duration?: number) => 
        addNotification({ type: 'warning', title, message, duration }),
      info: (title: string, message: string, duration?: number) => 
        addNotification({ type: 'info', title, message, duration }),
      loading: (title: string, message: string) => 
        addNotification({ type: 'loading', title, message, duration: 0 })
    };
  }, [addNotification, setLoading, setHover]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    const baseStyles = "p-4 rounded-lg border shadow-lg max-w-sm";
    
    switch (type) {
      case 'success':
        return `${baseStyles} ${
          themeMode === 'dark' 
            ? 'bg-green-900/20 border-green-700 text-green-300' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`;
      case 'error':
        return `${baseStyles} ${
          themeMode === 'dark' 
            ? 'bg-red-900/20 border-red-700 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`;
      case 'warning':
        return `${baseStyles} ${
          themeMode === 'dark' 
            ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`;
      case 'info':
        return `${baseStyles} ${
          themeMode === 'dark' 
            ? 'bg-blue-900/20 border-blue-700 text-blue-300' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`;
      case 'loading':
        return `${baseStyles} ${
          themeMode === 'dark' 
            ? 'bg-gray-800 border-gray-700 text-gray-300' 
            : 'bg-white border-gray-200 text-gray-800'
        }`;
    }
  };

  return (
    <>
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`${getNotificationStyles(notification.type)} transform transition-all duration-300 ease-in-out`}
            role="alert"
            aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
          >
            <div className="flex items-start space-x-3">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="mt-2 text-sm font-medium underline hover:no-underline"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className={`p-1 rounded transition-colors duration-200 ${
                  themeMode === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Close notification"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {loadingStates.size > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className={`p-6 rounded-xl border shadow-xl ${
            themeMode === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className={`text-lg font-medium ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Processing...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hover Effects CSS */}
      <style jsx>{`
        .hover-effect {
          transition: all 0.2s ease-in-out;
        }
        
        .hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .component-hover {
          transition: all 0.2s ease-in-out;
        }
        
        .component-hover:hover {
          filter: brightness(1.1);
          transform: scale(1.05);
        }
        
        .button-hover {
          transition: all 0.2s ease-in-out;
        }
        
        .button-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .button-hover:active {
          transform: translateY(0);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .slide-in {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .bounce-in {
          animation: bounceIn 0.5s ease-out;
        }
        
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        
        .glow {
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
          from {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          to {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
          }
        }
      `}</style>
    </>
  );
};

// Hook for using visual feedback
export const useVisualFeedback = () => {
  const visualFeedback = (window as any).visualFeedback;
  
  if (!visualFeedback) {
    console.warn('VisualFeedbackSystem not initialized');
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      loading: () => {},
      setLoading: () => {},
      setHover: () => {}
    };
  }
  
  return visualFeedback;
};
