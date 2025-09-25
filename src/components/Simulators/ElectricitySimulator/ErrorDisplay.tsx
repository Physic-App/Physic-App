import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ThemeMode } from './hooks/useCircuitState';

interface ErrorDisplayProps {
  error: string | null;
  themeMode: ThemeMode;
  onClearError: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  themeMode,
  onClearError
}) => {
  if (!error) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-4">
      <div className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-lg ${
        themeMode === 'dark' 
          ? 'bg-red-900/20 border-red-700 text-red-300' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Error</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={onClearError}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            themeMode === 'dark' 
              ? 'hover:bg-red-800/30' 
              : 'hover:bg-red-100'
          }`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

