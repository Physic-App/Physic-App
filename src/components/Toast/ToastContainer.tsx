import React from 'react';
import { ToastMessage } from '../../types';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getTitle = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success': return 'Great Job!';
      case 'error': return 'Oops!';
      case 'warning': return 'Heads Up!';
      default: return 'Info';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} show min-w-80 max-w-96 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-l-4 opacity-0 transform translate-x-full transition-all duration-300 ease-in-out`}
          style={{
            borderLeftColor: 
              toast.type === 'success' ? '#10B981' :
              toast.type === 'error' ? '#EF4444' :
              toast.type === 'warning' ? '#F59E0B' : '#3B82F6'
          }}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${
              toast.type === 'success' ? 'text-green-600' :
              toast.type === 'error' ? 'text-red-600' :
              toast.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
            }`}>
              {getIcon(toast.type)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {getTitle(toast.type)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        .toast.show {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;