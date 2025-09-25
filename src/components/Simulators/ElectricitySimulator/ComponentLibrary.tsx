import React, { useState } from 'react';
import { Battery, Lightbulb, Zap, ToggleLeft, Shield, Minus, Circle, Gauge, Activity, ChevronDown, Info } from 'lucide-react';
import { ThemeMode } from './hooks/useCircuitState';

interface ComponentLibraryProps {
  onToolSelect: (toolType: string) => void;
  selectedTool: string | null;
  themeMode: ThemeMode;
  onComponentInfo: (componentType: string) => void;
}

const componentData = [
  { 
    id: 'battery', 
    name: 'Battery', 
    icon: Battery, 
    description: 'Voltage source (DC power supply)', 
    color: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40',
    category: 'Power Sources'
  },
  { 
    id: 'bulb', 
    name: 'Light Bulb', 
    icon: Lightbulb, 
    description: 'Load component that converts electrical energy to light', 
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-800/40',
    category: 'Loads'
  },
  { 
    id: 'resistor', 
    name: 'Resistor', 
    icon: Zap, 
    description: 'Resistance element that opposes current flow', 
    color: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40',
    category: 'Passive Components'
  },
  { 
    id: 'capacitor', 
    name: 'Capacitor', 
    icon: Circle, 
    description: 'Stores electrical energy in an electric field', 
    color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-800/40',
    category: 'Passive Components'
  },
  { 
    id: 'switch', 
    name: 'Switch', 
    icon: ToggleLeft, 
    description: 'Circuit control device to open/close current path', 
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40',
    category: 'Control Elements'
  },
  { 
    id: 'fuse', 
    name: 'Fuse', 
    icon: Shield, 
    description: 'Protection device that breaks circuit on overcurrent', 
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40',
    category: 'Protection'
  },
  { 
    id: 'ammeter', 
    name: 'Ammeter', 
    icon: Activity, 
    description: 'Measures current flow in the circuit', 
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/40',
    category: 'Measuring Instruments'
  },
  { 
    id: 'voltmeter', 
    name: 'Voltmeter', 
    icon: Gauge, 
    description: 'Measures voltage difference across components', 
    color: 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/40',
    category: 'Measuring Instruments'
  },
  { 
    id: 'wire', 
    name: 'Wire', 
    icon: Minus, 
    description: 'Connects components to complete the circuit', 
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:hover:bg-gray-600/40',
    category: 'Connections'
  }
];

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ 
  onToolSelect, 
  selectedTool, 
  themeMode,
  onComponentInfo 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleComponentSelect = (componentId: string) => {
    onToolSelect(componentId);
    setIsDropdownOpen(false);
  };

  const selectedComponent = componentData.find(c => c.id === selectedTool);

  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 ${
      themeMode === 'dark' ? 'bg-gray-800/90 border-gray-600' : 'bg-white/90 border-blue-100'
    }`}>
      <div className={`p-5 border-b transition-colors duration-300 ${
        themeMode === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <h3 className={`text-xl font-bold mb-1 ${
          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Component Library</h3>
        <p className={`text-sm font-medium ${
          themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>Select components to build your circuit</p>
      </div>
      
      <div className="p-5">
        {/* Component Dropdown - Fixed positioning */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedComponent
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200'
                : themeMode === 'dark'
                  ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-600/50'
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              {selectedComponent ? (
                <>
                  <div className={`p-3 rounded-xl shadow-md ${
                    themeMode === 'dark' ? 'bg-gray-600' : 'bg-white'
                  }`}>
                    <selectedComponent.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold text-sm ${
                      themeMode === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{selectedComponent.name}</div>
                    <div className={`text-xs font-medium ${
                      themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{selectedComponent.category}</div>
                  </div>
                </>
              ) : (
                <div className={`text-sm font-medium ${
                  themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Select a component...</div>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            } ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>

          {/* Dropdown Menu - Fixed to stay within container */}
          {isDropdownOpen && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border z-50 backdrop-blur-md transition-all duration-300 ${
              themeMode === 'dark' ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-200'
            }`}>
              {/* Fixed height container with scroll */}
              <div className="max-h-72 overflow-y-auto">
                <div className="py-1">
                  {componentData.map((component, index) => {
                    const IconComponent = component.icon;
                    
                    return (
                      <div key={component.id} className={`flex items-center ${index !== componentData.length - 1 ? 'border-b' : ''} ${
                        themeMode === 'dark' ? 'border-gray-700' : 'border-gray-100'
                      }`}>
                        <button
                          onClick={() => handleComponentSelect(component.id)}
                          className={`flex-1 flex items-center space-x-3 p-3 transition-all duration-200 text-left ${
                            component.id === selectedTool 
                              ? themeMode === 'dark'
                                ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-l-4 border-blue-400'
                                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500'
                              : themeMode === 'dark'
                                ? 'hover:bg-gray-700/50'
                                : 'hover:bg-blue-50/50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                            component.id === selectedTool 
                              ? themeMode === 'dark'
                                ? 'bg-blue-800/60 ring-2 ring-blue-400/50'
                                : 'bg-blue-100 ring-2 ring-blue-300'
                              : themeMode === 'dark' 
                                ? 'bg-gray-700/50' 
                                : 'bg-white/80'
                          }`}>
                            <IconComponent className={`w-5 h-5 transition-colors duration-200 ${
                              component.id === selectedTool 
                                ? themeMode === 'dark'
                                  ? 'text-blue-300'
                                  : 'text-blue-600'
                                : themeMode === 'dark' 
                                  ? 'text-gray-200' 
                                  : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className={`font-bold text-sm mb-1 truncate ${
                              component.id === selectedTool 
                                ? themeMode === 'dark'
                                  ? 'text-blue-200'
                                  : 'text-blue-900'
                                : themeMode === 'dark' 
                                  ? 'text-gray-100' 
                                  : 'text-gray-900'
                            }`}>{component.name}</div>
                            <div className={`text-xs font-medium mb-1 truncate ${
                              component.id === selectedTool 
                                ? themeMode === 'dark'
                                  ? 'text-blue-300'
                                  : 'text-blue-600'
                                : themeMode === 'dark' 
                                  ? 'text-blue-300' 
                                  : 'text-blue-600'
                            }`}>{component.category}</div>
                            <div className={`text-xs leading-tight line-clamp-2 ${
                              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>{component.description}</div>
                          </div>
                        </button>
                        <button
                          onClick={() => onComponentInfo(component.id)}
                          className={`p-3 transition-all duration-200 flex-shrink-0 ${
                            themeMode === 'dark' 
                              ? 'text-gray-400 hover:text-blue-300 hover:bg-gray-700/50' 
                              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'
                          }`}
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className={`mt-4 p-3 rounded-xl border transition-colors duration-300 ${
          themeMode === 'dark' 
            ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <h4 className={`font-bold text-sm mb-2 ${
            themeMode === 'dark' ? 'text-white' : 'text-blue-900'
          }`}>Instructions</h4>
          <ul className={`text-xs space-y-1 font-medium ${
            themeMode === 'dark' ? 'text-gray-300' : 'text-blue-800'
          }`}>
            <li>• Select a component from dropdown</li>
            <li>• Click on canvas to place</li>
            <li>• Drag to move components</li>
            <li>• Right-click to delete</li>
            <li>• Use wire tool to connect</li>
            <li>• Click ⓘ for component details</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
