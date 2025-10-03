import React from 'react';
import { BookOpen } from 'lucide-react';

interface DefinitionBoxProps {
  term: string;
  definition: string;
  type?: 'definition' | 'concept' | 'law' | 'principle';
  className?: string;
}

const DefinitionBox: React.FC<DefinitionBoxProps> = ({ 
  term, 
  definition, 
  type = 'definition',
  className = '' 
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'law':
        return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      case 'principle':
        return 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20';
      case 'concept':
        return 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'law':
        return '⚖️';
      case 'principle':
        return '🔬';
      case 'concept':
        return '💡';
      default:
        return '📖';
    }
  };

  return (
    <div className={`border-l-4 ${getTypeStyles()} rounded-r-lg p-4 my-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0">
          {getTypeIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {type}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            {term}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {definition}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DefinitionBox;
