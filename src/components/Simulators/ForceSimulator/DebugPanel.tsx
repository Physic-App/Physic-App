import React, { useState, useEffect } from 'react';
import { Bug, Eye, EyeOff, Settings, Code } from 'lucide-react';
import { useNotifications } from './NotificationSystem';

interface DebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  simulationData?: any;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ 
  isVisible, 
  onToggle, 
  simulationData 
}) => {
  const [showRawData, setShowRawData] = useState(false);
  const [showPhysicsDebug, setShowPhysicsDebug] = useState(false);
  const [showPerformanceDebug, setShowPerformanceDebug] = useState(false);
  const { addNotification } = useNotifications();

  const handleExportDebugData = () => {
    if (!simulationData) {
      addNotification({
        type: 'warning',
        title: 'No Data',
        message: 'No simulation data available to export'
      });
      return;
    }

    const debugData = {
      timestamp: new Date().toISOString(),
      simulationData,
      performance: {
        memoryUsage: (performance as any).memory?.usedJSHeapSize,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physics-simulator-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Debug Data Exported',
      message: 'Debug information has been downloaded'
    });
  };

  const handleClearConsole = () => {
    console.clear();
    addNotification({
      type: 'info',
      title: 'Console Cleared',
      message: 'Browser console has been cleared'
    });
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 p-3 bg-slate-800 hover:bg-slate-700 rounded-full shadow-lg transition-colors z-50"
        title="Show Debug Panel"
      >
        <Bug className="w-5 h-5 text-slate-300" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-slate-700 z-50 w-80 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-orange-400" />
          <h3 className="text-sm font-semibold text-white">Debug Panel</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Debug Options */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Debug Options
          </h4>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                showRawData 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {showRawData ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              Raw Data
            </button>
            
            <button
              onClick={() => setShowPhysicsDebug(!showPhysicsDebug)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                showPhysicsDebug 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Settings className="w-3 h-3" />
              Physics
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Actions
          </h4>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportDebugData}
              className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Code className="w-3 h-3" />
              Export
            </button>
            
            <button
              onClick={handleClearConsole}
              className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs font-medium transition-colors"
            >
              Clear Console
            </button>
          </div>
        </div>

        {/* Debug Information */}
        {showRawData && simulationData && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Raw Data
            </h4>
            <div className="bg-slate-900 rounded-lg p-2 max-h-32 overflow-y-auto">
              <pre className="text-xs text-slate-300 font-mono">
                {JSON.stringify(simulationData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {showPhysicsDebug && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Physics Debug
            </h4>
            <div className="bg-slate-900 rounded-lg p-2 text-xs text-slate-300 space-y-1">
              <div>Time Step: 1/60s</div>
              <div>Gravity: 9.81 m/s²</div>
              <div>Max Velocity: 100 m/s</div>
              <div>Canvas Scale: 30px/m</div>
            </div>
          </div>
        )}

        {/* Performance Info */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Performance
          </h4>
          <div className="bg-slate-900 rounded-lg p-2 text-xs text-slate-300 space-y-1">
            <div>Memory: {Math.round(((performance as any).memory?.usedJSHeapSize || 0) / 1024 / 1024)}MB</div>
            <div>Viewport: {window.innerWidth}×{window.innerHeight}</div>
            <div>Device Pixel Ratio: {window.devicePixelRatio}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
