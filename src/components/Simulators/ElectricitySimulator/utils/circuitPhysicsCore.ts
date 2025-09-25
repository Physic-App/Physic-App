import { Component, Connection } from '../types/circuit';

/**
 * Core circuit physics calculations and utilities
 * Separated from main physics engine for better modularity
 */

// Interface for node analysis results
export interface NodeAnalysisResult {
  nodeVoltages: number[];
  nodeMap: Map<string, number>;
  branchCurrents: Map<string, number>;
}

// Interface for component admittance
export interface ComponentAdmittance {
  componentId: string;
  fromNode: number;
  toNode: number;
  admittance: number;
  currentSource: number;
}

/**
 * Extract unique nodes from connections and create a node mapping with ground reference
 */
export function extractNodes(components: Component[]): { nodeMap: Map<string, number>, groundNodeId: string } {
  const nodeSet = new Set<string>();
  
  // Add nodes from component terminals
  components.forEach(component => {
    component.terminals.forEach((_, index) => {
      const nodeId = `${component.id}_${index}`;
      nodeSet.add(nodeId);
    });
  });
  
  // Find ground node (preferably battery negative terminal)
  let groundNodeId = '';
  const batteries = components.filter(c => c.type === 'battery');
  
  if (batteries.length > 0) {
    // Use the first battery's negative terminal as ground
    groundNodeId = `${batteries[0].id}_0`; // Terminal 0 is negative
  } else if (nodeSet.size > 0) {
    // If no batteries, use the first node as ground
    groundNodeId = Array.from(nodeSet)[0];
  }
  
  // Create mapping from node ID to node index, with ground node at index 0
  const nodeMap = new Map<string, number>();
  const sortedNodes = Array.from(nodeSet).sort();
  
  // Place ground node at index 0
  if (groundNodeId && sortedNodes.includes(groundNodeId)) {
    nodeMap.set(groundNodeId, 0);
    sortedNodes.splice(sortedNodes.indexOf(groundNodeId), 1);
  }
  
  // Add remaining nodes
  sortedNodes.forEach((nodeId, index) => {
    nodeMap.set(nodeId, index + (groundNodeId ? 1 : 0));
  });
  
  return { nodeMap, groundNodeId };
}

/**
 * Get component admittance for nodal analysis
 */
export function getComponentAdmittance(
  component: Component,
  connections: Connection[],
  nodeMap: Map<string, number>
): ComponentAdmittance | null {
  const { type, properties } = component;
  
  // Find connected nodes
  const componentConnections = connections.filter(
    conn => conn.fromComponentId === component.id || conn.toComponentId === component.id
  );
  
  if (componentConnections.length < 2) return null;
  
  const fromNodeId = `${component.id}_${componentConnections[0].fromComponentId === component.id ? componentConnections[0].fromTerminal : componentConnections[0].toTerminal}`;
  const toNodeId = `${component.id}_${componentConnections[1].fromComponentId === component.id ? componentConnections[1].fromTerminal : componentConnections[1].toTerminal}`;
  
  const fromNode = nodeMap.get(fromNodeId) ?? 0;
  const toNode = nodeMap.get(toNodeId) ?? 0;
  
  let admittance = 0;
  let currentSource = 0;
  
  switch (type) {
    case 'battery': {
      const voltage = properties.voltage ?? 12;
      const internalResistance = properties.resistance ?? 0.001;
      admittance = 1 / internalResistance;
      currentSource = voltage / internalResistance;
      break;
    }
    case 'resistor': {
      const resistance = properties.resistance ?? 100;
      admittance = 1 / resistance;
      break;
    }
    case 'bulb': {
      const resistance = properties.resistance ?? 10;
      admittance = 1 / resistance;
      break;
    }
    case 'fuse': {
      if (properties.isBlown) {
        admittance = 0; // Open circuit
      } else {
        const resistance = properties.resistance ?? 0.01;
        admittance = 1 / resistance;
      }
      break;
    }
    case 'switch': {
      if (properties.isOn) {
        const resistance = properties.resistance ?? 0.001;
        admittance = 1 / resistance;
      } else {
        admittance = 0; // Open circuit
      }
      break;
    }
    case 'ammeter': {
      const resistance = properties.resistance ?? 0.001;
      admittance = 1 / resistance;
      break;
    }
    case 'voltmeter': {
      const resistance = properties.resistance ?? 1000000; // Very high resistance
      admittance = 1 / resistance;
      break;
    }
    case 'capacitor': {
      // For DC analysis, capacitor is open circuit
      admittance = 0;
      break;
    }
    case 'inductor': {
      // For DC analysis, inductor is short circuit (very low resistance)
      const resistance = properties.resistance ?? 0.001;
      admittance = 1 / resistance;
      break;
    }
    case 'wire': {
      const resistance = properties.resistance ?? 0.001;
      admittance = 1 / resistance;
      break;
    }
  }
  
  return {
    componentId: component.id,
    fromNode,
    toNode,
    admittance,
    currentSource
  };
}

