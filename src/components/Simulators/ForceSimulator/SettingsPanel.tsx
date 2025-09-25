import { useState } from 'react';
import { X, Globe, Eye, Zap, Gauge } from 'lucide-react';

interface SettingsPanelProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Environment Settings */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Environment
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Gravity</label>
                <select
                  value={localSettings.environment}
                  onChange={(e) => handleSettingChange('environment', e.target.value)}
                  className="w-full p-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="earth">Earth (9.81 m/s²)</option>
                  <option value="moon">Moon (1.62 m/s²)</option>
                  <option value="mars">Mars (3.71 m/s²)</option>
                  <option value="space">Space (0 m/s²)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Simulation Speed</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={localSettings.simulationSpeed}
                  onChange={(e) => handleSettingChange('simulationSpeed', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-sm text-slate-400 mt-1">{localSettings.simulationSpeed.toFixed(1)}x</div>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Display Options
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localSettings.showGrid}
                  onChange={(e) => handleSettingChange('showGrid', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300">Show Grid</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localSettings.showTrajectory}
                  onChange={(e) => handleSettingChange('showTrajectory', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300">Show Trajectory</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localSettings.showVectors}
                  onChange={(e) => handleSettingChange('showVectors', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                />
                <span className="text-slate-300">Show Force Vectors</span>
              </label>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Advanced
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Physics Accuracy</label>
                <select
                  value="high"
                  className="w-full p-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">High (Realistic)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="low">Low (Fast)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Collision Detection</label>
                <select
                  value="realistic"
                  className="w-full p-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="realistic">Realistic</option>
                  <option value="simplified">Simplified</option>
                  <option value="off">Off</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              Save Settings
            </button>
            <button
              onClick={() => {
                const defaultSettings = {
                  theme: 'dark',
                  showGrid: true,
                  showTrajectory: true,
                  showVectors: true,
                  simulationSpeed: 1.0,
                  environment: 'earth'
                };
                setLocalSettings(defaultSettings);
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
