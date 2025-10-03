export interface Position {
  x: number;
  y: number;
}

export interface Component {
  id: string;
  type: 'battery' | 'bulb' | 'resistor' | 'switch' | 'fuse' | 'wire' | 'capacitor' | 'ammeter' | 'voltmeter' | 'inductor';
  position: Position;
  properties: {
    voltage?: number;
    resistance?: number;
    power?: number;
    isOn?: boolean;
    current?: number;
    brightness?: number;
    isBlown?: boolean;
    maxCurrent?: number;
    capacitance?: number;
    charge?: number;
    energy?: number;
    reading?: number;
    inductance?: number;
    magneticFlux?: number;
    timeConstant?: number;
    lastUpdateTime?: number;
  };
  terminals: Position[];
}

export interface Connection {
  id: string;
  fromComponentId: string;
  toComponentId: string;
  fromTerminal: number;
  toTerminal: number;
}

export interface CircuitData {
  totalVoltage: number;
  totalCurrent: number;
  totalResistance: number;
  totalPower: number;
  isShortCircuit: boolean;
  fuseBlown: boolean;
  updatedComponentProperties?: Map<string, any>;
  kclValid?: boolean;
  kvlValid?: boolean;
  validationErrors?: string[];
  powerAnalysis?: {
    totalPowerGenerated: number;
    totalPowerConsumed: number;
    efficiency: number;
    powerFactor: number;
    componentPowerBreakdown: Map<string, number>;
  };
}

export type CircuitMode = 'series' | 'parallel' | 'mixed';
