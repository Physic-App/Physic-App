import React from 'react';
import { Activity, Zap, Gauge, Power, AlertTriangle } from 'lucide-react';
import { CircuitData, Component } from './types/circuit';
import { ThemeMode } from './hooks/useCircuitState';

interface DataPanelProps {
  circuitData: CircuitData;
  components: Component[];
  isSimulating: boolean;
  themeMode: ThemeMode;
}

export const DataPanel: React.FC<DataPanelProps> = ({ circuitData, components, isSimulating, themeMode }) => {
  const formatValue = (value: number, unit: string, decimals: number = 2) => {
    return `${value.toFixed(decimals)} ${unit}`;
  };

  const getStatusColor = () => {
    if (circuitData.isShortCircuit || circuitData.fuseBlown) return 'text-red-600';
    if (isSimulating && circuitData.totalCurrent > 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStatusText = () => {
    if (circuitData.isShortCircuit) return 'Short Circuit!';
    if (circuitData.fuseBlown) return 'Fuse Blown!';
    if (isSimulating && circuitData.totalCurrent > 0) return 'Circuit Active';
    if (isSimulating) return 'No Current Flow';
    return 'Simulation Stopped';
  };

  const bulbs = components.filter(c => c.type === 'bulb');

  return (
    <div className="space-y-4">
      {/* Circuit Status */}
      <div className={`backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 ${
        themeMode === 'dark' ? 'bg-gray-800/90 border-gray-600' : 'bg-white/90 border-blue-100'
      }`}>
        <div className={`p-5 border-b transition-colors duration-300 ${
          themeMode === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Circuit Status</h3>
            <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
              <div className={`w-3 h-3 rounded-full ${
                isSimulating && circuitData.totalCurrent > 0 && !circuitData.isShortCircuit && !circuitData.fuseBlown
                  ? 'bg-green-500 animate-pulse' 
                  : circuitData.isShortCircuit || circuitData.fuseBlown
                    ? 'bg-red-500'
                    : 'bg-gray-400'
              }`} />
              <span className="text-sm font-bold">{getStatusText()}</span>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={`text-sm font-bold ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Voltage</div>
                  <div className={`text-xs font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Total circuit voltage</div>
                </div>
              </div>
              <div className="text-xl font-black text-blue-700">
                {formatValue(circuitData.totalVoltage, 'V', 1)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={`text-sm font-bold ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Current</div>
                  <div className={`text-xs font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Current flow (I = V/R)</div>
                </div>
              </div>
              <div className="text-xl font-black text-green-700">
                {formatValue(circuitData.totalCurrent, 'A', 3)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                  <Gauge className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={`text-sm font-bold ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Resistance</div>
                  <div className={`text-xs font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Total circuit resistance</div>
                </div>
              </div>
              <div className="text-xl font-black text-red-700">
                {formatValue(circuitData.totalResistance, 'Ω', 1)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Power className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={`text-sm font-bold ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Power</div>
                  <div className={`text-xs font-medium ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Total power (P = VI)</div>
                </div>
              </div>
              <div className="text-xl font-black text-purple-700">
                {formatValue(circuitData.totalPower, 'W', 2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Details */}
      {bulbs.length > 0 && (
        <div className={`backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 ${
          themeMode === 'dark' ? 'bg-gray-800/90 border-gray-600' : 'bg-white/90 border-blue-100'
        }`}>
          <div className={`p-5 border-b transition-colors duration-300 ${
            themeMode === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
          }`}>
            <h3 className={`text-xl font-bold mb-1 ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Light Bulbs</h3>
            <p className={`text-sm font-medium ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Individual bulb status</p>
          </div>
          
          <div className="p-5 space-y-3">
            {bulbs.map((bulb, index) => {
              const brightness = bulb.properties.brightness || 0;
              const power = bulb.properties.power || 0;
              const current = bulb.properties.current || 0;
              
              return (
                <div key={bulb.id} className={`flex items-center justify-between p-4 rounded-xl border shadow-md transition-colors duration-300 ${
                  themeMode === 'dark' 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      brightness > 0 ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-300 border-gray-400'
                    }`} style={{ opacity: Math.max(0.3, brightness) }} />
                    <div>
                      <div className={`text-sm font-bold ${
                        themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Bulb {index + 1}</div>
                      <div className={`text-xs font-medium ${
                        themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {formatValue(power, 'W', 2)} • {formatValue(current * 1000, 'mA', 0)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {Math.round(brightness * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Physics Laws Reference */}
      <div className={`backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 ${
        themeMode === 'dark' ? 'bg-gray-800/90 border-gray-600' : 'bg-white/90 border-blue-100'
      }`}>
        <div className={`p-5 border-b transition-colors duration-300 ${
          themeMode === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
        }`}>
          <h3 className={`text-xl font-bold mb-1 ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Physics Laws</h3>
          <p className={`text-sm font-medium ${
            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>Fundamental electrical relationships</p>
        </div>
        
        <div className="p-5 space-y-3">
          <div className={`p-4 rounded-xl border shadow-md transition-colors duration-300 ${
            themeMode === 'dark' 
              ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-700' 
              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
          }`}>
            <div className={`text-sm font-mono font-black ${
              themeMode === 'dark' ? 'text-blue-300' : 'text-blue-800'
            }`}>V = I × R</div>
            <div className={`text-xs mt-1 font-semibold ${
              themeMode === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>Ohm's Law: Voltage = Current × Resistance</div>
          </div>
          
          <div className={`p-4 rounded-xl border shadow-md transition-colors duration-300 ${
            themeMode === 'dark' 
              ? 'bg-gradient-to-r from-green-900/30 to-green-800/30 border-green-700' 
              : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
          }`}>
            <div className={`text-sm font-mono font-black ${
              themeMode === 'dark' ? 'text-green-300' : 'text-green-800'
            }`}>P = V × I</div>
            <div className={`text-xs mt-1 font-semibold ${
              themeMode === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>Power Law: Power = Voltage × Current</div>
          </div>
          
          <div className={`p-4 rounded-xl border shadow-md transition-colors duration-300 ${
            themeMode === 'dark' 
              ? 'bg-gradient-to-r from-purple-900/30 to-purple-800/30 border-purple-700' 
              : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
          }`}>
            <div className={`text-sm font-mono font-black ${
              themeMode === 'dark' ? 'text-purple-300' : 'text-purple-800'
            }`}>P = I² × R</div>
            <div className={`text-xs mt-1 font-semibold ${
              themeMode === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`}>Joule's Law: Power = Current² × Resistance</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-md transition-colors duration-300 ${
            themeMode === 'dark' 
              ? 'bg-gradient-to-r from-cyan-900/30 to-cyan-800/30 border-cyan-700' 
              : 'bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200'
          }`}>
            <div className={`text-sm font-mono font-black ${
              themeMode === 'dark' ? 'text-cyan-300' : 'text-cyan-800'
            }`}>Q = C × V</div>
            <div className={`text-xs mt-1 font-semibold ${
              themeMode === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
            }`}>Capacitor Law: Charge = Capacitance × Voltage</div>
          </div>

          <div className={`p-4 rounded-xl border shadow-md transition-colors duration-300 ${
            themeMode === 'dark' 
              ? 'bg-gradient-to-r from-orange-900/30 to-orange-800/30 border-orange-700' 
              : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
          }`}>
            <div className={`text-sm font-mono font-black ${
              themeMode === 'dark' ? 'text-orange-300' : 'text-orange-800'
            }`}>E = ½CV²</div>
            <div className={`text-xs mt-1 font-semibold ${
              themeMode === 'dark' ? 'text-orange-400' : 'text-orange-600'
            }`}>Capacitor Energy: Energy = ½ × Capacitance × Voltage²</div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {(circuitData.isShortCircuit || circuitData.fuseBlown) && (
        <div className={`border-2 rounded-2xl p-5 shadow-xl transition-colors duration-300 ${
          themeMode === 'dark' 
            ? 'bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-700' 
            : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
        }`}>
          <div className={`flex items-center space-x-2 mb-2 ${
            themeMode === 'dark' ? 'text-red-300' : 'text-red-800'
          }`}>
            <AlertTriangle className="w-6 h-6" />
            <h4 className="font-black text-lg">Warning!</h4>
          </div>
          <p className={`text-sm font-semibold ${
            themeMode === 'dark' ? 'text-red-200' : 'text-red-700'
          }`}>
            {circuitData.isShortCircuit && "Short circuit detected! Current is too high."}
            {circuitData.fuseBlown && "Fuse has blown due to excessive current."}
            {" Check your circuit connections and component values."}
          </p>
        </div>
      )}
    </div>
  );
};