/**
 * Solve linear system using Gaussian elimination
 */
export function solveMatrix(matrix: number[][], currentSources: number[]): number[] {
  const n = matrix.length;
  const solution = [...currentSources];
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
    [solution[i], solution[maxRow]] = [solution[maxRow], solution[i]];
    
    // Check for singular matrix
    if (Math.abs(matrix[i][i]) < 1e-8) {
      console.warn('Singular matrix detected, using fallback solution');
      return Array(n).fill(0);
    }
    
    // Eliminate column
    for (let k = i + 1; k < n; k++) {
      const factor = matrix[k][i] / matrix[i][i];
      for (let j = i; j < n; j++) {
        matrix[k][j] -= factor * matrix[i][j];
      }
      solution[k] -= factor * solution[i];
    }
  }
  
  // Back substitution
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      solution[i] -= matrix[i][j] * solution[j];
    }
    solution[i] /= matrix[i][i];
  }
  
  return solution;
}

/**
 * Calculate branch currents from node voltages
 */
export function calculateBranchCurrents(
  components: Component[],
  connections: Connection[],
  nodeVoltages: number[],
  nodeMap: Map<string, number>
): Map<string, number> {
  const branchCurrents = new Map<string, number>();
  
  components.forEach(component => {
    const componentConnections = connections.filter(
      conn => conn.fromComponentId === component.id || conn.toComponentId === component.id
    );
    
    if (componentConnections.length >= 2) {
      const fromNodeId = `${component.id}_${componentConnections[0].fromComponentId === component.id ? componentConnections[0].fromTerminal : componentConnections[0].toTerminal}`;
      const toNodeId = `${component.id}_${componentConnections[1].fromComponentId === component.id ? componentConnections[1].fromTerminal : componentConnections[1].toTerminal}`;
      
      const fromNode = nodeMap.get(fromNodeId) ?? 0;
      const toNode = nodeMap.get(toNodeId) ?? 0;
      
      const voltageDrop = nodeVoltages[fromNode] - nodeVoltages[toNode];
      let current = 0;
      
      switch (component.type) {
        case 'battery': {
          const internalResistance = component.properties.resistance ?? 0.001;
          current = (component.properties.voltage ?? 12 - voltageDrop) / internalResistance;
          break;
        }
        case 'resistor':
        case 'bulb':
        case 'fuse':
        case 'switch':
        case 'ammeter':
        case 'voltmeter':
        case 'inductor':
        case 'wire': {
          const resistance = component.properties.resistance ?? 100;
          if (resistance > 0) {
            current = voltageDrop / resistance;
          }
          break;
        }
        case 'capacitor': {
          // For DC analysis, capacitor current is 0
          current = 0;
          break;
        }
      }
      
      branchCurrents.set(component.id, current);
    }
  });
  
  return branchCurrents;
}

