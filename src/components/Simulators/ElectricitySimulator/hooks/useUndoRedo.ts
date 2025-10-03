import { useState, useCallback, useRef } from 'react';
import { Component, Connection } from '../types/circuit';

// Action types for undo/redo system
export interface CircuitAction {
  id: string;
  type: 'add_component' | 'remove_component' | 'update_component' | 'add_connection' | 'remove_connection' | 'update_connection' | 'reset_circuit';
  timestamp: number;
  data: any;
  inverseData?: any;
}

// Circuit state snapshot
export interface CircuitSnapshot {
  components: Component[];
  connections: Connection[];
  timestamp: number;
}

export interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  addAction: (action: Omit<CircuitAction, 'id' | 'timestamp'>) => void;
  getHistory: () => CircuitAction[];
  getCurrentSnapshot: () => CircuitSnapshot;
}

export const useUndoRedo = (
  components: Component[],
  connections: Connection[],
  onStateChange: (components: Component[], connections: Connection[]) => void,
  maxHistorySize: number = 50
): UseUndoRedoReturn => {
  const [history, setHistory] = useState<CircuitAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoRedoOperation = useRef(false);

  // Generate unique action ID
  const generateActionId = useCallback(() => {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create snapshot of current state
  const createSnapshot = useCallback((): CircuitSnapshot => {
    return {
      components: JSON.parse(JSON.stringify(components)),
      connections: JSON.parse(JSON.stringify(connections)),
      timestamp: Date.now()
    };
  }, [components, connections]);

  // Add action to history
  const addAction = useCallback((action: Omit<CircuitAction, 'id' | 'timestamp'>) => {
    if (isUndoRedoOperation.current) {
      return; // Don't add actions during undo/redo operations
    }

    const newAction: CircuitAction = {
      ...action,
      id: generateActionId(),
      timestamp: Date.now()
    };

    setHistory(prevHistory => {
      // Remove any actions after current index (when branching from history)
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      
      // Add new action
      newHistory.push(newAction);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else {
        setCurrentIndex(newHistory.length - 1);
      }
      
      return newHistory;
    });
  }, [currentIndex, generateActionId, maxHistorySize]);

  // Undo last action
  const undo = useCallback(() => {
    if (currentIndex < 0) return;

    const action = history[currentIndex];
    if (!action) return;

    isUndoRedoOperation.current = true;

    try {
      switch (action.type) {
        case 'add_component':
          // Remove the component that was added
          onStateChange(
            components.filter(c => c.id !== action.data.id),
            connections
          );
          break;

        case 'remove_component':
          // Restore the component that was removed
          onStateChange(
            [...components, action.data],
            connections
          );
          break;

        case 'update_component':
          // Restore previous component state
          onStateChange(
            components.map(c => c.id === action.data.id ? action.inverseData : c),
            connections
          );
          break;

        case 'add_connection':
          // Remove the connection that was added
          onStateChange(
            components,
            connections.filter(c => c.id !== action.data.id)
          );
          break;

        case 'remove_connection':
          // Restore the connection that was removed
          onStateChange(
            components,
            [...connections, action.data]
          );
          break;

        case 'update_connection':
          // Restore previous connection state
          onStateChange(
            components,
            connections.map(c => c.id === action.data.id ? action.inverseData : c)
          );
          break;

        case 'reset_circuit':
          // Restore previous circuit state
          onStateChange(action.inverseData.components, action.inverseData.connections);
          break;

        default:
          console.warn('Unknown action type for undo:', action.type);
      }
    } catch (error) {
      console.error('Error during undo operation:', error);
    } finally {
      isUndoRedoOperation.current = false;
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, history, components, connections, onStateChange]);

  // Redo next action
  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) return;

    const action = history[currentIndex + 1];
    if (!action) return;

    isUndoRedoOperation.current = true;

    try {
      switch (action.type) {
        case 'add_component':
          // Add the component back
          onStateChange(
            [...components, action.data],
            connections
          );
          break;

        case 'remove_component':
          // Remove the component again
          onStateChange(
            components.filter(c => c.id !== action.data.id),
            connections
          );
          break;

        case 'update_component':
          // Apply the update again
          onStateChange(
            components.map(c => c.id === action.data.id ? action.data : c),
            connections
          );
          break;

        case 'add_connection':
          // Add the connection back
          onStateChange(
            components,
            [...connections, action.data]
          );
          break;

        case 'remove_connection':
          // Remove the connection again
          onStateChange(
            components,
            connections.filter(c => c.id !== action.data.id)
          );
          break;

        case 'update_connection':
          // Apply the connection update again
          onStateChange(
            components,
            connections.map(c => c.id === action.data.id ? action.data : c)
          );
          break;

        case 'reset_circuit':
          // Reset to empty circuit
          onStateChange([], []);
          break;

        default:
          console.warn('Unknown action type for redo:', action.type);
      }
    } catch (error) {
      console.error('Error during redo operation:', error);
    } finally {
      isUndoRedoOperation.current = false;
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history, components, connections, onStateChange]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  // Get current snapshot
  const getCurrentSnapshot = useCallback((): CircuitSnapshot => {
    return createSnapshot();
  }, [createSnapshot]);

  return {
    canUndo: currentIndex >= 0,
    canRedo: currentIndex < history.length - 1,
    undo,
    redo,
    clearHistory,
    addAction,
    getHistory: () => history,
    getCurrentSnapshot
  };
};
