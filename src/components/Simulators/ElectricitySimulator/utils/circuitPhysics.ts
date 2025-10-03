import { Component, Connection, CircuitData } from '../types/circuit';

/**
 * Matrix-based circuit solver using Nodal Analysis
 * Supports arbitrary circuit topologies with resistors, batteries, switches, and fuses
 */

// Interface for node analysis results
interface NodeAnalysisResult {
  nodeVoltages: number[];
  nodeMap: Map<string, number>;
  branchCurrents: Map<string, number>;
}

// Interface for component admittance
interface ComponentAdmittance {
  componentId: string;
  fromNode: number;
  toNode: number;
  admittance: number;
  currentSource: number;
}

/**
 * Extract unique nodes from connections and create a node mapping with ground reference
 */
function extractNodes(components: Component[]): { nodeMap: Map<string, number>, groundNodeId: string } {
  const nodeSet = new Set<string>();
  
  // Add nodes from component terminals
  components.forEach(component => {
    component.terminals.forEach((_, index) => {
      const nodeId = `${component.id}_${index}`;
      nodeSet.add(nodeId);
    });
  });
  
  // Find ground node (lowest voltage node or battery negative terminal)
  let groundNodeId = '';
  const batteries = components.filter(c => c.type === 'battery');
  
  if (batteries.length > 0) {
    // Use the first battery's negative terminal as ground
    groundNodeId = `${batteries[0].id}_0`; // Assuming terminal 0 is negative
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
 * Build admittance matrix and current source vector for nodal analysis
 */
function buildAdmittanceMatrix(
  components: Component[],
  connections: Connection[],
  nodeMap: Map<string, number>
): { matrix: number[][], currentSources: number[] } {
  const numNodes = nodeMap.size;
  // Create matrix with one less row/column since ground node is reference (voltage = 0)
  const matrixSize = Math.max(1, numNodes - 1);
  const matrix: number[][] = Array(matrixSize).fill(null).map(() => Array(matrixSize).fill(0));
  const currentSources: number[] = Array(matrixSize).fill(0);
  
  // Process each component
  components.forEach(component => {
    const componentAdmittance = getComponentAdmittance(component, connections, nodeMap);
    
    if (componentAdmittance) {
      const { fromNode, toNode, admittance, currentSource } = componentAdmittance;
      
      // Skip if either node is ground (index 0)
      if (fromNode === 0 || toNode === 0) {
        // Handle connections to ground
        const nonGroundNode = fromNode === 0 ? toNode : fromNode;
        if (nonGroundNode > 0 && nonGroundNode < numNodes) {
          const matrixIndex = nonGroundNode - 1; // Adjust for ground node
          if (matrixIndex >= 0 && matrixIndex < matrixSize) {
            matrix[matrixIndex][matrixIndex] += admittance;
            currentSources[matrixIndex] += fromNode === 0 ? -currentSource : currentSource;
          }
        }
      } else {
        // Handle connections between non-ground nodes
        if (fromNode > 0 && fromNode < numNodes && toNode > 0 && toNode < numNodes) {
          const fromIndex = fromNode - 1;
          const toIndex = toNode - 1;
          
          if (fromIndex >= 0 && fromIndex < matrixSize) {
            matrix[fromIndex][fromIndex] += admittance;
            if (toIndex >= 0 && toIndex < matrixSize) {
              matrix[fromIndex][toIndex] -= admittance;
            }
            currentSources[fromIndex] += currentSource;
          }
          
          if (toIndex >= 0 && toIndex < matrixSize) {
            matrix[toIndex][toIndex] += admittance;
            if (fromIndex >= 0 && fromIndex < matrixSize) {
              matrix[toIndex][fromIndex] -= admittance;
            }
            currentSources[toIndex] -= currentSource;
          }
        }
      }
    }
  });
  
  return { matrix, currentSources };
}

/**
 * Get component admittance and current source contribution
 */
function getComponentAdmittance(
  component: Component,
  connections: Connection[],
  nodeMap: Map<string, number>
): ComponentAdmittance | null {
  const componentId = component.id;
  
  // Find connections for this component
  const componentConnections = connections.filter(conn => 
    conn.fromComponentId === componentId || conn.toComponentId === componentId
  );
  
  if (componentConnections.length === 0) {
    return null; // Component not connected
  }
  
  // Get node indices
  const fromNode = nodeMap.get(`${componentId}_0`) ?? -1;
  const toNode = nodeMap.get(`${componentId}_1`) ?? -1;
  
  if (fromNode === -1 || toNode === -1) {
    return null;
  }
  
  let admittance = 0;
  let currentSource = 0;
  
  switch (component.type) {
    case 'resistor':
    case 'bulb': {
      const resistance = component.properties.resistance || 0;
      if (resistance > 0) {
        admittance = 1 / resistance;
      }
      break;
    }
      
    case 'battery': {
      const voltage = component.properties.voltage || 0;
      const internalResistance = component.properties.resistance || 0.001;
      // Current source should be voltage/internalResistance with proper sign
      currentSource = voltage / internalResistance;
      admittance = 1 / internalResistance;
      break;
    }
      
    case 'switch': {
      if (component.properties.isOn) {
        const resistance = component.properties.resistance || 0.001;
        admittance = 1 / resistance;
      }
      // If switch is off, admittance remains 0 (open circuit)
      break;
    }
      
    case 'fuse': {
      if (!component.properties.isBlown) {
        const resistance = component.properties.resistance || 0.001;
        admittance = 1 / resistance;
      }
      // If fuse is blown, admittance remains 0 (open circuit)
      break;
    }
      
    case 'wire':
      // Wire has very low resistance but not zero
      admittance = 1 / 0.01; // 0.01 ohms instead of 0.001
      break;
      
    case 'capacitor':
      // For DC analysis, capacitor acts as open circuit
      // In AC analysis, this would be 1/(jωC)
      admittance = 0; // Open circuit
      currentSource = 0;
      break;
      
    case 'inductor': {
      // For DC analysis, inductor acts as short circuit
      // In AC analysis, this would be 1/(jωL)
      const inductorResistance = component.properties.resistance || 0.001;
      admittance = 1 / inductorResistance; // Very low resistance
      currentSource = 0;
      break;
    }
      
    default:
      // Placeholder for future implementation
      console.warn(`Component type ${component.type} not yet supported in matrix solver`);
      return null;
  }
  
  return {
    componentId,
    fromNode,
    toNode,
    admittance,
    currentSource
  };
}

/**
 * Gaussian elimination solver for linear systems Ax = b
 */
export function solveMatrix(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  // Forward elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-8) {
      console.warn('Matrix is singular or nearly singular');
      return new Array(n).fill(0);
    }
    
    // Eliminate
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= augmented[i][j] * x[j];
    }
    x[i] = sum / augmented[i][i];
  }
  
  return x;
}

