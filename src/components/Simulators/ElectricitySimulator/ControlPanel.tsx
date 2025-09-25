import React from 'react';
import { Settings } from 'lucide-react';
import { ThemeMode } from './hooks/useCircuitState';

interface ControlPanelProps {
  voltage: number;
  onVoltageChange: (voltage: number) => void;
  isSimulating: boolean;
  themeMode: ThemeMode;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  voltage,
  onVoltageChange,
  isSimulating,
  themeMode
}) => {
  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 ${
      themeMode === 'dark' ? 'bg-gray-800/90 border-gray-600' : 'bg-white/90 border-blue-100'
    }`}>
      <div className={`p-5 border-b transition-colors duration-300 ${
        themeMode === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Control Panel</h3>
          </div>
        </div>
        <p className={`text-sm font-medium mt-1 ${
          themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>Adjust circuit parameters</p>
      </div>
      
      <div className="p-5 space-y-6">
        <div>
          <label className={`block text-sm font-bold mb-3 ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-700'
          }`}>
            Battery Voltage
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={voltage}
              onChange={(e) => onVoltageChange(Number(e.target.value))}
              disabled={isSimulating}
              className="flex-1 h-3 bg-gray-200 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #6366F1 ${(voltage - 1) / 23 * 100}%, #E5E7EB ${(voltage - 1) / 23 * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="min-w-0 flex-shrink-0">
              <span className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold shadow-lg">
                {voltage}V
              </span>
            </div>
          </div>
          <div className={`flex justify-between text-xs mt-2 font-medium ${
            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>1V</span>
            <span>24V</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className={`text-sm font-bold ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-700'
          }`}>Quick Settings</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '1.5V', value: 1.5 },
              { label: '3V', value: 3 },
              { label: '6V', value: 6 },
              { label: '9V', value: 9 },
              { label: '12V', value: 12 },
              { label: '24V', value: 24 }
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => onVoltageChange(preset.value)}
                disabled={isSimulating}
                className={`px-3 py-2 text-xs rounded-lg border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold ${
                  voltage === preset.value
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg'
                    : themeMode === 'dark'
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`border-2 rounded-xl p-4 transition-colors duration-300 ${
          themeMode === 'dark' 
            ? 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}>
          <h4 className={`text-sm font-bold mb-2 ${
            themeMode === 'dark' ? 'text-amber-300' : 'text-amber-800'
          }`}>⚠️ Safety Note</h4>
          <p className={`text-xs font-medium ${
            themeMode === 'dark' ? 'text-amber-200' : 'text-amber-700'
          }`}>
            High voltages can cause component damage. Monitor current flow to prevent overloads.
          </p>
        </div>
      </div>
    </div>
  );
};
