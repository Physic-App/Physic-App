import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Component, Connection, Position, CircuitData } from './types/circuit';
import { ThemeMode } from './hooks/useCircuitState';
import { drawComponent, drawConnection, drawCurrentFlow } from './utils/canvasRenderer';

interface CircuitCanvasProps {
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

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<{ componentId: string; terminal: number } | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  const canvasWidth = 800;
  const canvasHeight = 600;

  // Animation loop for current flow
  useEffect(() => {
    if (!isSimulating) return;

    const animate = () => {
      setAnimationFrame(prev => (prev + 1) % 60);
    };

    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Draw the circuit
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    drawGrid(ctx);

    // Draw connections
    connections.forEach(connection => {
      const fromComponent = components.find(c => c.id === connection.fromComponentId);
      const toComponent = components.find(c => c.id === connection.toComponentId);
      
      if (fromComponent && toComponent) {
        drawConnection(ctx, fromComponent, toComponent, connection, isSimulating && circuitData.totalCurrent > 0);
      }
    });

    // Draw current flow animation
    if (isSimulating && circuitData.totalCurrent > 0) {
      connections.forEach(connection => {
        const fromComponent = components.find(c => c.id === connection.fromComponentId);
        const toComponent = components.find(c => c.id === connection.toComponentId);
        
        if (fromComponent && toComponent) {
          drawCurrentFlow(ctx, fromComponent, toComponent, animationFrame, circuitData.totalCurrent);
        }
      });
    }

    // Draw components
    components.forEach(component => {
      drawComponent(ctx, component, isSimulating, circuitData);
    });

    // Draw circuit status indicator
    drawCircuitStatus(ctx, circuitData, isSimulating);

    // Highlight selected tool area
    if (selectedTool && !draggedComponent) {
      ctx.fillStyle = themeMode === 'dark' 
        ? 'rgba(59, 130, 246, 0.05)' 
        : 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      ctx.font = '16px Inter, system-ui, sans-serif';
      ctx.fillStyle = themeMode === 'dark' ? '#60A5FA' : '#3B82F6';
      ctx.textAlign = 'center';
      ctx.fillText(`Click to place ${selectedTool}`, canvasWidth / 2, canvasHeight / 2);
    }

  }, [components, connections, selectedTool, draggedComponent, isSimulating, circuitData, animationFrame]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = themeMode === 'dark' 
      ? 'rgba(75, 85, 99, 0.3)' 
      : 'rgba(243, 244, 246, 0.8)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= canvasWidth; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvasHeight; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  };

  const drawCircuitStatus = (ctx: CanvasRenderingContext2D, circuitData: CircuitData, isSimulating: boolean) => {
    const statusX = canvasWidth - 200;
    const statusY = 20;
    
    // Background
    ctx.fillStyle = themeMode === 'dark' 
      ? 'rgba(31, 41, 55, 0.9)' 
      : 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(statusX - 10, statusY - 10, 190, 80);
    
    // Border
    ctx.strokeStyle = circuitData.totalCurrent > 0 
      ? '#10B981' 
      : themeMode === 'dark' ? '#374151' : '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.strokeRect(statusX - 10, statusY - 10, 190, 80);
    
    // Status text
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.fillStyle = circuitData.totalCurrent > 0 
      ? '#10B981' 
      : themeMode === 'dark' ? '#9CA3AF' : '#6B7280';
    ctx.textAlign = 'left';
    ctx.fillText('Circuit Status', statusX, statusY + 15);
    
    // Current flow indicator
    if (circuitData.totalCurrent > 0) {
      if (circuitData.isShortCircuit) {
        ctx.fillStyle = '#EF4444';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillText(`⚠️ SHORT CIRCUIT!`, statusX, statusY + 35);
        ctx.fillText(`Current: ${circuitData.totalCurrent.toFixed(1)}A`, statusX, statusY + 55);
      } else {
        ctx.fillStyle = '#10B981';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillText(`✓ Current: ${circuitData.totalCurrent.toFixed(3)}A`, statusX, statusY + 35);
        ctx.fillText(`⚡ Power: ${circuitData.totalPower.toFixed(2)}W`, statusX, statusY + 55);
      }
    } else {
      ctx.fillStyle = themeMode === 'dark' ? '#9CA3AF' : '#6B7280';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillText('No current flow', statusX, statusY + 35);
      ctx.fillText('Complete the circuit', statusX, statusY + 55);
    }
  };

  const getMousePosition = (event: React.MouseEvent): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const snapToGrid = (pos: Position): Position => ({
    x: Math.round(pos.x / 20) * 20,
    y: Math.round(pos.y / 20) * 20
  });

  const findComponentAt = (position: Position): Component | null => {
    return components.find(component => {
      const dx = position.x - component.position.x;
      const dy = position.y - component.position.y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    }) || null;
  };

  // Check if a connection would create a short circuit
  const isValidConnection = (fromId: string, toId: string, existingConnections: Connection[]): boolean => {
    // Don't allow connecting a component to itself
    if (fromId === toId) return false;
    
    // Check if this connection already exists
    const duplicateConnection = existingConnections.find(conn => 
      (conn.fromComponentId === fromId && conn.toComponentId === toId) ||
      (conn.fromComponentId === toId && conn.toComponentId === fromId)
    );
    
    if (duplicateConnection) return false;
    
    // Check for potential short circuit by looking for existing paths
    const fromComponent = components.find(c => c.id === fromId);
    const toComponent = components.find(c => c.id === toId);
    
    if (!fromComponent || !toComponent) return false;
    
    // For batteries, prevent direct positive-to-negative connections
    if (fromComponent.type === 'battery' && toComponent.type === 'battery') {
      return false; // Never connect two batteries directly
    }
    
    // Allow other connections - the physics engine will handle short circuit detection
    // based on actual current calculations rather than path analysis
    
    return true;
  };

  // Check if there's already a path between two components
  const hasPathBetweenComponents = (startId: string, endId: string, connections: Connection[]): boolean => {
    const visited = new Set<string>();
    const stack = [startId];
    
    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (current === endId) return true;
      if (visited.has(current)) continue;
      
      visited.add(current);
      
      // Find all connections from this component
      const outgoingConnections = connections.filter(conn => conn.fromComponentId === current);
      const incomingConnections = connections.filter(conn => conn.toComponentId === current);
      
      // Add connected components to stack
      outgoingConnections.forEach(conn => stack.push(conn.toComponentId));
      incomingConnections.forEach(conn => stack.push(conn.fromComponentId));
    }
    
    return false;
  };

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    const mousePos = getMousePosition(event);
    const snappedPos = snapToGrid(mousePos);