/**
 * Calculate branch currents from node voltages
 */
function calculateBranchCurrents(
  components: Component[],
  nodeMap: Map<string, number>,
  nodeVoltages: number[]
): Map<string, number> {
  const branchCurrents = new Map<string, number>();
  
  components.forEach(component => {
    const fromNode = nodeMap.get(`${component.id}_0`) ?? -1;
    const toNode = nodeMap.get(`${component.id}_1`) ?? -1;
    
    if (fromNode >= 0 && toNode >= 0) {
      const voltageDiff = nodeVoltages[fromNode] - nodeVoltages[toNode];
      let current = 0;
      
      switch (component.type) {
        case 'resistor':
        case 'bulb': {
          // Ohm's Law: I = V/R, current flows from higher to lower potential
          const resistance = component.properties.resistance || 0;
          if (resistance > 0) {
            current = voltageDiff / resistance;
          }
          break;
        }
          
        case 'battery': {
          // Battery current: I = (V_battery - V_external) / R_internal
          // Current flows from positive terminal (higher potential) to negative terminal
          const batteryVoltage = component.properties.voltage || 0;
          const batteryResistance = component.properties.resistance || 0.001;
          
          // Determine current direction based on terminal voltages
          // Positive terminal should be at higher voltage
          const positiveTerminalVoltage = nodeVoltages[fromNode];
          const negativeTerminalVoltage = nodeVoltages[toNode];
          
          if (positiveTerminalVoltage > negativeTerminalVoltage) {
            // Normal operation: current flows from positive to negative
            current = (batteryVoltage - voltageDiff) / batteryResistance;
          } else {
            // Reverse current (charging or short circuit)
            current = -(batteryVoltage + voltageDiff) / batteryResistance;
          }
          break;
        }
          
        case 'switch': {
          if (component.properties.isOn) {
            // Switch closed: small resistance
            const switchResistance = component.properties.resistance || 0.001;
            current = voltageDiff / switchResistance;
          } else {
            // Switch open: no current
            current = 0;
          }
          break;
        }
          
        case 'fuse': {
          if (!component.properties.isBlown) {
            // Fuse intact: small resistance
            const fuseResistance = component.properties.resistance || 0.001;
            current = voltageDiff / fuseResistance;
          } else {
            // Fuse blown: very high resistance (open circuit)
            current = 0;
          }
          break;
        }
          
        case 'ammeter': {
          // Ammeter: very low resistance, current flows through it
          const ammeterResistance = component.properties.resistance || 0.001;
          current = voltageDiff / ammeterResistance;
          break;
        }
          
        case 'voltmeter': {
          // Voltmeter: very high resistance, minimal current
          const voltmeterResistance = component.properties.resistance || 1000000;
          current = voltageDiff / voltmeterResistance;
          break;
        }
          
        case 'capacitor': {
          // For DC analysis, capacitor acts as open circuit
          // Current is zero in steady state
          current = 0;
          break;
        }
          
        case 'inductor': {
          // For DC analysis, inductor acts as short circuit
          // Current is limited only by other resistances in the circuit
          const inductorResistance = component.properties.resistance || 0.001;
          current = voltageDiff / inductorResistance;
          break;
        }
          
        case 'wire': {
          // Wire: very low resistance
          current = voltageDiff / 0.01;
          break;
        }
          
        default:
          // Default: treat as resistor
          current = voltageDiff / 1;
      }
      
      branchCurrents.set(component.id, current);
    }
  });
  
  return branchCurrents;
}

