import React from 'react';

interface FormulaPanelProps {
  title: string;
  formulas: string[];
  className?: string;
  showIcon?: boolean;
}

export const FormulaPanel: React.FC<FormulaPanelProps> = ({ 
  title, 
  formulas, 
  className = "",
  showIcon = true 
}) => {
  const getFormulaStyle = (formula: string) => {
    if (formula.includes('⚠️')) {
      return 'text-red-300 bg-red-900/20 border border-red-500/30 px-2 py-1 rounded';
    }
    if (formula.includes('°') || formula.includes('cm') || formula.includes('D')) {
      return 'text-blue-300 bg-blue-900/20 border border-blue-500/30 px-2 py-1 rounded';
    }
    if (formula.includes('=')) {
      return 'text-green-300 bg-green-900/20 border border-green-500/30 px-2 py-1 rounded';
    }
    return 'text-gray-200 bg-gray-700/30 border border-gray-500/30 px-2 py-1 rounded';
  };

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 border border-gray-600 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        {showIcon && (
          <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {title}
      </h3>
      <div className="space-y-2">
        {formulas.map((formula, index) => (
          <div key={index} className={`font-mono text-sm ${getFormulaStyle(formula)}`}>
            {formula}
          </div>
        ))}
      </div>
    </div>
  );
};