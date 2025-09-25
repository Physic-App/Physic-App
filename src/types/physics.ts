export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface PhysicsObject {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  radius: number;
  material: 'wood' | 'metal' | 'rubber' | 'ice';
  temperature: number;
}

export interface ForceVector {
  name: string;
  vector: Vector2D;
  color: string;
  visible: boolean;
  magnitude: number;
  angle: number;
  description: string;
}

export interface SimulationState {
  object: PhysicsObject;
  forces: ForceVector[];
  appliedForce: number;
  inclineAngle: number;
  frictionCoefficient: number;
  surfaceType: 'smooth' | 'rough';
  isRunning: boolean;
  currentLaw?: 'first' | 'second' | 'third';
  showVectors?: boolean;
  simulationSpeed: number;
  environment: 'earth' | 'moon' | 'mars' | 'space';
  airResistance: boolean;
  showTrajectory: boolean;
  showGrid: boolean;
  showMeasurements: boolean;
  vectorScale: number;
  timeElapsed: number;
  netForce?: Vector2D;
}

export interface PredictionData {
  expectedAcceleration?: number;
  expectedMomentum?: number;
  expectedVelocity?: number;
  expectedDisplacement?: number;
  actualResult?: number;
  isCorrect?: boolean;
  accuracy: number;
  explanation: string;
}

export interface PlotData {
  time: number[];
  velocity: number[];
  acceleration: number[];
  force: number[];
  position: number[];
  momentum: number[];
  kineticEnergy: number[];
  potentialEnergy: number[];
}

// Simulator-specific types
export type SimulatorType = 'newton' | 'friction' | 'collision' | 'gravity';

export interface SimulatorProps {
  settings: GlobalSettings;
}

export interface GlobalSettings {
  theme: 'dark' | 'light';
  showGrid: boolean;
  showTrajectory: boolean;
  showVectors: boolean;
  simulationSpeed: number;
  environment: 'earth' | 'moon' | 'mars' | 'space';
}

// Canvas and UI types
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  gridColor?: string;
  gridSize?: number;
}

export interface SimulationData {
  time: number;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  netForce: Vector2D;
  kineticEnergy: number;
  potentialEnergy: number;
}