/**
 * Perform nodal analysis on the circuit
 */
function performNodalAnalysis(
  components: Component[],
  connections: Connection[]
): NodeAnalysisResult | null {
  // Extract nodes with ground reference
  const { nodeMap } = extractNodes(components);
  
  if (nodeMap.size === 0) {
    return null;
  }
  
  // Build admittance matrix
  const { matrix, currentSources } = buildAdmittanceMatrix(components, connections, nodeMap);
  
  // Solve for node voltages (excluding ground node)
  const nodeVoltages = solveMatrix(matrix, currentSources);
  
  // Add ground node voltage (0V) at the beginning
  const fullNodeVoltages = [0, ...nodeVoltages];
  
  // Calculate branch currents
  const branchCurrents = calculateBranchCurrents(components, nodeMap, fullNodeVoltages);
  
  return {
    nodeVoltages: fullNodeVoltages,
    nodeMap,
    branchCurrents
  };
}

/**
 * Check if circuit forms a complete loop
 */
function isCircuitComplete(components: Component[], connections: Connection[]): boolean {
  if (components.length === 0 || connections.length === 0) return false;
  
  const batteries = components.filter(c => c.type === 'battery');
  if (batteries.length === 0) return false;
  
  // Create adjacency list for graph traversal
  const adjacencyList = new Map<string, string[]>();
  
  // Initialize adjacency list
  components.forEach(component => {
    adjacencyList.set(component.id, []);
  });
  
  // Add connections to adjacency list
  connections.forEach(connection => {
    const fromList = adjacencyList.get(connection.fromComponentId) || [];
    const toList = adjacencyList.get(connection.toComponentId) || [];
    
    fromList.push(connection.toComponentId);
    toList.push(connection.fromComponentId);
    
    adjacencyList.set(connection.fromComponentId, fromList);
    adjacencyList.set(connection.toComponentId, toList);
  });
  
  // Check if there's a path from any battery to any load
  const loads = components.filter(c => c.type === 'bulb' || c.type === 'resistor');
  
  for (const battery of batteries) {
    for (const load of loads) {
      if (hasPath(adjacencyList, battery.id, load.id)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if there's a path between two components using DFS
 */
function hasPath(adjacencyList: Map<string, string[]>, start: string, end: string): boolean {
  const visited = new Set<string>();
  const stack = [start];
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (current === end) return true;
    if (visited.has(current)) continue;
    
    visited.add(current);
    const neighbors = adjacencyList.get(current) || [];
    stack.push(...neighbors);
  }
  
  return false;
}

/**
 * Main circuit analysis function using matrix-based nodal analysis
 */
export const calculateCircuitProperties = (
  components: Component[],
  connections: Connection[],
  voltage: number
): CircuitData => {
  // Handle empty circuit
  if (components.length === 0) {
    return {
      totalVoltage: voltage,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
      isShortCircuit: false,
      fuseBlown: false
    };
  }

  // Find circuit components
  const batteries = components.filter(c => c.type === 'battery');
  const switches = components.filter(c => c.type === 'switch');
  const fuses = components.filter(c => c.type === 'fuse');

  // Check if circuit is complete
  const hasValidCircuit = isCircuitComplete(components, connections);
  
  if (!hasValidCircuit) {
    return {
      totalVoltage: voltage,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
      isShortCircuit: false,
      fuseBlown: false
    };
  }

  // Check if all switches are closed
  const allSwitchesClosed = switches.every(s => s.properties.isOn);
  if (!allSwitchesClosed) {
    return {
      totalVoltage: voltage,
      totalCurrent: 0,
      totalResistance: Infinity,
      totalPower: 0,
      isShortCircuit: false,
      fuseBlown: false
    };
  }

  // Perform nodal analysis
  const analysisResult = performNodalAnalysis(components, connections);
  
  if (!analysisResult) {
    return {
      totalVoltage: voltage,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
      isShortCircuit: false,
      fuseBlown: false
    };
  }

  // Calculate total circuit properties
  const { branchCurrents } = analysisResult;
  
  // Find total current from battery
  let totalCurrent = 0;
  batteries.forEach(battery => {
    const current = branchCurrents.get(battery.id) || 0;
    totalCurrent += Math.abs(current);
  });
  
  // Calculate total voltage (sum of all battery voltages)
  const totalVoltage = batteries.reduce((sum, battery) => 
    sum + (battery.properties.voltage || 0), 0
  );
  
  // Calculate total resistance
  const totalResistance = totalCurrent > 0 ? totalVoltage / totalCurrent : 0;
  
  // Calculate total power
  const totalPower = totalVoltage * totalCurrent;
  
  // Enhanced short circuit detection
  const shortCircuitResult = detectShortCircuits(components, connections, branchCurrents, analysisResult.nodeVoltages, analysisResult.nodeMap);
  const isShortCircuit = shortCircuitResult.hasShortCircuit;
  
  // Check for blown fuses
  let fuseBlown = false;
  fuses.forEach(fuse => {
    const current = Math.abs(branchCurrents.get(fuse.id) || 0);
    if (current > (fuse.properties.maxCurrent || 5)) {
      // Note: Fuse state will be updated in updateComponentProperties
      fuseBlown = true;
    }
  });

  // Validate Kirchhoff's laws
  const kclValidation = validateKCL(components, connections, branchCurrents, analysisResult.nodeMap);
  const kvlValidation = validateKVL(components, connections, analysisResult.nodeVoltages, analysisResult.nodeMap, branchCurrents);
  
  // Log validation results in development
  if (!kclValidation.isValid) {
    console.warn('KCL validation failed:', kclValidation.errors);
  }
  if (!kvlValidation.isValid) {
    console.warn('KVL validation failed:', kvlValidation.errors);
  }

  // Calculate updated component properties (without mutating)
  const updatedComponentProperties = calculateUpdatedComponentProperties(components, branchCurrents, analysisResult.nodeVoltages, analysisResult.nodeMap);

  // Power analysis and efficiency calculations
  const powerAnalysis = calculatePowerAnalysis(components, branchCurrents, analysisResult.nodeVoltages, analysisResult.nodeMap);

  return {
    totalVoltage,
    totalCurrent: fuseBlown ? 0 : totalCurrent,
    totalResistance: fuseBlown ? Infinity : totalResistance,
    totalPower: fuseBlown ? 0 : totalPower,
    isShortCircuit: isShortCircuit && !fuseBlown,
    fuseBlown,
    updatedComponentProperties,
    kclValid: kclValidation.isValid,
    kvlValid: kvlValidation.isValid,
    validationErrors: [...kclValidation.errors, ...kvlValidation.errors],
    powerAnalysis
  };
};

/**
 * Validate Kirchhoff's Current Law (KCL) at each node
 */
function validateKCL(
  components: Component[],
  connections: Connection[],
  branchCurrents: Map<string, number>,
  nodeMap: Map<string, number>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // For each node, sum all incoming and outgoing currents
  for (const [nodeId] of nodeMap) {
    let totalCurrent = 0;
    
    // Find all components connected to this node
    components.forEach(component => {
      const componentConnections = connections.filter(conn => 
        conn.fromComponentId === component.id || conn.toComponentId === component.id
      );
      
      componentConnections.forEach(conn => {
        const isFromNode = conn.fromComponentId === component.id && 
          `${component.id}_${conn.fromTerminal}` === nodeId;
        const isToNode = conn.toComponentId === component.id && 
          `${component.id}_${conn.toTerminal}` === nodeId;
        
        if (isFromNode || isToNode) {
          const current = branchCurrents.get(component.id) || 0;
          // Current flowing out of node is positive, into node is negative
          totalCurrent += isFromNode ? current : -current;
        }
      });
    });
    
    // KCL: Sum of currents at any node should be zero (within tolerance)
    if (Math.abs(totalCurrent) > 1e-6) {
      errors.push(`KCL violation at node ${nodeId}: net current = ${totalCurrent.toFixed(6)}A`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Enhanced short circuit detection with current limiting calculations
 */
function detectShortCircuits(
  components: Component[],
  connections: Connection[],
  branchCurrents: Map<string, number>,
  nodeVoltages: number[],
  nodeMap: Map<string, number>
): { hasShortCircuit: boolean; shortCircuitPaths: string[]; currentLimits: Map<string, number> } {
  const shortCircuitPaths: string[] = [];
  const currentLimits = new Map<string, number>();
  
  // Check for excessive current in any component
  components.forEach(component => {
    const current = Math.abs(branchCurrents.get(component.id) || 0);
    let maxAllowedCurrent = Infinity;
    
    // Set current limits based on component type
    switch (component.type) {
      case 'battery':
        maxAllowedCurrent = 50; // 50A max for typical battery
        break;
      case 'bulb':
        maxAllowedCurrent = 2; // 2A max for typical bulb
        break;
      case 'resistor':
        maxAllowedCurrent = 10; // 10A max for typical resistor
        break;
      case 'switch':
        maxAllowedCurrent = 20; // 20A max for typical switch
        break;
      case 'fuse':
        maxAllowedCurrent = component.properties.maxCurrent || 5;
        break;
      case 'wire':
        maxAllowedCurrent = 30; // 30A max for typical wire
        break;
      case 'ammeter':
        maxAllowedCurrent = 5; // 5A max for typical ammeter
        break;
      case 'voltmeter':
        maxAllowedCurrent = 0.001; // Very low current for voltmeter
        break;
      case 'capacitor':
        maxAllowedCurrent = 1; // 1A max for typical capacitor
        break;
      case 'inductor':
        maxAllowedCurrent = 5; // 5A max for typical inductor
        break;
    }
    
    currentLimits.set(component.id, maxAllowedCurrent);
    
    // Check if current exceeds limit
    if (current > maxAllowedCurrent) {
      shortCircuitPaths.push(`${component.type} ${component.id}: ${current.toFixed(2)}A > ${maxAllowedCurrent}A`);
    }
  });
  
  // Check for voltage drops indicating short circuits
  connections.forEach(connection => {
    const fromComponent = components.find(c => c.id === connection.fromComponentId);
    const toComponent = components.find(c => c.id === connection.toComponentId);
    
    if (fromComponent && toComponent) {
      const fromNodeId = `${fromComponent.id}_${connection.fromTerminal}`;
      const toNodeId = `${toComponent.id}_${connection.toTerminal}`;
      
      const fromNodeIndex = nodeMap.get(fromNodeId);
      const toNodeIndex = nodeMap.get(toNodeId);
      
      if (fromNodeIndex !== undefined && toNodeIndex !== undefined) {
        const voltageDiff = Math.abs(nodeVoltages[fromNodeIndex] - nodeVoltages[toNodeIndex]);
        
        // If voltage difference is very small but current is high, it's likely a short
        if (voltageDiff < 0.1 && Math.abs(branchCurrents.get(fromComponent.id) || 0) > 1) {
          shortCircuitPaths.push(`Short circuit between ${fromComponent.type} and ${toComponent.type}`);
        }
      }
    }
  });
  
  return {
    hasShortCircuit: shortCircuitPaths.length > 0,
    shortCircuitPaths,
    currentLimits
  };
}

/**
 * Validate Kirchhoff's Voltage Law (KVL) for closed loops
 */
function validateKVL(
  components: Component[],
  connections: Connection[],
  nodeVoltages: number[],
  nodeMap: Map<string, number>,
  branchCurrents: Map<string, number>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Simple KVL validation: check that voltage differences are consistent
  connections.forEach(connection => {
    const fromComponent = components.find(c => c.id === connection.fromComponentId);
    const toComponent = components.find(c => c.id === connection.toComponentId);
    
    if (fromComponent && toComponent) {
      const fromNodeId = `${fromComponent.id}_${connection.fromTerminal}`;
      const toNodeId = `${toComponent.id}_${connection.toTerminal}`;
      
      const fromNodeIndex = nodeMap.get(fromNodeId);
      const toNodeIndex = nodeMap.get(toNodeId);
      
      if (fromNodeIndex !== undefined && toNodeIndex !== undefined) {
        const voltageDiff = nodeVoltages[fromNodeIndex] - nodeVoltages[toNodeIndex];
        
        // For passive components, voltage drop should be positive in direction of current
        if (fromComponent.type === 'resistor' || fromComponent.type === 'bulb') {
          const current = branchCurrents.get(fromComponent.id) || 0;
          const expectedVoltageDrop = current * (fromComponent.properties.resistance || 0);
          
          if (Math.abs(voltageDiff - expectedVoltageDrop) > 1e-6) {
            errors.push(`KVL violation: voltage drop mismatch for ${fromComponent.type} ${fromComponent.id}`);
          }
        }
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate power analysis and efficiency
 */
function calculatePowerAnalysis(
  components: Component[],
  branchCurrents: Map<string, number>,
  nodeVoltages: number[],
  nodeMap: Map<string, number>
): {
  totalPowerGenerated: number;
  totalPowerConsumed: number;
  efficiency: number;
  powerFactor: number;
  componentPowerBreakdown: Map<string, number>;
} {
  let totalPowerGenerated = 0;
  let totalPowerConsumed = 0;
  const componentPowerBreakdown = new Map<string, number>();
  
  components.forEach(component => {
    const current = branchCurrents.get(component.id) || 0;
    let power = 0;
    
    // Calculate voltage across component
    const fromNode = nodeMap.get(`${component.id}_0`) ?? -1;
    const toNode = nodeMap.get(`${component.id}_1`) ?? -1;
    
    if (fromNode >= 0 && toNode >= 0) {
      const voltage = nodeVoltages[fromNode] - nodeVoltages[toNode];
      power = voltage * current;
      
      switch (component.type) {
        case 'battery':
          // Battery generates power (positive power)
          totalPowerGenerated += Math.abs(power);
          break;
          
        case 'bulb':
        case 'resistor':
        case 'switch':
        case 'fuse':
        case 'wire':
        case 'ammeter':
        case 'voltmeter':
        case 'capacitor':
        case 'inductor':
          // These components consume power (negative power)
          totalPowerConsumed += Math.abs(power);
          break;
      }
      
      componentPowerBreakdown.set(component.id, power);
    }
  });
  
  // Calculate efficiency (power consumed / power generated)
  const efficiency = totalPowerGenerated > 0 ? (totalPowerConsumed / totalPowerGenerated) * 100 : 0;
  
  // Calculate power factor (for AC circuits, this would be cos(φ))
  // For DC circuits, power factor is 1 (unity)
  const powerFactor = 1.0;
  
  return {
    totalPowerGenerated,
    totalPowerConsumed,
    efficiency: Math.min(100, Math.max(0, efficiency)),
    powerFactor,
    componentPowerBreakdown
  };
}

/**
 * Calculate capacitor charging/discharging behavior
 */
function calculateCapacitorBehavior(
  component: Component,
  voltage: number,
  current: number,
  deltaTime: number = 0.016 // 60 FPS default
): { charge: number; energy: number; timeConstant: number } {
  const capacitance = component.properties.capacitance || 0.001; // Default 1mF
  const currentCharge = component.properties.charge || 0;
  
  // Calculate time constant (τ = RC)
  const resistance = component.properties.resistance || 1000; // Default 1kΩ
  const timeConstant = resistance * capacitance;
  
  // Calculate new charge based on current
  const newCharge = currentCharge + (current * deltaTime);
  
  // Calculate energy stored in capacitor (E = 0.5 * C * V²)
  const energy = 0.5 * capacitance * Math.pow(voltage, 2);
  
  return {
    charge: Math.max(0, newCharge), // Charge cannot be negative
    energy,
    timeConstant
  };
}

/**
 * Calculate inductor magnetic field effects
 */
function calculateInductorBehavior(
  component: Component,
  current: number
): { magneticFlux: number; energy: number; timeConstant: number } {
  const inductance = component.properties.inductance || 0.001; // Default 1mH
  // const currentMagneticFlux = component.properties.magneticFlux || 0;
  
  // Calculate time constant (τ = L/R)
  const resistance = component.properties.resistance || 0.001; // Default 1mΩ
  const timeConstant = inductance / resistance;
  
  // Calculate magnetic flux (Φ = L * I)
  const magneticFlux = inductance * current;
  
  // Calculate energy stored in inductor (E = 0.5 * L * I²)
  const energy = 0.5 * inductance * Math.pow(current, 2);
  
  return {
    magneticFlux,
    energy,
    timeConstant
  };
}

/**
 * Calculate updated component properties based on analysis results (without mutating)
 */
const calculateUpdatedComponentProperties = (
  components: Component[],
  branchCurrents: Map<string, number>,
  nodeVoltages: number[],
  nodeMap: Map<string, number>
): Map<string, Record<string, unknown>> => {
  const updatedProperties = new Map<string, Record<string, unknown>>();
  
  components.forEach(component => {
    const current = branchCurrents.get(component.id) || 0;
    const updates: Record<string, unknown> = { current };
    
    if (component.type === 'bulb') {
      const fromNode = nodeMap.get(`${component.id}_0`) ?? -1;
      const toNode = nodeMap.get(`${component.id}_1`) ?? -1;
      
      if (fromNode >= 0 && toNode >= 0) {
        const voltage = Math.abs(nodeVoltages[fromNode] - nodeVoltages[toNode]);
        const power = voltage * Math.abs(current);
        
        // Calculate brightness (0-1 scale) based on power
        const maxPower = 25; // Watts - arbitrary maximum for full brightness
        const brightness = Math.min(power / maxPower, 1);
        
        updates.power = power;
        updates.brightness = brightness;
      }
    }
    
    if (component.type === 'fuse') {
      const current = Math.abs(branchCurrents.get(component.id) || 0);
      const maxCurrent = component.properties.maxCurrent || 5;
      if (current > maxCurrent) {
        updates.isBlown = true;
      }
    }
    
    // Update capacitor behavior
    if (component.type === 'capacitor') {
      const fromNode = nodeMap.get(`${component.id}_0`) ?? -1;
      const toNode = nodeMap.get(`${component.id}_1`) ?? -1;
      
      if (fromNode >= 0 && toNode >= 0) {
        const voltage = nodeVoltages[fromNode] - nodeVoltages[toNode];
        const capacitorBehavior = calculateCapacitorBehavior(component, voltage, current);
        
        updates.charge = capacitorBehavior.charge;
        updates.energy = capacitorBehavior.energy;
        updates.timeConstant = capacitorBehavior.timeConstant;
        updates.lastUpdateTime = Date.now();
      }
    }
    
    // Update inductor behavior
    if (component.type === 'inductor') {
      const inductorBehavior = calculateInductorBehavior(component, current);
      
      updates.magneticFlux = inductorBehavior.magneticFlux;
      updates.energy = inductorBehavior.energy;
      updates.timeConstant = inductorBehavior.timeConstant;
      updates.lastUpdateTime = Date.now();
    }
    
    // Update ammeter/voltmeter readings
    if (component.type === 'ammeter') {
      updates.reading = Math.abs(current);
    }
    
    if (component.type === 'voltmeter') {
      const fromNode = nodeMap.get(`${component.id}_0`) ?? -1;
      const toNode = nodeMap.get(`${component.id}_1`) ?? -1;
      
      if (fromNode >= 0 && toNode >= 0) {
        const voltage = Math.abs(nodeVoltages[fromNode] - nodeVoltages[toNode]);
        updates.reading = voltage;
      }
    }
    
    updatedProperties.set(component.id, updates);
  });
  
  return updatedProperties;
};
