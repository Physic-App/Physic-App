import { Component, Connection, Position } from '../types/circuit';

export interface SmartPlacementOptions {
  snapToGrid: boolean;
  gridSize: number;
  snapToConnections: boolean;
  autoAlign: boolean;
  connectionThreshold: number;
}

export interface PlacementResult {
  position: Position;
  snappedToGrid: boolean;
  snappedToConnection: boolean;
  connectionPoint?: Position;
  alignmentGuide?: {
    type: 'horizontal' | 'vertical';
    position: number;
  };
}

const defaultOptions: SmartPlacementOptions = {
  snapToGrid: true,
  gridSize: 20,
  snapToConnections: true,
  autoAlign: true,
  connectionThreshold: 15
};

/**
 * Calculate smart placement position for a component
 */
export function calculateSmartPlacement(
  mousePosition: Position,
  components: Component[],
  connections: Connection[],
  options: Partial<SmartPlacementOptions> = {}
): PlacementResult {
  const opts = { ...defaultOptions, ...options };
  let position = { ...mousePosition };
  let snappedToGrid = false;
  let snappedToConnection = false;
  let connectionPoint: Position | undefined;
  let alignmentGuide: PlacementResult['alignmentGuide'];

  // Snap to grid
  if (opts.snapToGrid) {
    const snappedX = Math.round(position.x / opts.gridSize) * opts.gridSize;
    const snappedY = Math.round(position.y / opts.gridSize) * opts.gridSize;
    
    if (Math.abs(position.x - snappedX) < opts.gridSize / 2 && 
        Math.abs(position.y - snappedY) < opts.gridSize / 2) {
      position = { x: snappedX, y: snappedY };
      snappedToGrid = true;
    }
  }

  // Snap to connection points
  if (opts.snapToConnections) {
    const nearestConnection = findNearestConnectionPoint(position, components, opts.connectionThreshold);
    if (nearestConnection) {
      position = nearestConnection.position;
      connectionPoint = nearestConnection.position;
      snappedToConnection = true;
    }
  }

  // Auto-alignment with existing components
  if (opts.autoAlign) {
    const alignment = findAlignmentGuide(position, components, opts.gridSize);
    if (alignment) {
      alignmentGuide = alignment;
      // Adjust position to align
      if (alignment.type === 'horizontal') {
        position.y = alignment.position;
      } else {
        position.x = alignment.position;
      }
    }
  }

  return {
    position,
    snappedToGrid,
    snappedToConnection,
    connectionPoint,
    alignmentGuide
  };
}

/**
 * Find the nearest connection point to the given position
 */
function findNearestConnectionPoint(
  position: Position,
  components: Component[],
  threshold: number
): { position: Position; component: Component; terminalIndex: number } | null {
  let nearest: { position: Position; component: Component; terminalIndex: number } | null = null;
  let minDistance = threshold;

  components.forEach(component => {
    component.terminals.forEach((terminal, index) => {
      const terminalPosition = {
        x: component.position.x + terminal.x,
        y: component.position.y + terminal.y
      };
      
      const distance = Math.sqrt(
        Math.pow(position.x - terminalPosition.x, 2) + 
        Math.pow(position.y - terminalPosition.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          position: terminalPosition,
          component,
          terminalIndex: index
        };
      }
    });
  });

  return nearest;
}

/**
 * Find alignment guides for auto-alignment
 */
function findAlignmentGuide(
  position: Position,
  components: Component[],
  gridSize: number
): { type: 'horizontal' | 'vertical'; position: number } | null {
  const alignmentThreshold = gridSize / 2;
  
  // Check for horizontal alignment (same Y coordinate)
  for (const component of components) {
    const componentY = component.position.y;
    if (Math.abs(position.y - componentY) < alignmentThreshold) {
      return { type: 'horizontal', position: componentY };
    }
    
    // Check component center Y
    const centerY = component.position.y + (component.terminals[1]?.y || 0) / 2;
    if (Math.abs(position.y - centerY) < alignmentThreshold) {
      return { type: 'horizontal', position: centerY };
    }
  }
  
  // Check for vertical alignment (same X coordinate)
  for (const component of components) {
    const componentX = component.position.x;
    if (Math.abs(position.x - componentX) < alignmentThreshold) {
      return { type: 'vertical', position: componentX };
    }
    
    // Check component center X
    const centerX = component.position.x + (component.terminals[1]?.x || 0) / 2;
    if (Math.abs(position.x - centerX) < alignmentThreshold) {
      return { type: 'vertical', position: centerX };
    }
  }
  
  return null;
}

