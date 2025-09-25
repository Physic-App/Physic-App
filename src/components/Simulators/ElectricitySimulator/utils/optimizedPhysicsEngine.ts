import { Component, Connection, CircuitData } from '../types/circuit';

// Sparse matrix representation for better memory efficiency
interface SparseMatrix {
  size: number;
  rows: Map<number, Map<number, number>>;
}

interface SparseVector {
  size: number;
  values: Map<number, number>;
}

interface CalculationCache {
  nodeMap: Map<string, number>;
  componentAdmittances: Map<string, any>;
  lastCircuitHash: string;
  lastResult: CircuitData | null;
}

interface PerformanceMetrics {
  calculationTime: number;
  matrixSize: number;
  nonZeroElements: number;
  cacheHits: number;
  cacheMisses: number;
}

export class OptimizedPhysicsEngine {
  private calculationCache: CalculationCache = {
    nodeMap: new Map(),
    componentAdmittances: new Map(),
    lastCircuitHash: '',
    lastResult: null
  };
  
  private performanceMetrics: PerformanceMetrics = {
    calculationTime: 0,
    matrixSize: 0,
    nonZeroElements: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  /**
   * Generate a hash for the circuit to detect changes
   */
  private generateCircuitHash(components: Component[], connections: Connection[]): string {
    const componentData = components.map(c => ({
      id: c.id,
      type: c.type,
      position: c.position,
      properties: c.properties
    }));
    
    const connectionData = connections.map(conn => ({
      id: conn.id,
      fromComponentId: conn.fromComponentId,
      toComponentId: conn.toComponentId,
      fromTerminal: conn.fromTerminal,
      toTerminal: conn.toTerminal
    }));
    
    return JSON.stringify({ components: componentData, connections: connectionData });
  }

  /**
   * Create sparse matrix
   */
  private createSparseMatrix(size: number): SparseMatrix {
    return {
      size,
      rows: new Map()
    };
  }

  /**
   * Create sparse vector
   */
  private createSparseVector(size: number): SparseVector {
    return {
      size,
      values: new Map()
    };
  }

  /**
   * Set value in sparse matrix
   */
  private setSparseMatrixValue(matrix: SparseMatrix, row: number, col: number, value: number): void {
    if (Math.abs(value) < 1e-12) return; // Skip near-zero values
    
    if (!matrix.rows.has(row)) {
      matrix.rows.set(row, new Map());
    }
    matrix.rows.get(row)!.set(col, value);
  }

  /**
   * Get value from sparse matrix
   */
  private getSparseMatrixValue(matrix: SparseMatrix, row: number, col: number): number {
    return matrix.rows.get(row)?.get(col) || 0;
  }

  /**
   * Set value in sparse vector
   */
  private setSparseVectorValue(vector: SparseVector, index: number, value: number): void {
    if (Math.abs(value) < 1e-12) {
      vector.values.delete(index);
    } else {
      vector.values.set(index, value);
    }
  }

  /**
   * Get value from sparse vector
   */
  private getSparseVectorValue(vector: SparseVector, index: number): number {
    return vector.values.get(index) || 0;
  }

  /**
   * Extract nodes with caching
   */
  private extractNodesWithCache(components: Component[]): { nodeMap: Map<string, number>, groundNodeId: string } {
    // Check if we can reuse cached node map
    if (this.calculationCache.nodeMap.size > 0) {
      const currentNodes = new Set<string>();
      components.forEach(component => {
        component.terminals.forEach((_, index) => {
          currentNodes.add(`${component.id}_${index}`);
        });
      });
      
      const cachedNodes = new Set(this.calculationCache.nodeMap.keys());
      
      // If node sets are identical, reuse cache
      if (currentNodes.size === cachedNodes.size && 
          [...currentNodes].every(node => cachedNodes.has(node))) {
        this.performanceMetrics.cacheHits++;
        return { nodeMap: this.calculationCache.nodeMap, groundNodeId: '' };
      }
    }

    this.performanceMetrics.cacheMisses++;
    
    const nodeSet = new Set<string>();
    
    components.forEach(component => {
      component.terminals.forEach((_, index) => {
        const nodeId = `${component.id}_${index}`;
        nodeSet.add(nodeId);
      });
    });
    
    let groundNodeId = '';
    const batteries = components.filter(c => c.type === 'battery');
    
    if (batteries.length > 0) {
      groundNodeId = `${batteries[0].id}_0`;
    } else if (nodeSet.size > 0) {
      groundNodeId = Array.from(nodeSet)[0];
    }
    
    const nodeMap = new Map<string, number>();
    const sortedNodes = Array.from(nodeSet).sort();
    
    if (groundNodeId && sortedNodes.includes(groundNodeId)) {
      nodeMap.set(groundNodeId, 0);
      sortedNodes.splice(sortedNodes.indexOf(groundNodeId), 1);
    }
    
    sortedNodes.forEach((nodeId, index) => {
      nodeMap.set(nodeId, index + (groundNodeId ? 1 : 0));
    });
    
    // Cache the result
    this.calculationCache.nodeMap = nodeMap;
    
    return { nodeMap, groundNodeId };
  }

  /**
   * Build sparse admittance matrix
   */
  private buildSparseAdmittanceMatrix(
    components: Component[],
    connections: Connection[],
    nodeMap: Map<string, number>
  ): { matrix: SparseMatrix, currentSources: SparseVector } {
    const numNodes = nodeMap.size;
    const matrixSize = Math.max(1, numNodes - 1);
    
    const matrix = this.createSparseMatrix(matrixSize);
    const currentSources = this.createSparseVector(matrixSize);
    
    components.forEach(component => {
      const componentAdmittance = this.getComponentAdmittanceWithCache(component, connections, nodeMap);
      
      if (componentAdmittance) {
        const { fromNode, toNode, admittance, currentSource } = componentAdmittance;
        
        if (fromNode === 0 || toNode === 0) {
          const nonGroundNode = fromNode === 0 ? toNode : fromNode;
          if (nonGroundNode > 0 && nonGroundNode < numNodes) {
            const matrixIndex = nonGroundNode - 1;
            if (matrixIndex >= 0 && matrixIndex < matrixSize) {
              const currentValue = this.getSparseMatrixValue(matrix, matrixIndex, matrixIndex);
              this.setSparseMatrixValue(matrix, matrixIndex, matrixIndex, currentValue + admittance);
              
              const currentSourceValue = this.getSparseVectorValue(currentSources, matrixIndex);
              this.setSparseVectorValue(currentSources, matrixIndex, 
                currentSourceValue + (fromNode === 0 ? -currentSource : currentSource));
            }
          }
        } else {
          if (fromNode > 0 && fromNode < numNodes && toNode > 0 && toNode < numNodes) {
            const fromIndex = fromNode - 1;
            const toIndex = toNode - 1;
            
            if (fromIndex >= 0 && fromIndex < matrixSize) {
              const currentValue = this.getSparseMatrixValue(matrix, fromIndex, fromIndex);
              this.setSparseMatrixValue(matrix, fromIndex, fromIndex, currentValue + admittance);
              
              if (toIndex >= 0 && toIndex < matrixSize) {
                const currentValue = this.getSparseMatrixValue(matrix, fromIndex, toIndex);
                this.setSparseMatrixValue(matrix, fromIndex, toIndex, currentValue - admittance);
              }
              
              const currentSourceValue = this.getSparseVectorValue(currentSources, fromIndex);
              this.setSparseVectorValue(currentSources, fromIndex, currentSourceValue + currentSource);
            }
            
            if (toIndex >= 0 && toIndex < matrixSize) {
              const currentValue = this.getSparseMatrixValue(matrix, toIndex, toIndex);
              this.setSparseMatrixValue(matrix, toIndex, toIndex, currentValue + admittance);
              
              if (fromIndex >= 0 && fromIndex < matrixSize) {
                const currentValue = this.getSparseMatrixValue(matrix, toIndex, fromIndex);
                this.setSparseMatrixValue(matrix, toIndex, fromIndex, currentValue - admittance);
              }
              
              const currentSourceValue = this.getSparseVectorValue(currentSources, toIndex);
              this.setSparseVectorValue(currentSources, toIndex, currentSourceValue - currentSource);
            }
          }
        }
      }
    });
    
    return { matrix, currentSources };
  }

  /**
   * Get component admittance with caching
   */
  private getComponentAdmittanceWithCache(
    component: Component,
    connections: Connection[],
    nodeMap: Map<string, number>
  ): any {
    const cacheKey = `${component.id}_${component.type}_${JSON.stringify(component.properties)}`;
    
    if (this.calculationCache.componentAdmittances.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      return this.calculationCache.componentAdmittances.get(cacheKey);
    }
    
    this.performanceMetrics.cacheMisses++;
    
    const result = this.calculateComponentAdmittance(component, connections, nodeMap);
    this.calculationCache.componentAdmittances.set(cacheKey, result);
    
    return result;
  }

  /**
   * Calculate component admittance (optimized version)
   */
  private calculateComponentAdmittance(
    component: Component,
    connections: Connection[],
    nodeMap: Map<string, number>
  ): any {
    const componentConnections = connections.filter(conn => 
      conn.fromComponentId === component.id || conn.toComponentId === component.id
    );
    
    if (componentConnections.length < 2) return null;
    
    const fromConnection = componentConnections.find(conn => conn.fromComponentId === component.id);
    const toConnection = componentConnections.find(conn => conn.toComponentId === component.id);
    
    if (!fromConnection || !toConnection) return null;
    
    const fromNodeId = `${component.id}_${fromConnection.fromTerminal}`;
    const toNodeId = `${component.id}_${toConnection.toTerminal}`;
    
    const fromNode = nodeMap.get(fromNodeId) ?? -1;
    const toNode = nodeMap.get(toNodeId) ?? -1;
    
    if (fromNode < 0 || toNode < 0) return null;
    
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
        currentSource = voltage / internalResistance;
        admittance = 1 / internalResistance;
        break;
      }
      
      case 'switch': {
        if (component.properties.isOn) {
          const resistance = component.properties.resistance || 0.001;
          admittance = 1 / resistance;
        }
        break;
      }
      
      case 'fuse': {
        if (!component.properties.isBlown) {
          const resistance = component.properties.resistance || 0.001;
          admittance = 1 / resistance;
        }
        break;
      }
      
      case 'wire': {
        admittance = 1 / 0.01;
        break;
      }
      
      case 'capacitor': {
        // For DC analysis, capacitor acts as open circuit
        admittance = 0;
        currentSource = 0;
        break;
      }
      
      case 'inductor': {
        const inductorResistance = component.properties.resistance || 0.001;
        admittance = 1 / inductorResistance;
        currentSource = 0;
        break;
      }
      
      default:
        return null;
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
   * Solve sparse matrix using optimized Gaussian elimination
   */
  private solveSparseMatrix(matrix: SparseMatrix, currentSources: SparseVector): number[] {
    const n = matrix.size;
    const solution = new Array(n).fill(0);
    
    // Convert sparse matrix to dense for solving (could be further optimized)
    const denseMatrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    const denseVector: number[] = Array(n).fill(0);
    
    // Fill dense matrix
    for (let i = 0; i < n; i++) {
      const row = matrix.rows.get(i);
      if (row) {
        for (const [col, value] of row) {
          denseMatrix[i][col] = value;
        }
      }
      denseVector[i] = this.getSparseVectorValue(currentSources, i);
    }
    
    // Optimized Gaussian elimination with partial pivoting
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(denseMatrix[k][i]) > Math.abs(denseMatrix[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows
      if (maxRow !== i) {
        [denseMatrix[i], denseMatrix[maxRow]] = [denseMatrix[maxRow], denseMatrix[i]];
        [denseVector[i], denseVector[maxRow]] = [denseVector[maxRow], denseVector[i]];
      }
      
      // Check for singular matrix
      if (Math.abs(denseMatrix[i][i]) < 1e-8) {
        console.warn('Matrix is singular or nearly singular');
        return new Array(n).fill(0);
      }
      
      // Eliminate column
      for (let k = i + 1; k < n; k++) {
        const factor = denseMatrix[k][i] / denseMatrix[i][i];
        for (let j = i; j < n; j++) {
          denseMatrix[k][j] -= factor * denseMatrix[i][j];
        }
        denseVector[k] -= factor * denseVector[i];
      }
    }
    
    // Back substitution
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = denseVector[i];
      for (let j = i + 1; j < n; j++) {
        solution[i] -= denseMatrix[i][j] * solution[j];
      }
      solution[i] /= denseMatrix[i][i];
    }
    
    return solution;
  }

  /**
   * Calculate branch currents with optimization
   */
  private calculateBranchCurrentsOptimized(
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
            const resistance = component.properties.resistance || 0;
            if (resistance > 0) {
              current = voltageDiff / resistance;
            }
            break;
          }
          
          case 'battery': {
            const batteryVoltage = component.properties.voltage || 0;
            const batteryResistance = component.properties.resistance || 0.001;
            const positiveTerminalVoltage = nodeVoltages[fromNode];
            const negativeTerminalVoltage = nodeVoltages[toNode];
            
            if (positiveTerminalVoltage > negativeTerminalVoltage) {
              current = (batteryVoltage - voltageDiff) / batteryResistance;
            } else {
              current = -(batteryVoltage + voltageDiff) / batteryResistance;
            }
            break;
          }
          
          case 'switch': {
            if (component.properties.isOn) {
              const switchResistance = component.properties.resistance || 0.001;
              current = voltageDiff / switchResistance;
            }
            break;
          }
          
          case 'fuse': {
            if (!component.properties.isBlown) {
              const fuseResistance = component.properties.resistance || 0.001;
              current = voltageDiff / fuseResistance;
            }
            break;
          }
          
          case 'wire': {
            current = voltageDiff / 0.01;
            break;
          }
          
          case 'capacitor': {
            current = 0;
            break;
          }
          
          case 'inductor': {
            const inductorResistance = component.properties.resistance || 0.001;
            current = voltageDiff / inductorResistance;
            break;
          }
        }
        
