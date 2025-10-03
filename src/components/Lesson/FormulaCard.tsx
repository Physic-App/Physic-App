import React from 'react';

interface FormulaCardProps {
  formula: string;
  description?: string;
  variables?: { symbol: string; meaning: string }[];
  className?: string;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ 
  formula, 
  description, 
  variables = [], 
  className = '' 
}) => {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-6 my-6 ${className}`}>
      <div className="text-center">
        <div className="text-2xl font-mono font-bold text-blue-900 dark:text-blue-100 mb-3">
          {formula}
        </div>
        {description && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
            {description}
          </p>
        )}
      </div>
      
      {variables.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Variables:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {variables.map((variable, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-blue-800 dark:text-blue-200">
                  {variable.symbol}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {variable.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaCard;
