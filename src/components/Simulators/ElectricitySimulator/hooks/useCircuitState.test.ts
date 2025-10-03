import { renderHook, act } from '@testing-library/react';
import { useCircuitState } from '../useCircuitState';
import { Component, Connection } from '../../types/circuit';

// Mock the physics engine
jest.mock('../../utils/circuitPhysics', () => ({
  calculateCircuitProperties: jest.fn(() => ({
    totalCurrent: 0.12,
    totalVoltage: 12,
    totalPower: 1.44,
    totalResistance: 100,
    isShortCircuit: false,
    kclValid: true,
    kvlValid: true,
    validationErrors: [],
    updatedComponentProperties: new Map(),
    powerAnalysis: {
      totalPowerGenerated: 1.44,
      totalPowerConsumed: 1.44,
      efficiency: 1.0,
      powerFactor: 1.0,
      componentPower: new Map()
    }
  }))
}));

// Mock validation
jest.mock('../../utils/validation', () => ({
  validateComponent: jest.fn(() => ({ isValid: true, errors: [] })),
  validateConnection: jest.fn(() => ({ isValid: true, errors: [] })),
  validateCircuit: jest.fn(() => ({ isValid: true, errors: [] }))
}));

describe('useCircuitState', () => {
  const mockComponent: Component = {
    id: 'battery-1',
    type: 'battery',
    position: { x: 100, y: 100 },
    terminals: [
      { x: 0, y: 0 },
      { x: 40, y: 0 }
    ],
    properties: { voltage: 12, resistance: 0.001 }
  };

  const mockConnection: Connection = {
    id: 'conn-1',
    fromComponentId: 'battery-1',
    toComponentId: 'resistor-1',
    fromTerminal: 1,
    toTerminal: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useCircuitState());

    expect(result.current.components).toEqual([]);
    expect(result.current.connections).toEqual([]);
    expect(result.current.selectedComponents).toEqual([]);
    expect(result.current.isSimulating).toBe(false);
    expect(result.current.themeMode).toBe('light');
    expect(result.current.showGrid).toBe(true);
    expect(result.current.gridSize).toBe(20);
    expect(result.current.zoomLevel).toBe(100);
    expect(result.current.panOffset).toEqual({ x: 0, y: 0 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.validationErrors).toEqual([]);
    expect(result.current.lastError).toBeNull();
  });

  it('adds component correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    act(() => {
      result.current.addComponent(mockComponent);
    });

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0]).toEqual(mockComponent);
    expect(result.current.canUndo).toBe(true);
  });

  it('removes component correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    // Add component first
    act(() => {
      result.current.addComponent(mockComponent);
    });

    // Remove component
    act(() => {
      result.current.removeComponent('battery-1');
    });

    expect(result.current.components).toHaveLength(0);
    expect(result.current.canUndo).toBe(true);
  });

  it('updates component correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    // Add component first
    act(() => {
      result.current.addComponent(mockComponent);
    });

    // Update component
    const updatedComponent = {
      ...mockComponent,
      position: { x: 200, y: 200 }
    };

    act(() => {
      result.current.updateComponent('battery-1', updatedComponent);
    });

    expect(result.current.components[0].position).toEqual({ x: 200, y: 200 });
    expect(result.current.canUndo).toBe(true);
  });

  it('adds connection correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    act(() => {
      result.current.addConnection(mockConnection);
    });

    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0]).toEqual(mockConnection);
    expect(result.current.canUndo).toBe(true);
  });

  it('removes connection correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    // Add connection first
    act(() => {
      result.current.addConnection(mockConnection);
    });

    // Remove connection
    act(() => {
      result.current.removeConnection('conn-1');
    });

    expect(result.current.connections).toHaveLength(0);
    expect(result.current.canUndo).toBe(true);
  });

  it('handles undo correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    // Add component
    act(() => {
      result.current.addComponent(mockComponent);
    });

    expect(result.current.components).toHaveLength(1);
    expect(result.current.canUndo).toBe(true);

    // Undo
    act(() => {
      result.current.undo();
    });

    expect(result.current.components).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('handles redo correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    // Add component
    act(() => {
      result.current.addComponent(mockComponent);
    });

    // Undo
    act(() => {
      result.current.undo();
    });

    // Redo
    act(() => {
      result.current.redo();
    });

    expect(result.current.components).toHaveLength(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('clears history correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    // Add component
    act(() => {
      result.current.addComponent(mockComponent);
    });

    // Clear history
    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('resets circuit correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    // Add component and connection
    act(() => {
      result.current.addComponent(mockComponent);
      result.current.addConnection(mockConnection);
    });

    // Reset circuit
    act(() => {
      result.current.resetCircuit();
    });

    expect(result.current.components).toHaveLength(0);
    expect(result.current.connections).toHaveLength(0);
    expect(result.current.selectedComponents).toHaveLength(0);
    expect(result.current.canUndo).toBe(true);
  });

  it('handles component selection correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    act(() => {
      result.current.setSelectedComponents(['battery-1', 'resistor-1']);
    });

    expect(result.current.selectedComponents).toEqual(['battery-1', 'resistor-1']);
  });

  it('toggles simulation correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    expect(result.current.isSimulating).toBe(false);

    act(() => {
      result.current.setIsSimulating(true);
    });

    expect(result.current.isSimulating).toBe(true);
  });

  it('handles theme mode changes correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    expect(result.current.themeMode).toBe('light');

    act(() => {
      result.current.setThemeMode('dark');
    });

    expect(result.current.themeMode).toBe('dark');
  });

  it('handles grid settings correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    expect(result.current.showGrid).toBe(true);
    expect(result.current.gridSize).toBe(20);

    act(() => {
      result.current.setShowGrid(false);
      result.current.setGridSize(40);
    });

    expect(result.current.showGrid).toBe(false);
    expect(result.current.gridSize).toBe(40);
  });

  it('handles zoom and pan correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    expect(result.current.zoomLevel).toBe(100);
    expect(result.current.panOffset).toEqual({ x: 0, y: 0 });

    act(() => {
      result.current.setZoomLevel(150);
      result.current.setPanOffset({ x: 100, y: 100 });
    });

    expect(result.current.zoomLevel).toBe(150);
    expect(result.current.panOffset).toEqual({ x: 100, y: 100 });
  });

  it('handles voltage changes with validation', () => {
    const { result } = renderHook(() => useCircuitState());

    // Add battery component
    act(() => {
      result.current.addComponent(mockComponent);
    });

    // Set voltage with validation
    act(() => {
      result.current.setVoltageWithValidation('battery-1', 24);
    });

    expect(result.current.components[0].properties.voltage).toBe(24);
  });

  it('handles validation errors correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    // Mock validation error
    const { validateComponent } = require('../../utils/validation');
    validateComponent.mockReturnValue({
      isValid: false,
      errors: ['Invalid voltage value']
    });

    act(() => {
      result.current.addComponent({
        ...mockComponent,
        properties: { voltage: -1 }
      });
    });

    expect(result.current.validationErrors).toHaveLength(1);
    expect(result.current.validationErrors[0]).toBe('Invalid voltage value');
  });

  it('clears errors correctly', () => {
    const { result } = renderHook(() => useCircuitState());

    // Mock validation error
    const { validateComponent } = require('../../utils/validation');
    validateComponent.mockReturnValue({
      isValid: false,
      errors: ['Invalid voltage value']
    });

    act(() => {
      result.current.addComponent({
        ...mockComponent,
        properties: { voltage: -1 }
      });
    });

    expect(result.current.validationErrors).toHaveLength(1);

    // Clear errors
    act(() => {
      result.current.clearError();
    });

    expect(result.current.lastError).toBeNull();
  });

  it('handles multiple operations in sequence', () => {
    const { result } = renderHook(() => useCircuitState());

    // Add multiple components
    act(() => {
      result.current.addComponent(mockComponent);
      result.current.addComponent({
        ...mockComponent,
        id: 'resistor-1',
        type: 'resistor',
        properties: { resistance: 100 }
      });
    });

    expect(result.current.components).toHaveLength(2);

    // Add connection
    act(() => {
      result.current.addConnection(mockConnection);
    });

    expect(result.current.connections).toHaveLength(1);

    // Undo connection
    act(() => {
      result.current.undo();
    });

    expect(result.current.connections).toHaveLength(0);
    expect(result.current.components).toHaveLength(2);

    // Undo second component
    act(() => {
      result.current.undo();
    });

    expect(result.current.components).toHaveLength(1);

    // Redo second component
    act(() => {
      result.current.redo();
    });

    expect(result.current.components).toHaveLength(2);
  });

  it('handles error recovery gracefully', () => {
    const { result } = renderHook(() => useCircuitState());

    // Mock error in addComponent
    const originalAddComponent = result.current.addComponent;
    result.current.addComponent = jest.fn(() => {
      throw new Error('Test error');
    });

    act(() => {
      try {
        result.current.addComponent(mockComponent);
      } catch (error) {
        // Error should be caught and handled
      }
    });

    expect(result.current.lastError).toBe('Test error');

    // Restore original function
    result.current.addComponent = originalAddComponent;
  });
});
