import React from 'react';
import { ThemeMode } from './hooks/useCircuitState';
import { ComponentLibrary } from './ComponentLibrary';
import { ComponentInfoPanel } from './ComponentInfoPanel';
import { CircuitModeSelector } from './CircuitModeSelector';
import { ControlPanel } from './ControlPanel';

interface SimulatorSidebarProps {
  selectedTool: string | null;
  selectedComponentInfo: string | null;
  circuitMode: string;
  voltage: number;
  isSimulating: boolean;
  themeMode: ThemeMode;
  onToolSelect: (toolType: string) => void;
  onComponentInfo: (componentType: string | null) => void;
  onModeChange: (mode: string) => void;
  onVoltageChange: (voltage: number) => void;
}

export const SimulatorSidebar: React.FC<SimulatorSidebarProps> = ({
  selectedTool,
  selectedComponentInfo,
  circuitMode,
  voltage,
  isSimulating,
  themeMode,
  onToolSelect,
  onComponentInfo,
  onModeChange,
  onVoltageChange
}) => {
  return (
    <div className="space-y-4">
      <ComponentLibrary 
        onToolSelect={onToolSelect}
        selectedTool={selectedTool}
        themeMode={themeMode}
        onComponentInfo={onComponentInfo}
      />
      
      {selectedComponentInfo && (
        <ComponentInfoPanel
          componentType={selectedComponentInfo}
          onClose={() => onComponentInfo(null)}
          themeMode={themeMode}
        />
      )}
      
      <CircuitModeSelector
        mode={circuitMode}
        onModeChange={onModeChange}
        themeMode={themeMode}
      />
      
      <ControlPanel 
        voltage={voltage}
        onVoltageChange={onVoltageChange}
        isSimulating={isSimulating}
        themeMode={themeMode}
      />
    </div>
  );
};

