import { useState, useCallback, useEffect } from 'react';
import { Component, Connection, CircuitData, CircuitMode } from '../types/circuit';
import { calculateCircuitProperties } from '../utils/circuitPhysics';
import { validateComponent, validateConnection, validateCircuit, validateVoltage, ValidationResult } from '../utils/validation';
import { useUndoRedo } from './useUndoRedo';

export type ThemeMode = 'light' | 'dark';
export type ExperimentStep = {
  id: number;
  title: string;
  description: string;
  component?: string;
  action: string;
  completed: boolean;
};

export const useCircuitState = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [voltage, setVoltage] = useState(12);
  const [isSimulating, setIsSimulating] = useState(false);
  const [circuitMode, setCircuitMode] = useState<CircuitMode>('series');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isExperimentMode, setIsExperimentMode] = useState(false);
  const [currentExperimentStep, setCurrentExperimentStep] = useState(0);
  const [selectedComponentInfo, setSelectedComponentInfo] = useState<string | null>(null);
  const [circuitData, setCircuitData] = useState<CircuitData>({
    totalVoltage: 0,
    totalCurrent: 0,
    totalResistance: 0,
    totalPower: 0,
    isShortCircuit: false,
    fuseBlown: false
  });
  const [validationErrors, setValidationErrors] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [lastError, setLastError] = useState<string | null>(null);

  // State change handler with validation
  const handleStateChange = useCallback((newComponents: Component[], newConnections: Connection[]) => {
    try {
      // Validate the new state
      const circuitValidation = validateCircuit(newComponents, newConnections);
      setValidationErrors(circuitValidation);
      
      if (circuitValidation.isValid) {
        setComponents(newComponents);
        setConnections(newConnections);
        setLastError(null);
      } else {
        setLastError(`Validation failed: ${circuitValidation.errors.map(e => e.message).join(', ')}`);
        console.warn('Circuit validation failed:', circuitValidation.errors);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setLastError(errorMessage);
      console.error('Error in state change handler:', error);
    }
  }, []);

  // Initialize undo/redo system
  const undoRedo = useUndoRedo(components, connections, handleStateChange);

  const experimentSteps: ExperimentStep[] = [
    { id: 1, title: "Place Battery", description: "Start by placing a battery as your voltage source", component: "battery", action: "Click battery from dropdown and place it on canvas", completed: false },
    { id: 2, title: "Add Light Bulb", description: "Add a light bulb to see the effect of current", component: "bulb", action: "Select bulb and place it near the battery", completed: false },
    { id: 3, title: "Connect with Wire", description: "Connect the battery and bulb using wires", component: "wire", action: "Use wire tool to connect components", completed: false },
    { id: 4, title: "Add Switch", description: "Add a switch to control the circuit", component: "switch", action: "Place a switch in the circuit path", completed: false },
    { id: 5, title: "Start Simulation", description: "Start the simulation to see current flow", action: "Click the Start Simulation button", completed: false },
    { id: 6, title: "Observe Results", description: "Watch the bulb glow and current flow animation", action: "Observe the physics in action!", completed: false }
  ];

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Voltage setter with validation
  const setVoltageWithValidation = useCallback((newVoltage: number) => {
    const validation = validateVoltage(newVoltage);
    if (validation.isValid) {
      setVoltage(newVoltage);
      setLastError(null);
    } else {
      setLastError(`Voltage validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
  }, []);

  const toggleExperimentMode = useCallback(() => {
    setIsExperimentMode(prev => !prev);
    setCurrentExperimentStep(0);
  }, []);

  const nextExperimentStep = useCallback(() => {
    setCurrentExperimentStep(prev => Math.min(prev + 1, experimentSteps.length - 1));
  }, [experimentSteps.length]);

  // Recalculate circuit properties when components, connections, or voltage change
  useEffect(() => {
    if (components.length > 0) {
      const newCircuitData = calculateCircuitProperties(components, connections, voltage);
      setCircuitData(newCircuitData);
      
      // Update component properties if they were calculated
      if (newCircuitData.updatedComponentProperties) {
        setComponents(prevComponents => 
          prevComponents.map(component => {
            const updates = newCircuitData.updatedComponentProperties?.get(component.id);
            if (updates) {
              return {
                ...component,
                properties: { ...component.properties, ...updates }
              };
            }
            return component;
          })
        );
      }
    } else {
      setCircuitData({
        totalVoltage: voltage,
        totalCurrent: 0,
        totalResistance: 0,
        totalPower: 0,
        isShortCircuit: false,
        fuseBlown: false
      });
    }
  }, [components, connections, voltage, circuitMode, isSimulating]);

  const addComponent = useCallback((component: Omit<Component, 'id'>) => {
    try {
      const id = `${component.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newComponent = { ...component, id };
      
      // Validate component before adding
      const validation = validateComponent(newComponent);
      if (!validation.isValid) {
        setLastError(`Component validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        return;
      }
      
      // Add to undo/redo history
      undoRedo.addAction({
        type: 'add_component',
        data: newComponent
      });
      
      handleStateChange([...components, newComponent], connections);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add component';
      setLastError(errorMessage);
      console.error('Error adding component:', error);
    }
  }, [components, connections, handleStateChange, undoRedo]);

  const removeComponent = useCallback((id: string) => {
    try {
      const componentToRemove = components.find(c => c.id === id);
      if (!componentToRemove) {
        setLastError(`Component with ID ${id} not found`);
        return;
      }
      
      // Add to undo/redo history
      undoRedo.addAction({
        type: 'remove_component',
        data: componentToRemove
      });
      
      const newComponents = components.filter(comp => comp.id !== id);
      const newConnections = connections.filter(conn => 
        conn.fromComponentId !== id && conn.toComponentId !== id
      );
      
      handleStateChange(newComponents, newConnections);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove component';
      setLastError(errorMessage);
      console.error('Error removing component:', error);
    }
  }, [components, connections, handleStateChange, undoRedo]);

  const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
    try {
      const currentComponent = components.find(c => c.id === id);
      if (!currentComponent) {
        setLastError(`Component with ID ${id} not found`);
        return;
      }
      
      const updatedComponent = { ...currentComponent, ...updates };
      
      // Validate updated component
      const validation = validateComponent(updatedComponent);
      if (!validation.isValid) {
        setLastError(`Component validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        return;
      }
      
      // Add to undo/redo history
      undoRedo.addAction({
        type: 'update_component',
        data: updatedComponent,
        inverseData: currentComponent
      });
      
      const newComponents = components.map(comp => 
        comp.id === id ? updatedComponent : comp
      );
      
      handleStateChange(newComponents, connections);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update component';
      setLastError(errorMessage);
      console.error('Error updating component:', error);
    }
  }, [components, connections, handleStateChange, undoRedo]);

  const addConnection = useCallback((connection: Omit<Connection, 'id'>) => {
    try {
      const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newConnection = { ...connection, id };
      
      // Validate connection before adding
      const validation = validateConnection(newConnection, components);
      if (!validation.isValid) {
        setLastError(`Connection validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        return;
      }
      
      // Add to undo/redo history
      undoRedo.addAction({
        type: 'add_connection',
        data: newConnection
      });
      
      handleStateChange(components, [...connections, newConnection]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add connection';
      setLastError(errorMessage);
      console.error('Error adding connection:', error);
    }
  }, [components, connections, handleStateChange, undoRedo]);

  const removeConnection = useCallback((id: string) => {
    try {
      const connectionToRemove = connections.find(c => c.id === id);
      if (!connectionToRemove) {
        setLastError(`Connection with ID ${id} not found`);
        return;
      }
      
      // Add to undo/redo history
      undoRedo.addAction({
        type: 'remove_connection',
        data: connectionToRemove
      });
      
      const newConnections = connections.filter(conn => conn.id !== id);
      handleStateChange(components, newConnections);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove connection';
      setLastError(errorMessage);
      console.error('Error removing connection:', error);
    }
  }, [components, connections, handleStateChange, undoRedo]);

  const resetCircuit = useCallback(() => {
    try {
      // Add to undo/redo history
      undoRedo.addAction({
        type: 'reset_circuit',
        data: { components: [], connections: [] },
        inverseData: { components, connections }
      });
      
      handleStateChange([], []);
      setIsSimulating(false);
      setCircuitData({
        totalVoltage: voltage,
        totalCurrent: 0,
        totalResistance: 0,
        totalPower: 0,
        isShortCircuit: false,
        fuseBlown: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset circuit';
      setLastError(errorMessage);
      console.error('Error resetting circuit:', error);
    }
  }, [voltage, components, connections, handleStateChange, undoRedo]);

  return {
    // Core state
    components,
    connections,
    voltage,
    setVoltage: setVoltageWithValidation,
    isSimulating,
    setIsSimulating,
    circuitMode,
    setCircuitMode,
    themeMode,
    toggleTheme,
    
    // Experiment mode
    isExperimentMode,
    toggleExperimentMode,
    currentExperimentStep,
    nextExperimentStep,
    experimentSteps,
    
    // Component info
    selectedComponentInfo,
    setSelectedComponentInfo,
    
    // Circuit data
    circuitData,
    
    // Component management
    addComponent,
    removeComponent,
    updateComponent,
    
    // Connection management
    addConnection,
    removeConnection,
    
    // Circuit control
    resetCircuit,
    
    // Undo/Redo functionality
    canUndo: undoRedo.canUndo,
    canRedo: undoRedo.canRedo,
    undo: undoRedo.undo,
    redo: undoRedo.redo,
    clearHistory: undoRedo.clearHistory,
    
    // Validation and error handling
    validationErrors,
    lastError,
    clearError: () => setLastError(null)
  };
};