        branchCurrents.set(component.id, current);
      }
    });
    
    return branchCurrents;
  }

  /**
   * Main optimized circuit analysis function
   */
  calculateCircuitPropertiesOptimized(
    components: Component[],
    connections: Connection[],
    voltage: number
  ): CircuitData {
    const startTime = performance.now();
    
    // Check cache first
    const circuitHash = this.generateCircuitHash(components, connections);
    if (circuitHash === this.calculationCache.lastCircuitHash && this.calculationCache.lastResult) {
      this.performanceMetrics.cacheHits++;
      return this.calculationCache.lastResult;
    }
    
    this.performanceMetrics.cacheMisses++;
    
    // Handle empty circuit
    if (components.length === 0) {
      const result: CircuitData = {
        totalVoltage: voltage,
        totalCurrent: 0,
        totalResistance: 0,
        totalPower: 0,
        isShortCircuit: false,
        fuseBlown: false
      };
      
      this.calculationCache.lastCircuitHash = circuitHash;
      this.calculationCache.lastResult = result;
      return result;
    }
    
    // Extract nodes with caching
    const { nodeMap } = this.extractNodesWithCache(components);
    
    if (nodeMap.size === 0) {
      const result: CircuitData = {
        totalVoltage: voltage,
        totalCurrent: 0,
        totalResistance: 0,
        totalPower: 0,
        isShortCircuit: false,
        fuseBlown: false
      };
      
      this.calculationCache.lastCircuitHash = circuitHash;
      this.calculationCache.lastResult = result;
      return result;
    }
    
    // Build sparse admittance matrix
    const { matrix, currentSources } = this.buildSparseAdmittanceMatrix(components, connections, nodeMap);
    
    // Update performance metrics
    this.performanceMetrics.matrixSize = matrix.size;
    this.performanceMetrics.nonZeroElements = Array.from(matrix.rows.values())
      .reduce((sum, row) => sum + row.size, 0);
    
    // Solve for node voltages
    const nodeVoltages = this.solveSparseMatrix(matrix, currentSources);
    const fullNodeVoltages = [0, ...nodeVoltages];
    
    // Calculate branch currents
    const branchCurrents = this.calculateBranchCurrentsOptimized(components, nodeMap, fullNodeVoltages);
    
    // Calculate circuit properties
    const batteries = components.filter(c => c.type === 'battery');
    const fuses = components.filter(c => c.type === 'fuse');
    
    let totalVoltage = voltage;
    let totalCurrent = 0;
    let fuseBlown = false;
    
    batteries.forEach(battery => {
      const current = Math.abs(branchCurrents.get(battery.id) || 0);
      totalCurrent += current;
    });
    
    fuses.forEach(fuse => {
      const current = Math.abs(branchCurrents.get(fuse.id) || 0);
      if (current > (fuse.properties.maxCurrent || 5)) {
        fuseBlown = true;
      }
    });
    
    const totalResistance = totalCurrent > 0 ? totalVoltage / totalCurrent : 0;
    const totalPower = totalVoltage * totalCurrent;
    const isShortCircuit = totalResistance < 0.1 && totalCurrent > 1;
    
    const result: CircuitData = {
      totalVoltage,
      totalCurrent: fuseBlown ? 0 : totalCurrent,
      totalResistance: fuseBlown ? Infinity : totalResistance,
      totalPower: fuseBlown ? 0 : totalPower,
      isShortCircuit: isShortCircuit && !fuseBlown,
      fuseBlown
    };
    
    // Cache the result
    this.calculationCache.lastCircuitHash = circuitHash;
    this.calculationCache.lastResult = result;
    
    // Update performance metrics
    this.performanceMetrics.calculationTime = performance.now() - startTime;
    
    return result;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.calculationCache = {
      nodeMap: new Map(),
      componentAdmittances: new Map(),
      lastCircuitHash: '',
      lastResult: null
    };
    
    this.performanceMetrics = {
      calculationTime: 0,
      matrixSize: 0,
      nonZeroElements: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
}

// Global optimized physics engine instance
export const optimizedPhysicsEngine = new OptimizedPhysicsEngine();
