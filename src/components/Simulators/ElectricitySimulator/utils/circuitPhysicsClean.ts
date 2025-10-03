import { Component, Connection, CircuitData } from '../types/circuit';
import { 
  extractNodes, 
  getComponentAdmittance, 
  solveMatrix, 
  calculateBranchCurrents,
  NodeAnalysisResult 
} from './circuitPhysicsCore';

/**
 * Clean, modular circuit physics engine
 * Separated into focused functions for better maintainability
 */

/**
 * Build admittance matrix and current source vector for nodal analysis
 */
function buildAdmittanceMatrix(
  components: Component[],
  connections: Connection[],
  nodeMap: Map<string, number>
): { matrix: number[][], currentSources: number[] } {
  const numNodes = nodeMap.size;
  const matrixSize = Math.max(1, numNodes - 1);
  const matrix: number[][] = Array(matrixSize).fill(null).map(() => Array(matrixSize).fill(0));
  const currentSources: number[] = Array(matrixSize).fill(0);
  
  components.forEach(component => {
    const componentAdmittance = getComponentAdmittance(component, connections, nodeMap);
    
    if (componentAdmittance) {
      const { fromNode, toNode, admittance, currentSource } = componentAdmittance;
      
      // Handle connections to ground
      if (fromNode === 0 || toNode === 0) {
        const nonGroundNode = fromNode === 0 ? toNode : fromNode;
        if (nonGroundNode > 0 && nonGroundNode < numNodes) {
          const matrixIndex = nonGroundNode - 1;
          if (matrixIndex >= 0 && matrixIndex < matrixSize) {
            matrix[matrixIndex][matrixIndex] += admittance;
            currentSources[matrixIndex] += fromNode === 0 ? -currentSource : currentSource;
          }
        }
      } else {
        // Handle connections between non-ground nodes
        const fromIndex = fromNode - 1;
        const toIndex = toNode - 1;
        
        if (fromIndex >= 0 && fromIndex < matrixSize) {
          matrix[fromIndex][fromIndex] += admittance;
          if (toIndex >= 0 && toIndex < matrixSize) {
            matrix[fromIndex][toIndex] -= admittance;
            matrix[toIndex][fromIndex] -= admittance;
          }
          currentSources[fromIndex] += currentSource;
        }
        
        if (toIndex >= 0 && toIndex < matrixSize) {
          matrix[toIndex][toIndex] += admittance;
          currentSources[toIndex] -= currentSource;
        }
      }
    }
  });
  
  return { matrix, currentSources };
}

/**
 * Perform nodal analysis to solve for node voltages
 */
function performNodalAnalysis(
  components: Component[],
  connections: Connection[]
): NodeAnalysisResult {
  const { nodeMap } = extractNodes(components);
  const { matrix, currentSources } = buildAdmittanceMatrix(components, connections, nodeMap);
  
  const solvedVoltages = solveMatrix(matrix, currentSources);
  
  // Prepend 0V for ground node
  const nodeVoltages = [0, ...solvedVoltages];
  const branchCurrents = calculateBranchCurrents(components, connections, nodeVoltages, nodeMap);
  
  return {
    nodeVoltages,
    nodeMap,
    branchCurrents
  };
}

/**
 * Calculate updated component properties based on circuit analysis
 */
function calculateUpdatedComponentProperties(
  components: Component[],
  branchCurrents: Map<string, number>,
  nodeVoltages: number[],
  nodeMap: Map<string, number>
): Map<string, Record<string, unknown>> {
  const updates = new Map<string, Record<string, unknown>>();
  
  components.forEach(component => {
    const current = branchCurrents.get(component.id) ?? 0;
    const componentUpdates: Record<string, unknown> = { current };
    
    switch (component.type) {
      case 'bulb': {
        const resistance = component.properties.resistance ?? 10;
        const power = current * current * resistance;
        const brightness = Math.min(1, power / 10); // Normalize brightness
        componentUpdates.power = power;
        componentUpdates.brightness = brightness;
        break;
      }
      case 'fuse': {
        const maxCurrent = component.properties.maxCurrent ?? 1;
        const isBlown = Math.abs(current) > maxCurrent;
        componentUpdates.isBlown = isBlown;
        break;
      }
      case 'ammeter': {
        componentUpdates.reading = Math.abs(current);
        break;
      }
      case 'voltmeter': {
        // Calculate voltage across voltmeter
        const componentConnections = component.terminals.map((_, index) => 
          nodeMap.get(`${component.id}_${index}`) ?? 0
        );
        if (componentConnections.length >= 2) {
          const voltage = nodeVoltages[componentConnections[0]] - nodeVoltages[componentConnections[1]];
          componentUpdates.reading = Math.abs(voltage);
        }
        break;
      }
    }
    
    updates.set(component.id, componentUpdates);
  });
  
  return updates;
}

/**
 * Validate Kirchhoff's Current Law (KCL)
 */