/**
 * Suggest optimal placement for a new component based on existing circuit
 */
export function suggestOptimalPlacement(
  componentType: string,
  components: Component[],
  connections: Connection[],
  options: Partial<SmartPlacementOptions> = {}
): Position {
  const opts = { ...defaultOptions, ...options };
  
  // If no components exist, place at center
  if (components.length === 0) {
    return { x: 400, y: 300 };
  }
  
  // Find the rightmost component and place new component to its right
  const rightmostComponent = components.reduce((rightmost, component) => {
    const componentRight = component.position.x + (component.terminals[1]?.x || 40);
    const rightmostRight = rightmost.position.x + (rightmost.terminals[1]?.x || 40);
    return componentRight > rightmostRight ? component : rightmost;
  });
  
  const suggestedX = rightmostComponent.position.x + 100;
  const suggestedY = rightmostComponent.position.y;
  
  // Apply smart placement to the suggested position
  const smartPlacement = calculateSmartPlacement(
    { x: suggestedX, y: suggestedY },
    components,
    connections,
    opts
  );
  
  return smartPlacement.position;
}

/**
 * Check if a position is valid for component placement
 */
export function isValidPlacement(
  position: Position,
  componentSize: { width: number; height: number },
  existingComponents: Component[],
  margin: number = 10
): { isValid: boolean; conflicts: Component[] } {
  const conflicts: Component[] = [];
  
  existingComponents.forEach(component => {
    const componentBounds = {
      left: component.position.x - margin,
      right: component.position.x + (component.terminals[1]?.x || 40) + margin,
      top: component.position.y - margin,
      bottom: component.position.y + (component.terminals[1]?.y || 40) + margin
    };
    
    const newBounds = {
      left: position.x,
      right: position.x + componentSize.width,
      top: position.y,
      bottom: position.y + componentSize.height
    };
    
    // Check for overlap
    if (!(newBounds.right < componentBounds.left || 
          newBounds.left > componentBounds.right || 
          newBounds.bottom < componentBounds.top || 
          newBounds.top > componentBounds.bottom)) {
      conflicts.push(component);
    }
  });
  
  return {
    isValid: conflicts.length === 0,
    conflicts
  };
}

/**
 * Auto-arrange components in a clean layout
 */
export function autoArrangeComponents(
  components: Component[],
  connections: Connection[],
  options: Partial<SmartPlacementOptions> = {}
): Component[] {
  const opts = { ...defaultOptions, ...options };
  const arrangedComponents: Component[] = [];
  const componentWidth = 80;
  const componentHeight = 40;
  const spacing = 100;
  
  // Group components by type for better organization
  const componentsByType = components.reduce((groups, component) => {
    if (!groups[component.type]) {
      groups[component.type] = [];
    }
    groups[component.type].push(component);
    return groups;
  }, {} as Record<string, Component[]>);
  
  let currentX = 50;
  let currentY = 50;
  const maxComponentsPerRow = 6;
  
  Object.entries(componentsByType).forEach(([type, typeComponents]) => {
    typeComponents.forEach((component, index) => {
      const row = Math.floor(index / maxComponentsPerRow);
      const col = index % maxComponentsPerRow;
      
      const newPosition = {
        x: currentX + col * spacing,
        y: currentY + row * spacing
      };
      
      // Apply smart placement
      const smartPlacement = calculateSmartPlacement(
        newPosition,
        arrangedComponents,
        connections,
        opts
      );
      
      arrangedComponents.push({
        ...component,
        position: smartPlacement.position
      });
    });
    
    // Move to next type section
    currentY += Math.ceil(typeComponents.length / maxComponentsPerRow) * spacing + 50;
  });
  
  return arrangedComponents;
}
