import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Component, Connection } from './types/circuit';
import { Copy, Paste, Trash2, RotateCw, RotateCcw, Move, Square } from 'lucide-react';

interface CanvasInteractionManagerProps {
  components: Component[];
  connections: Connection[];
  selectedComponents: string[];
  onSelectComponents: (componentIds: string[]) => void;
  onUpdateComponents: (updates: Component[]) => void;
  onUpdateConnections: (updates: Connection[]) => void;
  onDeleteComponents: (componentIds: string[]) => void;
  onDeleteConnections: (connectionIds: string[]) => void;
  themeMode: 'light' | 'dark';
}

interface ClipboardData {
  components: Component[];
  connections: Connection[];
  offset: { x: number; y: number };
}

export const CanvasInteractionManager: React.FC<CanvasInteractionManagerProps> = ({
  components,
  connections,
  selectedComponents,
  onSelectComponents,
  onUpdateComponents,
  onUpdateConnections,
  onDeleteComponents,
  onDeleteConnections,
  themeMode
}) => {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMouseDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'a':
            event.preventDefault();
            handleSelectAll();
            break;
          case 'c':
            event.preventDefault();
            handleCopy();
            break;
          case 'v':
            event.preventDefault();
            handlePaste();
            break;
          case 'd':
            event.preventDefault();
            handleDuplicate();
            break;
        }
      } else {
        switch (event.key) {
          case 'Delete':
          case 'Backspace':
            event.preventDefault();
            handleDelete();
            break;
          case 'Escape':
            onSelectComponents([]);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponents]);

  const handleSelectAll = useCallback(() => {
    onSelectComponents(components.map(c => c.id));
  }, [components, onSelectComponents]);

  const handleCopy = useCallback(() => {
    if (selectedComponents.length === 0) return;

    const selectedComponentsData = components.filter(c => selectedComponents.includes(c.id));
    const selectedConnections = connections.filter(conn => 
      selectedComponents.includes(conn.fromComponentId) && 
      selectedComponents.includes(conn.toComponentId)
    );

    // Calculate center point for offset
    const centerX = selectedComponentsData.reduce((sum, c) => sum + c.position.x, 0) / selectedComponentsData.length;
    const centerY = selectedComponentsData.reduce((sum, c) => sum + c.position.y, 0) / selectedComponentsData.length;

    setClipboard({
      components: selectedComponentsData,
      connections: selectedConnections,
      offset: { x: centerX, y: centerY }
    });
  }, [selectedComponents, components, connections]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;

    const newComponents: Component[] = [];
    const newConnections: Connection[] = [];
    const idMap = new Map<string, string>();

    // Generate new IDs and positions
    clipboard.components.forEach(component => {
      const newId = `${component.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      idMap.set(component.id, newId);
      
      newComponents.push({
        ...component,
        id: newId,
        position: {
          x: component.position.x + 50, // Offset for visibility
          y: component.position.y + 50
        }
      });
    });

    // Update connections with new IDs
    clipboard.connections.forEach(connection => {
      const newId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      newConnections.push({
        ...connection,
        id: newId,
        fromComponentId: idMap.get(connection.fromComponentId) || connection.fromComponentId,
        toComponentId: idMap.get(connection.toComponentId) || connection.toComponentId
      });
    });

    onUpdateComponents([...components, ...newComponents]);
    onUpdateConnections([...connections, ...newConnections]);
    onSelectComponents(newComponents.map(c => c.id));
  }, [clipboard, components, connections, onUpdateComponents, onUpdateConnections, onSelectComponents]);

  const handleDuplicate = useCallback(() => {
    handleCopy();
    setTimeout(handlePaste, 100); // Small delay to ensure copy completes
  }, [handleCopy, handlePaste]);

  const handleDelete = useCallback(() => {
    if (selectedComponents.length === 0) return;

    const connectionsToDelete = connections.filter(conn => 
      selectedComponents.includes(conn.fromComponentId) || 
      selectedComponents.includes(conn.toComponentId)
    );

    onDeleteComponents(selectedComponents);
    onDeleteConnections(connectionsToDelete.map(c => c.id));
    onSelectComponents([]);
  }, [selectedComponents, connections, onDeleteComponents, onDeleteConnections, onSelectComponents]);

  const handleRotate = useCallback((direction: 'clockwise' | 'counterclockwise') => {
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

  const handleMove = useCallback((deltaX: number, deltaY: number) => {
    if (selectedComponents.length === 0) return;

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

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left mouse button

    isMouseDown.current = true;
    lastMousePos.current = { x: event.clientX, y: event.clientY };

    if (event.shiftKey) {
      // Start multi-select mode
      setIsMultiSelectMode(true);
      setSelectionBox({
        start: { x: event.clientX, y: event.clientY },
        end: { x: event.clientX, y: event.clientY }
      });
    } else if (selectedComponents.length > 0) {
      // Start dragging selected components
      setIsDragging(true);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [selectedComponents]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isMouseDown.current) return;

    const currentPos = { x: event.clientX, y: event.clientY };

    if (isMultiSelectMode && selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, end: currentPos } : null);
    } else if (isDragging && selectedComponents.length > 0) {
      const deltaX = currentPos.x - lastMousePos.current.x;
      const deltaY = currentPos.y - lastMousePos.current.y;
      
      setDragOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      handleMove(deltaX, deltaY);
    }

    lastMousePos.current = currentPos;
  }, [isMultiSelectMode, selectionBox, isDragging, selectedComponents, handleMove]);

  const handleMouseUp = useCallback(() => {
    isMouseDown.current = false;
    
    if (isMultiSelectMode && selectionBox) {
      // Find components within selection box
      const selectedIds = components.filter(component => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return false;
        
        const componentScreenX = component.position.x + rect.left;
        const componentScreenY = component.position.y + rect.top;
        
        const minX = Math.min(selectionBox.start.x, selectionBox.end.x);
        const maxX = Math.max(selectionBox.start.x, selectionBox.end.x);
        const minY = Math.min(selectionBox.start.y, selectionBox.end.y);
        const maxY = Math.max(selectionBox.start.y, selectionBox.end.y);
        
        return componentScreenX >= minX && componentScreenX <= maxX &&
               componentScreenY >= minY && componentScreenY <= maxY;
      }).map(c => c.id);
      
      onSelectComponents(selectedIds);
    }
    
    setIsMultiSelectMode(false);
    setSelectionBox(null);
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [isMultiSelectMode, selectionBox, components, onSelectComponents]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
        themeMode === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleSelectAll}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              themeMode === 'dark' 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Select All (Ctrl+A)"
            aria-label="Select all components"
          >
            <Square className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCopy}
            disabled={selectedComponents.length === 0}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              selectedComponents.length > 0
                ? themeMode === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
                : themeMode === 'dark' 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Copy (Ctrl+C)"
            aria-label="Copy selected components"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePaste}
            disabled={!clipboard}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              clipboard
                ? themeMode === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
                : themeMode === 'dark' 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Paste (Ctrl+V)"
            aria-label="Paste components"
          >
            <Paste className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDuplicate}
            disabled={selectedComponents.length === 0}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              selectedComponents.length > 0
                ? themeMode === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
                : themeMode === 'dark' 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Duplicate (Ctrl+D)"
            aria-label="Duplicate selected components"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-400" />

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleRotate('counterclockwise')}
            disabled={selectedComponents.length === 0}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              selectedComponents.length > 0
                ? themeMode === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
                : themeMode === 'dark' 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Rotate Counterclockwise"
            aria-label="Rotate selected components counterclockwise"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleRotate('clockwise')}
            disabled={selectedComponents.length === 0}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              selectedComponents.length > 0
                ? themeMode === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-700'
                : themeMode === 'dark' 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Rotate Clockwise"
            aria-label="Rotate selected components clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-400" />

        <button
          onClick={handleDelete}
          disabled={selectedComponents.length === 0}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            selectedComponents.length > 0
              ? 'hover:bg-red-100 text-red-600 hover:text-red-700'
              : themeMode === 'dark' 
                ? 'text-gray-600 cursor-not-allowed' 
                : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Delete (Delete/Backspace)"
          aria-label="Delete selected components"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Selection Info */}
      {selectedComponents.length > 0 && (
        <div className={`p-3 rounded-lg border ${
          themeMode === 'dark' 
            ? 'bg-blue-900/20 border-blue-700 text-blue-300' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <p className="text-sm font-medium">
            {selectedComponents.length} component{selectedComponents.length !== 1 ? 's' : ''} selected
          </p>
          <p className="text-xs mt-1 opacity-75">
            Use Shift+Click to multi-select, or hold Shift and drag to select multiple components
          </p>
        </div>
      )}

      {/* Canvas Event Handlers */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="absolute inset-0 pointer-events-auto"
        style={{ zIndex: 1 }}
      />

      {/* Selection Box Overlay */}
      {selectionBox && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 pointer-events-none"
          style={{
            left: Math.min(selectionBox.start.x, selectionBox.end.x),
            top: Math.min(selectionBox.start.y, selectionBox.end.y),
            width: Math.abs(selectionBox.end.x - selectionBox.start.x),
            height: Math.abs(selectionBox.end.y - selectionBox.start.y),
            zIndex: 10
          }}
        />
      )}
    </div>
  );
};
