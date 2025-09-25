import React, { useState, useCallback } from 'react';

// Components
import { DataPanel } from './DataPanel';
import { ExperimentGuide } from './ExperimentGuide';
import { ErrorBoundary } from './ErrorBoundary';
import { AppHeader } from './AppHeader';
import { ErrorDisplay } from './ErrorDisplay';
import { CircuitWorkspace } from './CircuitWorkspace';
import { SimulatorSidebar } from './SimulatorSidebar';

// Hooks
import { useCircuitState } from './hooks/useCircuitState';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const ElectricitySimulatorMain: React.FC = () => {
  const circuitState = useCircuitState();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Extract commonly used values for cleaner code
  const {
    components,
    connections,
    voltage,
    setVoltage,
    isSimulating,
    setIsSimulating,
    circuitMode,
    setCircuitMode,
    themeMode,
    toggleTheme,
    isExperimentMode,
    toggleExperimentMode,
    currentExperimentStep,
    nextExperimentStep,
    experimentSteps,
    selectedComponentInfo,
    setSelectedComponentInfo,
    circuitData,
    addComponent,
    removeComponent,
    updateComponent,
    addConnection,
    removeConnection,
    resetCircuit,
    canUndo,
    canRedo,
    undo,
    redo,
    lastError,
    clearError
  } = circuitState;

  // Event handlers
  const handleToolSelect = useCallback((toolType: string) => {
    setSelectedTool(toolType === selectedTool ? null : toolType);
  }, [selectedTool]);

  const handleToggleSimulation = useCallback(() => {
    setIsSimulating(!isSimulating);
  }, [isSimulating, setIsSimulating]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    canUndo,
    canRedo
  });

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300 ${
        themeMode === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        
        {/* Header */}
        <AppHeader
          themeMode={themeMode}
          isSimulating={isSimulating}
          isExperimentMode={isExperimentMode}
          canUndo={canUndo}
          canRedo={canRedo}
          onToggleTheme={toggleTheme}
          onToggleSimulation={handleToggleSimulation}
          onToggleExperimentMode={toggleExperimentMode}
          onUndo={undo}
          onRedo={redo}
          onResetCircuit={resetCircuit}
        />

        {/* Error Display */}
        <ErrorDisplay
          error={lastError}
          themeMode={themeMode}
          onClearError={clearError}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Experiment Guide */}
          {isExperimentMode && (
            <div className="mb-6">
              <ExperimentGuide
                currentStep={currentExperimentStep}
                steps={experimentSteps}
                onNextStep={nextExperimentStep}
                themeMode={themeMode}
              />
            </div>
          )}
          
          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <SimulatorSidebar
                selectedTool={selectedTool}
                selectedComponentInfo={selectedComponentInfo}
                circuitMode={circuitMode}
                voltage={voltage}
                isSimulating={isSimulating}
                themeMode={themeMode}
                onToolSelect={handleToolSelect}
                onComponentInfo={setSelectedComponentInfo}
                onModeChange={setCircuitMode}
                onVoltageChange={setVoltage}
              />
            </div>

            {/* Main Circuit Area */}
            <div className="lg:col-span-2">
              <CircuitWorkspace
                components={components}
                connections={connections}
                selectedTool={selectedTool}
                isSimulating={isSimulating}
                circuitData={circuitData}
                themeMode={themeMode}
                onAddComponent={addComponent}
                onRemoveComponent={removeComponent}
                onUpdateComponent={updateComponent}
                onAddConnection={addConnection}
                onRemoveConnection={removeConnection}
              />
            </div>

            {/* Right Data Panel */}
            <div className="lg:col-span-1">
              <DataPanel 
                circuitData={circuitData}
                components={components}
                isSimulating={isSimulating}
                themeMode={themeMode}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ElectricitySimulatorMain;
