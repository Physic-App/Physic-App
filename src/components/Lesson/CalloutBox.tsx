import React from 'react';
import { AlertCircle, Lightbulb, AlertTriangle, Info } from 'lucide-react';

interface CalloutBoxProps {
  type: 'info' | 'warning' | 'tip' | 'important';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const CalloutBox: React.FC<CalloutBoxProps> = ({ 
  type, 
  title, 
  children, 
  className = '' 
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20',
          icon: 'text-orange-600 dark:text-orange-400',
          title: 'text-orange-800 dark:text-orange-200'
        };
      case 'tip':
        return {
          container: 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20',
          icon: 'text-green-600 dark:text-green-400',
          title: 'text-green-800 dark:text-green-200'
        };
      case 'important':
        return {
          container: 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200'
        };
      default:
        return {
          container: 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5" />;
      case 'important':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'warning':
        return 'Warning';
      case 'tip':
        return 'Tip';
      case 'important':
        return 'Important';
      default:
        return 'Information';
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`border-l-4 ${styles.container} rounded-r-lg p-4 my-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-semibold mb-2 ${styles.title}`}>
            {title || getDefaultTitle()}
          </h4>
          <div className="text-gray-700 dark:text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalloutBox;
