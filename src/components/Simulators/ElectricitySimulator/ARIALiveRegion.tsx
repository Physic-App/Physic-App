import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ARIALiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announceError: (message: string) => void;
  announceSuccess: (message: string) => void;
  announceInfo: (message: string) => void;
}

const ARIALiveRegionContext = createContext<ARIALiveRegionContextType | null>(null);

export const useARIALiveRegion = () => {
  const context = useContext(ARIALiveRegionContext);
  if (!context) {
    throw new Error('useARIALiveRegion must be used within an ARIALiveRegionProvider');
  }
  return context;
};

interface ARIALiveRegionProviderProps {
  children: React.ReactNode;
}

export const ARIALiveRegionProvider: React.FC<ARIALiveRegionProviderProps> = ({ children }) => {
  const [politeMessages, setPoliteMessages] = useState<string[]>([]);
  const [assertiveMessages, setAssertiveMessages] = useState<string[]>([]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessages(prev => [...prev, message]);
    } else {
      setPoliteMessages(prev => [...prev, message]);
    }
  }, []);

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  const announceInfo = useCallback((message: string) => {
    announce(`Info: ${message}`, 'polite');
  }, [announce]);

  // Clear messages after they've been announced
  useEffect(() => {
    if (politeMessages.length > 0) {
      const timer = setTimeout(() => {
        setPoliteMessages([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [politeMessages]);

  useEffect(() => {
    if (assertiveMessages.length > 0) {
      const timer = setTimeout(() => {
        setAssertiveMessages([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [assertiveMessages]);

  const contextValue: ARIALiveRegionContextType = {
    announce,
    announceError,
    announceSuccess,
    announceInfo
  };

  return (
    <ARIALiveRegionContext.Provider value={contextValue}>
      {children}
      
      {/* ARIA Live Regions */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {politeMessages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {assertiveMessages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </ARIALiveRegionContext.Provider>
  );
};

// Component for announcing circuit state changes
export const CircuitStateAnnouncer: React.FC<{
  isSimulating: boolean;
  componentCount: number;
  connectionCount: number;
  selectedCount: number;
  lastAction?: string;
}> = ({ isSimulating, componentCount, connectionCount, selectedCount, lastAction }) => {
  const { announceInfo } = useARIALiveRegion();

  useEffect(() => {
    if (lastAction) {
      announceInfo(lastAction);
    }
  }, [lastAction, announceInfo]);

  useEffect(() => {
    const message = isSimulating 
      ? `Simulation started. Circuit has ${componentCount} components and ${connectionCount} connections.`
      : `Simulation stopped. Circuit has ${componentCount} components and ${connectionCount} connections.`;
    announceInfo(message);
  }, [isSimulating, componentCount, connectionCount, announceInfo]);

  useEffect(() => {
    if (selectedCount > 0) {
      announceInfo(`${selectedCount} component${selectedCount !== 1 ? 's' : ''} selected`);
    }
  }, [selectedCount, announceInfo]);

  return null;
};

// Component for announcing component interactions
export const ComponentInteractionAnnouncer: React.FC<{
  componentType?: string;
  action?: 'added' | 'removed' | 'moved' | 'rotated' | 'selected' | 'deselected';
  position?: { x: number; y: number };
  rotation?: number;
}> = ({ componentType, action, position, rotation }) => {
  const { announceInfo } = useARIALiveRegion();

  useEffect(() => {
    if (componentType && action) {
      let message = '';
      
      switch (action) {
        case 'added':
          message = `${componentType} component added`;
          if (position) {
            message += ` at position ${Math.round(position.x)}, ${Math.round(position.y)}`;
          }
          break;
        case 'removed':
          message = `${componentType} component removed`;
          break;
        case 'moved':
          message = `${componentType} component moved`;
          if (position) {
            message += ` to position ${Math.round(position.x)}, ${Math.round(position.y)}`;
          }
          break;
        case 'rotated':
          message = `${componentType} component rotated`;
          if (rotation !== undefined) {
            message += ` to ${rotation} degrees`;
          }
          break;
        case 'selected':
          message = `${componentType} component selected`;
          break;
        case 'deselected':
          message = `${componentType} component deselected`;
          break;
      }
      
      announceInfo(message);
    }
  }, [componentType, action, position, rotation, announceInfo]);

  return null;
};

// Component for announcing connection changes
export const ConnectionAnnouncer: React.FC<{
  action?: 'added' | 'removed' | 'invalid';
  fromComponent?: string;
  toComponent?: string;
  error?: string;
}> = ({ action, fromComponent, toComponent, error }) => {
  const { announceInfo, announceError } = useARIALiveRegion();

  useEffect(() => {
    if (action) {
      let message = '';
      
      switch (action) {
        case 'added':
          message = `Connection added between ${fromComponent} and ${toComponent}`;
          announceInfo(message);
          break;
        case 'removed':
          message = `Connection removed between ${fromComponent} and ${toComponent}`;
          announceInfo(message);
          break;
        case 'invalid':
          message = `Invalid connection: ${error}`;
          announceError(message);
          break;
      }
    }
  }, [action, fromComponent, toComponent, error, announceInfo, announceError]);

  return null;
};

// Component for announcing simulation results
export const SimulationAnnouncer: React.FC<{
  totalVoltage?: number;
  totalCurrent?: number;
  totalResistance?: number;
  isShortCircuit?: boolean;
  fuseBlown?: boolean;
  errors?: string[];
}> = ({ totalVoltage, totalCurrent, totalResistance, isShortCircuit, fuseBlown, errors }) => {
  const { announceInfo, announceError } = useARIALiveRegion();

  useEffect(() => {
    if (totalVoltage !== undefined && totalCurrent !== undefined && totalResistance !== undefined) {
      let message = `Circuit analysis complete. Total voltage: ${totalVoltage.toFixed(2)}V, `;
      message += `Total current: ${totalCurrent.toFixed(2)}A, `;
      message += `Total resistance: ${totalResistance.toFixed(2)}Ω`;
      
      if (isShortCircuit) {
        message += '. Warning: Short circuit detected';
      }
      
      if (fuseBlown) {
        message += '. Warning: Fuse blown';
      }
      
      announceInfo(message);
    }
  }, [totalVoltage, totalCurrent, totalResistance, isShortCircuit, fuseBlown, announceInfo]);

  useEffect(() => {
    if (errors && errors.length > 0) {
      errors.forEach(error => {
        announceError(error);
      });
    }
  }, [errors, announceError]);

  return null;
};
