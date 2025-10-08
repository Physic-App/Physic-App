import React from 'react';

interface FormulaPanelProps {
  title: string;
  formulas: string[];
}

export const FormulaPanel: React.FC<FormulaPanelProps> = ({ title, formulas }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="space-y-2">
        {formulas.map((formula, index) => (
          <div key={index} className="text-gray-200 font-mono text-sm">
            {formula}
          </div>
        ))}
      </div>
    </div>
  );
};