    if (selectedTool && selectedTool !== 'wire') {
      // Place new component
      const newComponent: Omit<Component, 'id'> = {
        type: selectedTool as Component['type'],
        position: snappedPos,
        properties: getDefaultProperties(selectedTool),
        terminals: getDefaultTerminals(selectedTool, snappedPos)
      };

      onAddComponent(newComponent);
    } else if (selectedTool === 'wire') {
      // Wire connection logic
      const clickedComponent = findComponentAt(mousePos);
      
      if (clickedComponent) {
        if (!connectingFrom) {
          // Start connection from this component
          setConnectingFrom({ componentId: clickedComponent.id, terminal: 0 });
        } else if (connectingFrom.componentId !== clickedComponent.id) {
          // Check if this connection would create a short circuit
          if (isValidConnection(connectingFrom.componentId, clickedComponent.id, connections)) {
            onAddConnection({
              fromComponentId: connectingFrom.componentId,
              toComponentId: clickedComponent.id,
              fromTerminal: connectingFrom.terminal,
              toTerminal: 0
            });
          }
          setConnectingFrom(null);
        }
      }
    }
  }, [selectedTool, connectingFrom, onAddComponent, onAddConnection, connections]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (selectedTool) return;

    const mousePos = getMousePosition(event);
    const clickedComponent = findComponentAt(mousePos);

    if (clickedComponent) {
      if (event.shiftKey || event.button === 2 || event.nativeEvent.button === 2) { // Right click or shift+click
        // Delete component
        onRemoveComponent(clickedComponent.id);
        event.preventDefault();
        event.stopPropagation();
      } else {
        // Start dragging
        setDraggedComponent(clickedComponent.id);
        setDragOffset({
          x: mousePos.x - clickedComponent.position.x,
          y: mousePos.y - clickedComponent.position.y
        });
      }
    }
  }, [selectedTool, onRemoveComponent]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!draggedComponent) return;

    const mousePos = getMousePosition(event);
    const newPosition = snapToGrid({
      x: mousePos.x - dragOffset.x,
      y: mousePos.y - dragOffset.y
    });

    onUpdateComponent(draggedComponent, {
      position: newPosition,
      terminals: getDefaultTerminals(
        components.find(c => c.id === draggedComponent)?.type || 'resistor',
        newPosition
      )
    });
  }, [draggedComponent, dragOffset, onUpdateComponent, components]);

  const handleMouseUp = useCallback(() => {
    setDraggedComponent(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault(); // Prevent browser context menu
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={`border-2 cursor-crosshair rounded-xl shadow-inner transition-colors duration-300 ${
          themeMode === 'dark' 
            ? 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-700' 
            : 'border-blue-100 bg-gradient-to-br from-white to-blue-50'
        }`}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
      />
      
      {connectingFrom && (
        <div className={`absolute top-4 left-4 px-4 py-3 rounded-xl text-sm font-bold shadow-lg animate-pulse ${
          themeMode === 'dark' 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
        }`}>
          Click another component to connect
        </div>
      )}
    </div>
  );
};

const getDefaultProperties = (type: string) => {
  switch (type) {
    case 'battery':
      return { voltage: 12 };
    case 'bulb':
      return { resistance: 10, power: 0, brightness: 0 };
    case 'resistor':
      return { resistance: 100 };
    case 'capacitor':
      return { capacitance: 100, charge: 0, energy: 0 }; // 100µF
    case 'ammeter':
      return { reading: 0, resistance: 0.001 }; // Very low resistance
    case 'voltmeter':
      return { reading: 0, resistance: 1000000 }; // Very high resistance
    case 'switch':
      return { isOn: true, resistance: 0 };
    case 'fuse':
      return { maxCurrent: 5, isBlown: false, resistance: 0.1 };
    default:
      return {};
  }
};

const getDefaultTerminals = (type: string, position: Position): Position[] => {
  switch (type) {
    case 'battery':
      return [
        { x: position.x - 20, y: position.y },
        { x: position.x + 20, y: position.y }
      ];
    default:
      return [
        { x: position.x - 15, y: position.y },
        { x: position.x + 15, y: position.y }
      ];
  }
};
