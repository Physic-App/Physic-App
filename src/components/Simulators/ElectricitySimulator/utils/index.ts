// Physics Engine
export { calculateCircuitProperties } from './circuitPhysics';

// Canvas Rendering
export { renderCircuit, drawComponent, drawConnection } from './canvasRenderer';
export { optimizedCanvasRenderer } from './optimizedCanvasRenderer';

// Validation
export { validateComponent, validateConnection, validateCircuit } from './validation';

// Smart Placement
export { smartPlacement, autoAlignToGrid, snapToConnection } from './smartPlacement';

// Animation
export { animationManager } from './animationManager';

// Performance
export { optimizedPhysicsEngine } from './optimizedPhysicsEngine';
export { componentPool, memoryMonitor } from './objectPool';

// Code Splitting
export { lazyLoadComponent, codeSplitRoute } from './codeSplitting';

// Simulation Modes
export { simulationModes, realTimeSimulation, stepByStepSimulation } from './simulationModes';

// Assessment
export { assessmentSystem, createChallenge, autoGrade } from './assessmentSystem';

// Collaboration
export { collaborationSystem, CollaborationManager } from './collaborationSystem';
