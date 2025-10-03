import React from 'react';
import { 
  Zap, 
  RotateCcw, 
  Play, 
  Pause, 
  Moon, 
  Sun, 
  BookOpen, 
  Undo, 
  Redo 
} from 'lucide-react';
import { ThemeMode } from './hooks/useCircuitState';

interface AppHeaderProps {
  themeMode: ThemeMode;
  isSimulating: boolean;
  isExperimentMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onToggleTheme: () => void;
  onToggleSimulation: () => void;
  onToggleExperimentMode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onResetCircuit: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  themeMode,
  isSimulating,
  isExperimentMode,
  canUndo,
  canRedo,
  onToggleTheme,
  onToggleSimulation,
  onToggleExperimentMode,
  onUndo,
  onRedo,
  onResetCircuit
}) => {
  return (
    <header className={`backdrop-blur-sm shadow-lg border-b transition-colors duration-300 ${
      themeMode === 'dark' ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Electric Circuit Simulator
              </h1>
              <p className={`text-sm font-medium ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Interactive Circuit Builder & Physics Explorer
              </p>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center space-x-4">
            {/* Undo/Redo Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canUndo
                    ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canRedo
                    ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Experiment Mode Toggle */}
            <button
              onClick={onToggleExperimentMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isExperimentMode 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {isExperimentMode ? 'Exit Guide' : 'Guided Mode'}
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                themeMode === 'dark' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-500 hover:to-orange-500' 
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900'
              }`}
            >
              {themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Simulation Toggle */}
            <button
              onClick={onToggleSimulation}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isSimulating 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
              }`}
            >
              {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isSimulating ? 'Pause' : 'Start'} Simulation
            </button>
            
            {/* Reset Button */}
            <button
              onClick={onResetCircuit}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

