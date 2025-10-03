import { useCallback, useEffect, useRef } from 'react';
import { Component, Connection } from '../types/circuit';

interface KeyboardNavigationProps {
  components: Component[];
  connections: Connection[];
  selectedComponents: string[];
  onSelectComponents: (componentIds: string[]) => void;
  onUpdateComponents: (updates: Component[]) => void;
  onDeleteComponents: (componentIds: string[]) => void;
  onDeleteConnections: (connectionIds: string[]) => void;
  onAddComponent: (component: Omit<Component, 'id'>) => void;
  onAddConnection: (connection: Omit<Connection, 'id'>) => void;
  onCopy: () => void;
  onPaste: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleGrid: () => void;
  onToggleTheme: () => void;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  isSimulating: boolean;
}

export const useKeyboardNavigation = ({
  components,
  connections,
  selectedComponents,
  onSelectComponents,
  onUpdateComponents,
  onDeleteComponents,
  onDeleteConnections,
  onAddComponent,
  onAddConnection,
  onCopy,
  onPaste,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleGrid,
  onToggleTheme,
  onStartSimulation,
  onStopSimulation,
  isSimulating
}: KeyboardNavigationProps) => {
  const focusIndex = useRef(0);
  const isNavigating = useRef(false);

  // Move focus between components
  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (components.length === 0) return;

    const currentComponent = components[focusIndex.current];
    if (!currentComponent) return;

    const threshold = 50; // Distance threshold for navigation
    let targetIndex = -1;
    let minDistance = Infinity;

    components.forEach((component, index) => {
      if (index === focusIndex.current) return;

      const dx = component.position.x - currentComponent.position.x;
      const dy = component.position.y - currentComponent.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let isInDirection = false;
      switch (direction) {
        case 'up':
          isInDirection = dy < -threshold && Math.abs(dx) < Math.abs(dy);
          break;
        case 'down':
          isInDirection = dy > threshold && Math.abs(dx) < Math.abs(dy);
          break;
        case 'left':
          isInDirection = dx < -threshold && Math.abs(dy) < Math.abs(dx);
          break;
        case 'right':
          isInDirection = dx > threshold && Math.abs(dy) < Math.abs(dx);
          break;
      }

      if (isInDirection && distance < minDistance) {
        targetIndex = index;
        minDistance = distance;
      }
    });

    if (targetIndex !== -1) {
      focusIndex.current = targetIndex;
      onSelectComponents([components[targetIndex].id]);
    }
  }, [components, onSelectComponents]);

  // Move selected components
  const moveSelectedComponents = useCallback((direction: 'up' | 'down' | 'left' | 'right', amount: number = 10) => {
    if (selectedComponents.length === 0) return;

    const deltaX = direction === 'left' ? -amount : direction === 'right' ? amount : 0;
    const deltaY = direction === 'up' ? -amount : direction === 'down' ? amount : 0;

    const updatedComponents = components.map(component => {
      if (selectedComponents.includes(component.id)) {
        return {
          ...component,
          position: {
            x: component.position.x + deltaX,
            y: component.position.y + deltaY
          }
        };
      }
      return component;
    });

    onUpdateComponents(updatedComponents);
  }, [selectedComponents, components, onUpdateComponents]);

  // Rotate selected components
  const rotateSelectedComponents = useCallback((direction: 'clockwise' | 'counterclockwise') => {
    if (selectedComponents.length === 0) return;

    const rotationStep = 90;
    const updatedComponents = components.map(component => {
      if (selectedComponents.includes(component.id)) {
        const currentRotation = component.properties.rotation || 0;
        const newRotation = direction === 'clockwise' 
          ? (currentRotation + rotationStep) % 360
          : (currentRotation - rotationStep + 360) % 360;
        
        return {
          ...component,
          properties: { ...component.properties, rotation: newRotation }
        };
      }
      return component;
    });

    onUpdateComponents(updatedComponents);
  }, [selectedComponents, components, onUpdateComponents]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't interfere with input fields
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const isAlt = event.altKey;

    // Global shortcuts (work everywhere)
    if (isCtrlOrCmd) {
      switch (event.key) {
        case 'z':
          event.preventDefault();
          if (isShift) {
            onRedo();
          } else {
            onUndo();
          }
          break;
        case 'y':
          event.preventDefault();
          onRedo();
          break;
        case 'c':
          event.preventDefault();
          onCopy();
          break;
        case 'v':
          event.preventDefault();
          onPaste();
          break;
        case 'a':
          event.preventDefault();
          onSelectComponents(components.map(c => c.id));
          break;
        case 's':
          event.preventDefault();
          // Save functionality would go here
          break;
        case '=':
        case '+':
          event.preventDefault();
          onZoomIn();
          break;
        case '-':
          event.preventDefault();
          onZoomOut();
          break;
        case '0':
          event.preventDefault();
          onResetView();
          break;
        case 'g':
          event.preventDefault();
          onToggleGrid();
          break;
        case 't':
          event.preventDefault();
          onToggleTheme();
          break;
        case ' ':
          event.preventDefault();
          if (isSimulating) {
            onStopSimulation();
          } else {
            onStartSimulation();
          }
          break;
      }
    }

    // Navigation shortcuts
    if (isAlt) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          moveFocus('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveFocus('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          moveFocus('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveFocus('right');
          break;
      }
    }

    // Component manipulation shortcuts
    if (selectedComponents.length > 0) {
      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          const connectionsToDelete = connections.filter(conn => 
            selectedComponents.includes(conn.fromComponentId) || 
            selectedComponents.includes(conn.toComponentId)
          );
          onDeleteComponents(selectedComponents);
          onDeleteConnections(connectionsToDelete.map(c => c.id));
          onSelectComponents([]);
          break;
        
        case 'ArrowUp':
          if (!isAlt) {
            event.preventDefault();
            moveSelectedComponents('up', isShift ? 1 : 10);
          }
          break;
        case 'ArrowDown':
          if (!isAlt) {
            event.preventDefault();
            moveSelectedComponents('down', isShift ? 1 : 10);
          }
          break;
        case 'ArrowLeft':
          if (!isAlt) {
            event.preventDefault();
            moveSelectedComponents('left', isShift ? 1 : 10);
          }
          break;
        case 'ArrowRight':
          if (!isAlt) {
            event.preventDefault();
            moveSelectedComponents('right', isShift ? 1 : 10);
          }
          break;
        
        case 'r':
          if (isShift) {
            event.preventDefault();
            rotateSelectedComponents('counterclockwise');
          } else {
            event.preventDefault();
            rotateSelectedComponents('clockwise');
          }
          break;
        
        case 'Escape':
          event.preventDefault();
          onSelectComponents([]);
          break;
      }
    }

    // Component creation shortcuts
    if (!isCtrlOrCmd && !isAlt) {
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          onAddComponent({
            type: 'battery',
            position: { x: 100, y: 100 },
            terminals: [
              { x: 0, y: 0 },
              { x: 40, y: 0 }
            ],
            properties: { voltage: 12, resistance: 0.001 }
          });
          break;
        case 'l':
          event.preventDefault();
          onAddComponent({
            type: 'bulb',
            position: { x: 200, y: 100 },
            terminals: [
              { x: 0, y: 0 },
              { x: 40, y: 0 }
            ],
            properties: { resistance: 10, power: 5 }
          });
          break;
        case 'r':
          event.preventDefault();
          onAddComponent({
            type: 'resistor',
            position: { x: 300, y: 100 },
            terminals: [
              { x: 0, y: 0 },
              { x: 40, y: 0 }
            ],
            properties: { resistance: 100 }
          });
          break;
        case 's':
          event.preventDefault();
          onAddComponent({
            type: 'switch',
            position: { x: 400, y: 100 },
            terminals: [
              { x: 0, y: 0 },
              { x: 40, y: 0 }
            ],
            properties: { isOn: true, resistance: 0.001 }
          });
          break;
        case 'f':
          event.preventDefault();
          onAddComponent({
            type: 'fuse',
            position: { x: 500, y: 100 },
            terminals: [
              { x: 0, y: 0 },
              { x: 40, y: 0 }
            ],
            properties: { maxCurrent: 5, resistance: 0.001 }
          });
          break;
        case 'c':
          event.preventDefault();
          onAddComponent({
            type: 'capacitor',
            position: { x: 600, y: 100 },
            terminals: [
              { x: 0, y: 0 },
              { x: 40, y: 0 }
            ],
            properties: { capacitance: 0.001, resistance: 1000 }
          });
          break;
        case 'i':
          event.preventDefault();
          onAddComponent({
            type: 'inductor',
            position: { x: 700, y: 100 },
            terminals: [
              { x: 0, y: 0 },
              { x: 40, y: 0 }
            ],
            properties: { inductance: 0.001, resistance: 0.001 }
          });
          break;
      }
    }
  }, [
    components,
    connections,
    selectedComponents,
    isSimulating,
    onSelectComponents,
    onUpdateComponents,
    onDeleteComponents,
    onDeleteConnections,
    onAddComponent,
    onAddConnection,
    onCopy,
    onPaste,
    onUndo,
    onRedo,
    onZoomIn,
    onZoomOut,
    onResetView,
    onToggleGrid,
    onToggleTheme,
    onStartSimulation,
    onStopSimulation,
    moveFocus,
    moveSelectedComponents,
    rotateSelectedComponents
  ]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset focus when components change
  useEffect(() => {
    if (focusIndex.current >= components.length) {
      focusIndex.current = Math.max(0, components.length - 1);
    }
  }, [components.length]);

  return {
    focusIndex: focusIndex.current,
    isNavigating: isNavigating.current,
    moveFocus,
    moveSelectedComponents,
    rotateSelectedComponents
  };
};
