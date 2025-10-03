import { useState, useCallback, useRef } from 'react';
import { SimulationState, Vector2D } from '../types/physics';

interface UseSimulationOptions {
  initialObject: {
    position: Vector2D;
    velocity: Vector2D;
    acceleration: Vector2D;
    mass: number;
    radius: number;
    material: string;
    temperature: number;
  };
  initialSettings?: Partial<SimulationState>;
}

export const useSimulation = (options: UseSimulationOptions) => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    object: options.initialObject,
    forces: [],
    appliedForce: 0,
    inclineAngle: 0,
    frictionCoefficient: 0.1,
    surfaceType: 'smooth',
    isRunning: false,
    simulationSpeed: 1.0,
    environment: 'earth',
    airResistance: false,
    showTrajectory: true,
    showGrid: true,
    showMeasurements: true,
    vectorScale: 1.0,
    timeElapsed: 0,
    netForce: { x: 0, y: 0 },
    ...options.initialSettings
  });

  const [trajectoryPoints, setTrajectoryPoints] = useState<Vector2D[]>([]);
  const animationRef = useRef<number>();

  const updateState = useCallback((updates: Partial<SimulationState>) => {
    setSimulationState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleRunning = useCallback(() => {
    setSimulationState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const reset = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      object: options.initialObject,
      timeElapsed: 0,
      isRunning: false
    }));
    setTrajectoryPoints([]);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [options.initialObject]);

  const addTrajectoryPoint = useCallback((point: Vector2D) => {
    setTrajectoryPoints(prev => {
      const newPoints = [...prev, point];
      return newPoints.slice(-500); // Keep last 500 points
    });
  }, []);

  const clearTrajectory = useCallback(() => {
    setTrajectoryPoints([]);
  }, []);

  return {
    simulationState,
    trajectoryPoints,
    updateState,
    toggleRunning,
    reset,
    addTrajectoryPoint,
    clearTrajectory,
    animationRef
  };
};
