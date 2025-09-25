import { Component, Connection } from '../../types/circuit';
import {
  calculateCircuitProperties,
  extractNodes,
  buildAdmittanceMatrix,
  performNodalAnalysis,
  calculateBranchCurrents,
  validateKCL,
  validateKVL,
  detectShortCircuits,
  calculatePowerAnalysis,
  calculateCapacitorBehavior,
  calculateInductorBehavior
} from '../circuitPhysics';

describe('Circuit Physics Engine', () => {
  const mockBattery: Component = {
    id: 'battery-1',
    type: 'battery',
    position: { x: 100, y: 100 },
    terminals: [
      { x: 0, y: 0 },
      { x: 40, y: 0 }
    ],
    properties: { voltage: 12, resistance: 0.001 }
  };

  const mockResistor: Component = {
    id: 'resistor-1',
    type: 'resistor',
    position: { x: 200, y: 100 },
    terminals: [
      { x: 0, y: 0 },
      { x: 40, y: 0 }
    ],
    properties: { resistance: 100 }
  };

  const mockConnection: Connection = {
    id: 'conn-1',
    fromComponentId: 'battery-1',
    toComponentId: 'resistor-1',
    fromTerminal: 1,
    toTerminal: 0
  };

  describe('extractNodes', () => {
    it('extracts nodes correctly from components and connections', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];

      const result = extractNodes(components, connections);

      expect(result.nodes).toHaveLength(2);
      expect(result.nodeMap).toHaveProperty('battery-1-1');
      expect(result.nodeMap).toHaveProperty('resistor-1-0');
      expect(result.groundNodeId).toBe('battery-1-0'); // First battery negative terminal
    });

    it('handles components without connections', () => {
      const components = [mockBattery];
      const connections: Connection[] = [];

      const result = extractNodes(components, connections);

      expect(result.nodes).toHaveLength(2);
      expect(result.groundNodeId).toBe('battery-1-0');
    });

    it('selects appropriate ground node when no battery present', () => {
      const components = [mockResistor];
      const connections: Connection[] = [];

      const result = extractNodes(components, connections);

      expect(result.nodes).toHaveLength(2);
      expect(result.groundNodeId).toBe('resistor-1-0'); // First available node
    });
  });

  describe('buildAdmittanceMatrix', () => {
    it('builds admittance matrix correctly for simple circuit', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];
      const { nodes, nodeMap, groundNodeId } = extractNodes(components, connections);

      const result = buildAdmittanceMatrix(components, connections, nodes, nodeMap, groundNodeId);

      expect(result.matrix).toHaveLength(1); // 2 nodes - 1 ground = 1x1 matrix
      expect(result.currentSources).toHaveLength(1);
      expect(result.matrix[0][0]).toBeCloseTo(0.01, 3); // 1/100 ohm
    });

    it('handles parallel components correctly', () => {
      const parallelResistor: Component = {
        id: 'resistor-2',
        type: 'resistor',
        position: { x: 300, y: 100 },
        terminals: [
          { x: 0, y: 0 },
          { x: 40, y: 0 }
        ],
        properties: { resistance: 200 }
      };

      const parallelConnection: Connection = {
        id: 'conn-2',
        fromComponentId: 'resistor-1',
        toComponentId: 'resistor-2',
        fromTerminal: 1,
        toTerminal: 0
      };

      const components = [mockBattery, mockResistor, parallelResistor];
      const connections = [mockConnection, parallelConnection];
      const { nodes, nodeMap, groundNodeId } = extractNodes(components, connections);

      const result = buildAdmittanceMatrix(components, connections, nodes, nodeMap, groundNodeId);

      expect(result.matrix[0][0]).toBeCloseTo(0.015, 3); // 1/100 + 1/200
    });
  });

  describe('performNodalAnalysis', () => {
    it('solves simple circuit correctly', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];

      const result = performNodalAnalysis(components, connections);

      expect(result.nodeVoltages).toHaveLength(2);
      expect(result.nodeVoltages[0]).toBeCloseTo(0, 3); // Ground node
      expect(result.nodeVoltages[1]).toBeCloseTo(12, 3); // Battery positive terminal
    });

    it('handles complex circuit with multiple nodes', () => {
      const resistor2: Component = {
        id: 'resistor-2',
        type: 'resistor',
        position: { x: 300, y: 100 },
        terminals: [
          { x: 0, y: 0 },
          { x: 40, y: 0 }
        ],
        properties: { resistance: 50 }
      };

      const connection2: Connection = {
        id: 'conn-2',
        fromComponentId: 'resistor-1',
        toComponentId: 'resistor-2',
        fromTerminal: 1,
        toTerminal: 0
      };

      const components = [mockBattery, mockResistor, resistor2];
      const connections = [mockConnection, connection2];

      const result = performNodalAnalysis(components, connections);

      expect(result.nodeVoltages).toHaveLength(3);
      expect(result.nodeVoltages[0]).toBeCloseTo(0, 3); // Ground
      expect(result.nodeVoltages[1]).toBeCloseTo(12, 3); // Battery positive
      expect(result.nodeVoltages[2]).toBeCloseTo(4, 3); // Between resistors (voltage divider)
    });
  });

  describe('calculateBranchCurrents', () => {
    it('calculates branch currents correctly', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];
      const analysisResult = performNodalAnalysis(components, connections);

      const result = calculateBranchCurrents(components, connections, analysisResult);

      expect(result).toHaveProperty('battery-1');
      expect(result).toHaveProperty('resistor-1');
      expect(result['resistor-1']).toBeCloseTo(0.12, 3); // 12V / 100Ω
    });

    it('handles current direction correctly', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];
      const analysisResult = performNodalAnalysis(components, connections);

      const result = calculateBranchCurrents(components, connections, analysisResult);

      // Battery should supply current (positive)
      expect(result['battery-1']).toBeGreaterThan(0);
      // Resistor should consume current (positive in direction of voltage drop)
      expect(result['resistor-1']).toBeGreaterThan(0);
    });
  });

  describe('validateKCL', () => {
    it('validates KCL correctly for valid circuit', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];
      const analysisResult = performNodalAnalysis(components, connections);
      const branchCurrents = calculateBranchCurrents(components, connections, analysisResult);

      const result = validateKCL(components, connections, branchCurrents, analysisResult);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects KCL violations', () => {
      // Create a circuit that violates KCL (impossible current flow)
      const invalidResistor: Component = {
        id: 'resistor-invalid',
        type: 'resistor',
        position: { x: 200, y: 100 },
        terminals: [
          { x: 0, y: 0 },
          { x: 40, y: 0 }
        ],
        properties: { resistance: -100 } // Negative resistance violates physics
      };

      const components = [mockBattery, invalidResistor];
      const connections = [mockConnection];
      const analysisResult = performNodalAnalysis(components, connections);
      const branchCurrents = calculateBranchCurrents(components, connections, analysisResult);

      const result = validateKCL(components, connections, branchCurrents, analysisResult);

      // Should detect issues with negative resistance
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateKVL', () => {
    it('validates KVL correctly for valid circuit', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];
      const analysisResult = performNodalAnalysis(components, connections);
      const branchCurrents = calculateBranchCurrents(components, connections, analysisResult);

      const result = validateKVL(components, connections, branchCurrents, analysisResult);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects KVL violations in closed loops', () => {
      // Create a circuit with multiple loops
      const resistor2: Component = {
        id: 'resistor-2',
        type: 'resistor',
        position: { x: 300, y: 100 },
        terminals: [
          { x: 0, y: 0 },
          { x: 40, y: 0 }
        ],
        properties: { resistance: 50 }
      };

      const connection2: Connection = {
        id: 'conn-2',
        fromComponentId: 'resistor-1',
        toComponentId: 'resistor-2',
        fromTerminal: 1,
        toTerminal: 0
      };

      const connection3: Connection = {
        id: 'conn-3',
        fromComponentId: 'resistor-2',
        toComponentId: 'battery-1',
        fromTerminal: 1,
        toTerminal: 0
      };

      const components = [mockBattery, mockResistor, resistor2];
      const connections = [mockConnection, connection2, connection3];
      const analysisResult = performNodalAnalysis(components, connections);
      const branchCurrents = calculateBranchCurrents(components, connections, analysisResult);

      const result = validateKVL(components, connections, branchCurrents, analysisResult);

      expect(result.isValid).toBe(true); // Should be valid for this circuit
    });
  });

  describe('detectShortCircuits', () => {
    it('detects short circuits correctly', () => {
      const shortCircuitResistor: Component = {
        id: 'resistor-short',
        type: 'resistor',
        position: { x: 200, y: 100 },
        terminals: [
          { x: 0, y: 0 },
          { x: 40, y: 0 }
        ],
        properties: { resistance: 0.001 } // Very low resistance
      };

      const components = [mockBattery, shortCircuitResistor];
      const connections = [mockConnection];
      const analysisResult = performNodalAnalysis(components, connections);

      const result = detectShortCircuits(components, connections, analysisResult);

      expect(result.isShortCircuit).toBe(true);
      expect(result.shortCircuitComponents).toContain('resistor-short');
    });

    it('does not detect false short circuits', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];
      const analysisResult = performNodalAnalysis(components, connections);

      const result = detectShortCircuits(components, connections, analysisResult);

      expect(result.isShortCircuit).toBe(false);
      expect(result.shortCircuitComponents).toHaveLength(0);
    });
  });

  describe('calculatePowerAnalysis', () => {
    it('calculates power analysis correctly', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];
      const analysisResult = performNodalAnalysis(components, connections);
      const branchCurrents = calculateBranchCurrents(components, connections, analysisResult);

      const result = calculatePowerAnalysis(components, connections, branchCurrents, analysisResult);

      expect(result.totalPowerGenerated).toBeCloseTo(1.44, 3); // 12V * 0.12A
      expect(result.totalPowerConsumed).toBeCloseTo(1.44, 3); // 12V * 0.12A
      expect(result.efficiency).toBeCloseTo(1.0, 3);
      expect(result.powerFactor).toBeCloseTo(1.0, 3);
    });

    it('handles reactive components in power analysis', () => {
      const capacitor: Component = {
        id: 'capacitor-1',
        type: 'capacitor',
        position: { x: 200, y: 100 },
        terminals: [
          { x: 0, y: 0 },
          { x: 40, y: 0 }
        ],
        properties: { capacitance: 0.001, voltage: 0 }
      };

      const components = [mockBattery, capacitor];
      const connections = [mockConnection];
      const analysisResult = performNodalAnalysis(components, connections);
      const branchCurrents = calculateBranchCurrents(components, connections, analysisResult);

      const result = calculatePowerAnalysis(components, connections, branchCurrents, analysisResult);

      expect(result.powerFactor).toBeLessThan(1.0); // Capacitor introduces phase shift
    });
  });

  describe('calculateCapacitorBehavior', () => {
    it('calculates capacitor behavior correctly', () => {
      const capacitor: Component = {
        id: 'capacitor-1',
        type: 'capacitor',
        position: { x: 200, y: 100 },
        terminals: [
          { x: 0, y: 0 },
          { x: 40, y: 0 }
        ],
        properties: { capacitance: 0.001, voltage: 6 }
      };

      const result = calculateCapacitorBehavior(capacitor, 0.12, 0.1);

      expect(result.charge).toBeCloseTo(0.0006, 6); // C * V
      expect(result.energy).toBeCloseTo(0.0018, 6); // 0.5 * C * V^2
      expect(result.timeConstant).toBeCloseTo(0.1, 3); // R * C (assuming R=100Ω)
    });
  });

  describe('calculateInductorBehavior', () => {
    it('calculates inductor behavior correctly', () => {
      const inductor: Component = {
        id: 'inductor-1',
        type: 'inductor',
        position: { x: 200, y: 100 },
        terminals: [
          { x: 0, y: 0 },
          { x: 40, y: 0 }
        ],
        properties: { inductance: 0.01, current: 0.12 }
      };

      const result = calculateInductorBehavior(inductor, 12, 0.1);

      expect(result.magneticFlux).toBeCloseTo(0.0012, 6); // L * I
      expect(result.energy).toBeCloseTo(0.000072, 9); // 0.5 * L * I^2
      expect(result.timeConstant).toBeCloseTo(0.001, 6); // L / R (assuming R=10Ω)
    });
  });

  describe('calculateCircuitProperties', () => {
    it('calculates complete circuit properties', () => {
      const components = [mockBattery, mockResistor];
      const connections = [mockConnection];

      const result = calculateCircuitProperties(components, connections);

      expect(result.totalCurrent).toBeCloseTo(0.12, 3);
      expect(result.totalVoltage).toBeCloseTo(12, 3);
      expect(result.totalPower).toBeCloseTo(1.44, 3);
      expect(result.totalResistance).toBeCloseTo(100, 3);
      expect(result.isShortCircuit).toBe(false);
      expect(result.kclValid).toBe(true);
      expect(result.kvlValid).toBe(true);
      expect(result.validationErrors).toHaveLength(0);
      expect(result.updatedComponentProperties).toBeInstanceOf(Map);
      expect(result.powerAnalysis).toBeDefined();
    });

    it('handles empty circuit', () => {
      const components: Component[] = [];
      const connections: Connection[] = [];

      const result = calculateCircuitProperties(components, connections);

      expect(result.totalCurrent).toBe(0);
      expect(result.totalVoltage).toBe(0);
      expect(result.totalPower).toBe(0);
      expect(result.totalResistance).toBe(0);
      expect(result.isShortCircuit).toBe(false);
    });

    it('handles circuit with only components (no connections)', () => {
      const components = [mockBattery, mockResistor];
      const connections: Connection[] = [];

      const result = calculateCircuitProperties(components, connections);

      expect(result.totalCurrent).toBe(0);
      expect(result.totalVoltage).toBe(0);
      expect(result.totalPower).toBe(0);
    });
  });
});