function validateKCL(
  components: Component[],
  connections: Connection[],
  branchCurrents: Map<string, number>,
  nodeMap: Map<string, number>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check KCL at each node
  nodeMap.forEach((nodeIndex, nodeId) => {
    if (nodeIndex === 0) return; // Skip ground node
    
    let totalCurrent = 0;
    
    // Sum currents from all connected components
    components.forEach(component => {
      const current = branchCurrents.get(component.id) ?? 0;
      
      component.terminals.forEach((_, terminalIndex) => {
        const componentNodeId = `${component.id}_${terminalIndex}`;
        if (componentNodeId === nodeId) {
          // Current flowing into node is positive
          totalCurrent += current;
        }
      });
    });
    
    if (Math.abs(totalCurrent) > 0.001) {
      errors.push(`KCL violation at node ${nodeId}: ${totalCurrent.toFixed(6)}A`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate Kirchhoff's Voltage Law (KVL)
 */
function validateKVL(
  components: Component[],
  connections: Connection[],
  branchCurrents: Map<string, number>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Simple KVL validation - check that total voltage sources equal total voltage drops
  let totalVoltageSources = 0;
  let totalVoltageDrops = 0;
  
  components.forEach(component => {
    const current = branchCurrents.get(component.id) ?? 0;
    
    switch (component.type) {
      case 'battery': {
        totalVoltageSources += component.properties.voltage ?? 0;
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
        const resistance = component.properties.resistance ?? 0;
        totalVoltageDrops += Math.abs(current * resistance);
        break;
      }
    }
  });
  
  const voltageDifference = Math.abs(totalVoltageSources - totalVoltageDrops);
  if (voltageDifference > 0.01) {
    errors.push(`KVL violation: voltage difference ${voltageDifference.toFixed(6)}V`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Detect short circuits in the circuit
 */
function detectShortCircuits(
  components: Component[],
  branchCurrents: Map<string, number>
): { isShortCircuit: boolean; shortCircuitComponents: string[] } {
  const shortCircuitComponents: string[] = [];
  
  components.forEach(component => {
    const current = branchCurrents.get(component.id) ?? 0;
    
    // Check for excessive current
    switch (component.type) {
      case 'resistor':
      case 'bulb': {
        const maxCurrent = 10; // Reasonable limit
        if (Math.abs(current) > maxCurrent) {
          shortCircuitComponents.push(component.id);
        }
        break;
      }
      case 'fuse': {
        const maxCurrent = component.properties.maxCurrent ?? 1;
        if (Math.abs(current) > maxCurrent) {
          shortCircuitComponents.push(component.id);
        }
        break;
      }
    }
  });
  
  return {
    isShortCircuit: shortCircuitComponents.length > 0,
    shortCircuitComponents
  };
}

/**
 * Calculate power analysis for the circuit
 */
function calculatePowerAnalysis(
  components: Component[],
  branchCurrents: Map<string, number>,
  nodeMap: Map<string, number>
): {
  totalPowerGenerated: number;
  totalPowerConsumed: number;
  efficiency: number;
  powerFactor: number;
  componentPower: Map<string, number>;
} {
  let totalPowerGenerated = 0;
  let totalPowerConsumed = 0;
  const componentPower = new Map<string, number>();
  
  components.forEach(component => {
    const current = branchCurrents.get(component.id) ?? 0;
    let power = 0;
    
    switch (component.type) {
      case 'battery': {
        const voltage = component.properties.voltage ?? 0;
        power = voltage * current;
        if (power > 0) {
          totalPowerGenerated += power;
        } else {
          totalPowerConsumed += Math.abs(power);
        }
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
        const resistance = component.properties.resistance ?? 0;
        power = current * current * resistance;
        totalPowerConsumed += power;
        break;
      }
    }
    
    componentPower.set(component.id, power);
  });
  
  const efficiency = totalPowerGenerated > 0 ? (totalPowerConsumed / totalPowerGenerated) * 100 : 0;
  const powerFactor = totalPowerGenerated > 0 ? totalPowerConsumed / totalPowerGenerated : 0;
  
  return {
    totalPowerGenerated,
    totalPowerConsumed,
    efficiency,
    powerFactor,
    componentPower
  };
}

/**
 * Main function to calculate circuit properties
 */
export function calculateCircuitProperties(
  components: Component[],
  connections: Connection[],
  voltage: number
): CircuitData {
  if (components.length === 0) {
    return {
      totalVoltage: 0,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
      isShortCircuit: false,
      fuseBlown: false
    };
  }
  
  try {
    // Perform nodal analysis
    const analysisResult = performNodalAnalysis(components, connections);
    
    // Calculate updated component properties
    const updatedComponentProperties = calculateUpdatedComponentProperties(
      components,
      analysisResult.branchCurrents,
      analysisResult.nodeVoltages,
      analysisResult.nodeMap
    );
    
    // Validate circuit laws
    const kclValidation = validateKCL(components, connections, analysisResult.branchCurrents, analysisResult.nodeMap);
    const kvlValidation = validateKVL(components, connections, analysisResult.branchCurrents);
    
    // Detect short circuits
    const shortCircuitResult = detectShortCircuits(components, analysisResult.branchCurrents);
    
    // Calculate power analysis
    const powerAnalysis = calculatePowerAnalysis(components, analysisResult.branchCurrents, analysisResult.nodeMap);
    
    // Calculate total circuit properties
    const totalCurrent = Math.abs(Array.from(analysisResult.branchCurrents.values()).reduce((sum, current) => sum + current, 0));
    const totalResistance = voltage > 0 ? voltage / totalCurrent : 0;
    const totalPower = powerAnalysis.totalPowerConsumed;
    
    // Check for blown fuses
    const fuseBlown = components.some(component => 
      component.type === 'fuse' && updatedComponentProperties.get(component.id)?.isBlown
    );
    
    return {
      totalVoltage: voltage,
      totalCurrent,
      totalResistance,
      totalPower,
      isShortCircuit: shortCircuitResult.isShortCircuit,
      fuseBlown,
      updatedComponentProperties,
      kclValid: kclValidation.isValid,
      kvlValid: kvlValidation.isValid,
      validationErrors: [...kclValidation.errors, ...kvlValidation.errors],
      powerAnalysis
    };
    
  } catch (error) {
    console.error('Circuit analysis error:', error);
    return {
      totalVoltage: voltage,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
      isShortCircuit: false,
      fuseBlown: false,
      validationErrors: [`Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

