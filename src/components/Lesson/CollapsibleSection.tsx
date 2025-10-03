import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  type?: 'derivation' | 'example' | 'proof' | 'note';
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultOpen = false,
  type = 'note',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getTypeStyles = () => {
    switch (type) {
      case 'derivation':
        return {
          header: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
          icon: 'text-purple-600 dark:text-purple-400',
          title: 'text-purple-800 dark:text-purple-200'
        };
      case 'example':
        return {
          header: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
          icon: 'text-green-600 dark:text-green-400',
          title: 'text-green-800 dark:text-green-200'
        };
      case 'proof':
        return {
          header: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200'
        };
      default:
        return {
          header: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700',
          icon: 'text-gray-600 dark:text-gray-400',
          title: 'text-gray-800 dark:text-gray-200'
        };
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'derivation':
        return '🧮';
      case 'example':
        return '💡';
      case 'proof':
        return '🔍';
      default:
        return '📝';
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden my-4 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${styles.header}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">
              {getTypeIcon()}
            </span>
            <h3 className={`font-semibold ${styles.title}`}>
              {title}
            </h3>
          </div>
          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
