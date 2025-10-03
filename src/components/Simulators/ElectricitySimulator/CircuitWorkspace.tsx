import React from 'react';
import { Component, Connection, CircuitData } from './types/circuit';
import { ThemeMode } from './hooks/useCircuitState';
import { CircuitCanvas } from './CircuitCanvas';

interface CircuitWorkspaceProps {
  components: Component[];
  connections: Connection[];
  selectedTool: string | null;
  isSimulating: boolean;
  circuitData: CircuitData;
  themeMode: ThemeMode;
  onAddComponent: (component: Omit<Component, 'id'>) => void;
  onRemoveComponent: (id: string) => void;
  onUpdateComponent: (id: string, updates: Partial<Component>) => void;
  onAddConnection: (connection: Omit<Connection, 'id'>) => void;
  onRemoveConnection: (id: string) => void;
}

export const CircuitWorkspace: React.FC<CircuitWorkspaceProps> = ({
  components,
  connections,
  selectedTool,
  isSimulating,
  circuitData,
  themeMode,
  onAddComponent,
  onRemoveComponent,
  onUpdateComponent,
  onAddConnection,
  onRemoveConnection
}) => {
  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden transition-colors duration-300 ${
      themeMode === 'dark' ? 'bg-gray-800/90 border-gray-600' : 'bg-white/90 border-blue-100'
    }`}>
      <div className={`p-6 border-b transition-colors duration-300 ${
        themeMode === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <h3 className={`text-xl font-bold mb-1 ${
          themeMode === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Circuit Workspace
        </h3>
        <p className={`text-sm font-medium ${
          themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Drag components from the library to build your circuit
        </p>
      </div>
      <CircuitCanvas
        components={components}
        connections={connections}
        selectedTool={selectedTool}
        isSimulating={isSimulating}
        circuitData={circuitData}
        themeMode={themeMode}
        onAddComponent={onAddComponent}
        onRemoveComponent={onRemoveComponent}
        onUpdateComponent={onUpdateComponent}
        onAddConnection={onAddConnection}
        onRemoveConnection={onRemoveConnection}
      />
    </div>
  );
};

