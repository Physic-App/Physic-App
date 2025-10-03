import React from 'react';
import { X, Battery, Lightbulb, Zap, ToggleLeft, Shield, Minus, Circle, Gauge, Activity } from 'lucide-react';
import { ThemeMode } from './hooks/useCircuitState';

interface ComponentInfoPanelProps {
  componentType: string;
  onClose: () => void;
  themeMode: ThemeMode;
}

const componentInfo = {
  battery: {
    icon: Battery,
    name: 'Battery',
    description: 'A battery is a device that converts chemical energy into electrical energy. It provides a constant voltage source for the circuit.',
    physics: 'Provides electromotive force (EMF) that drives current through the circuit.',
    formula: 'V = EMF - I×r (where r is internal resistance)',
    applications: ['Portable electronics', 'Automotive systems', 'Emergency power'],
    tips: 'Batteries have internal resistance that affects circuit performance.'
  },
  bulb: {
    icon: Lightbulb,
    name: 'Light Bulb',
    description: 'A light bulb converts electrical energy into light and heat energy. Its brightness depends on the power consumed.',
    physics: 'Resistance increases with temperature, following P = V²/R',
    formula: 'P = V×I = V²/R = I²×R',
    applications: ['Lighting systems', 'Indicators', 'Load testing'],
    tips: 'Brightness is proportional to power consumption. Higher current = brighter light.'
  },
  resistor: {
    icon: Zap,
    name: 'Resistor',
    description: 'A resistor opposes the flow of electric current, converting electrical energy into heat energy.',
    physics: 'Follows Ohm\'s Law: V = I×R',
    formula: 'V = I×R, P = I²×R',
    applications: ['Current limiting', 'Voltage division', 'Signal conditioning'],
    tips: 'Color bands indicate resistance value. Higher resistance = lower current.'
  },
  capacitor: {
    icon: Circle,
    name: 'Capacitor',
    description: 'A capacitor stores electrical energy in an electric field between two conducting plates.',
    physics: 'Stores charge Q = C×V and energy E = ½CV²',
    formula: 'Q = C×V, E = ½CV², I = C(dV/dt)',
    applications: ['Energy storage', 'Filtering', 'Timing circuits'],
    tips: 'Blocks DC current but allows AC current to pass through.'
  },
  switch: {
    icon: ToggleLeft,
    name: 'Switch',
    description: 'A switch controls the flow of current by opening or closing the circuit path.',
    physics: 'Provides infinite resistance when open, near-zero when closed',
    formula: 'R = ∞ (open), R ≈ 0 (closed)',
    applications: ['Circuit control', 'Safety systems', 'Logic circuits'],
    tips: 'Essential for controlling when current flows in a circuit.'
  },
  fuse: {
    icon: Shield,
    name: 'Fuse',
    description: 'A fuse protects circuits by breaking the connection when current exceeds a safe limit.',
    physics: 'Melts when I²R heating exceeds thermal capacity',
    formula: 'P = I²R (heating power)',
    applications: ['Overcurrent protection', 'Safety systems', 'Equipment protection'],
    tips: 'Always replace with same rating. Blown fuse indicates circuit problem.'
  },
  ammeter: {
    icon: Activity,
    name: 'Ammeter',
    description: 'An ammeter measures the current flowing through a circuit. It must be connected in series.',
    physics: 'Very low internal resistance to minimize circuit interference',
    formula: 'I = Q/t (current = charge/time)',
    applications: ['Current measurement', 'Circuit analysis', 'Troubleshooting'],
    tips: 'Always connect in series. Never connect directly across voltage source.'
  },
  voltmeter: {
    icon: Gauge,
    name: 'Voltmeter',
    description: 'A voltmeter measures the voltage difference between two points. It must be connected in parallel.',
    physics: 'Very high internal resistance to prevent current draw',
    formula: 'V = W/Q (voltage = work/charge)',
    applications: ['Voltage measurement', 'Circuit analysis', 'Troubleshooting'],
    tips: 'Always connect in parallel. High internal resistance prevents circuit loading.'
  },
  wire: {
    icon: Minus,
    name: 'Wire',
    description: 'Wires provide a low-resistance path for current to flow between components.',
    physics: 'Ideally zero resistance, but real wires have small resistance',
    formula: 'R = ρL/A (resistance depends on material, length, area)',
    applications: ['Component connection', 'Current distribution', 'Signal transmission'],
    tips: 'Thicker wires have lower resistance. Keep connections short when possible.'
  }
};

export const ComponentInfoPanel: React.FC<ComponentInfoPanelProps> = ({
  componentType,
  onClose,
  themeMode
}) => {
  const info = componentInfo[componentType as keyof typeof componentInfo];
  
  if (!info) return null;

  const IconComponent = info.icon;

  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 ${
      themeMode === 'dark' ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-blue-100'
    }`}>
      <div className={`p-4 border-b flex items-center justify-between transition-colors duration-300 ${
        themeMode === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            themeMode === 'dark' ? 'bg-gray-600' : 'bg-white'
          }`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <h3 className={`text-lg font-bold ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{info.name}</h3>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            themeMode === 'dark' 
              ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h4 className={`font-semibold text-sm mb-2 ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Description</h4>
          <p className={`text-sm ${
            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{info.description}</p>
        </div>

        <div>
          <h4 className={`font-semibold text-sm mb-2 ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Physics Principle</h4>
          <p className={`text-sm ${
            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{info.physics}</p>
        </div>

        <div>
          <h4 className={`font-semibold text-sm mb-2 ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Key Formula</h4>
          <div className={`p-3 rounded-lg font-mono text-sm ${
            themeMode === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-800'
          }`}>
            {info.formula}
          </div>
        </div>

        <div>
          <h4 className={`font-semibold text-sm mb-2 ${
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Applications</h4>
          <ul className={`text-sm space-y-1 ${
            themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {info.applications.map((app, index) => (
              <li key={index}>• {app}</li>
            ))}
          </ul>
        </div>

        <div className={`p-3 rounded-lg border ${
          themeMode === 'dark' 
            ? 'bg-blue-900/20 border-blue-700 text-blue-300' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <h4 className="font-semibold text-sm mb-1">💡 Pro Tip</h4>
          <p className="text-sm">{info.tips}</p>
        </div>
      </div>
    </div>
  );
};
