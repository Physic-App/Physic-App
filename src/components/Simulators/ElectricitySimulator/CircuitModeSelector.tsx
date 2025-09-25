import React from 'react';
import { CircuitMode } from './types/circuit';
import { ThemeMode } from './hooks/useCircuitState';
import { GitBranch, Minus, Network } from 'lucide-react';

interface CircuitModeSelectorProps {
  mode: CircuitMode;
  onModeChange: (mode: CircuitMode) => void;
  themeMode: ThemeMode;
}

export const CircuitModeSelector: React.FC<CircuitModeSelectorProps> = ({ mode, onModeChange, themeMode }) => {
  const modes = [
    { id: 'series' as CircuitMode, name: 'Series', icon: Minus, description: 'Components in sequence' },
    { id: 'parallel' as CircuitMode, name: 'Parallel', icon: GitBranch, description: 'Components in branches' },
    { id: 'mixed' as CircuitMode, name: 'Mixed', icon: Network, description: 'Combined circuits' }
  ];

  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 ${
      themeMode === 'dark' ? 'bg-gray-800/90 border-gray-600' : 'bg-white/90 border-blue-100'
    }`}>
      <div className={`p-5 border-b transition-colors duration-300 ${
        themeMode === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <h3 className={`text-xl font-bold mb-1 ${
          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Circuit Mode</h3>
        <p className={`text-sm font-medium ${
          themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>Select circuit configuration</p>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 gap-2">
          {modes.map((modeOption) => {
            const IconComponent = modeOption.icon;
            const isSelected = mode === modeOption.id;
            
            return (
              <button
                key={modeOption.id}
                onClick={() => onModeChange(modeOption.id)}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200' 
                    : themeMode === 'dark'
                      ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 hover:shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                <div className={`p-3 rounded-xl shadow-md ${
                  isSelected ? 'bg-gradient-to-r from-blue-100 to-indigo-100' : themeMode === 'dark' ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <IconComponent className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-left">
                  <div className={`font-semibold text-sm ${
                    isSelected ? 'text-blue-900' : themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {modeOption.name}
                  </div>
                  <div className={`text-xs font-medium ${
                    isSelected ? 'text-blue-600' : themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {modeOption.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
