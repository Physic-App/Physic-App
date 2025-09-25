import { Component, Connection, CircuitData } from '../types/circuit';

export type SimulationMode = 'real-time' | 'step-by-step' | 'paused' | 'stopped';
export type SimulationSpeed = 'slow' | 'normal' | 'fast' | 'ultra-fast';

interface SimulationState {
  mode: SimulationMode;
  speed: SimulationSpeed;
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
  startTime: number;
  elapsedTime: number;
  stepInterval: number;
  lastUpdateTime: number;
}

interface SimulationStep {
  stepNumber: number;
  timestamp: number;
  description: string;
  circuitData: CircuitData;
  componentStates: Map<string, any>;
  connectionStates: Map<string, any>;
}

interface SimulationHistory {
  steps: SimulationStep[];
  maxSteps: number;
  currentIndex: number;
}

export class SimulationModeManager {
  private state: SimulationState;
  private history: SimulationHistory;
  private animationFrameId: number | null = null;
  private stepTimeoutId: number | null = null;
  private onStepCallback?: (step: SimulationStep) => void;
  private onModeChangeCallback?: (mode: SimulationMode) => void;
  private onSpeedChangeCallback?: (speed: SimulationSpeed) => void;

  constructor() {
    this.state = {
      mode: 'stopped',
      speed: 'normal',
      currentStep: 0,
      totalSteps: 0,
      isRunning: false,
      startTime: 0,
      elapsedTime: 0,
      stepInterval: 1000, // 1 second default
      lastUpdateTime: 0
    };

    this.history = {
      steps: [],
      maxSteps: 1000,
      currentIndex: -1
    };
  }

  /**
   * Start simulation in specified mode
   */
  startSimulation(mode: SimulationMode, speed: SimulationSpeed = 'normal'): void {
    this.state.mode = mode;
    this.state.speed = speed;
    this.state.isRunning = true;
    this.state.startTime = performance.now();
    this.state.lastUpdateTime = this.state.startTime;
    this.state.currentStep = 0;
    this.state.stepInterval = this.getStepInterval(speed);

    this.onModeChangeCallback?.(mode);
    this.onSpeedChangeCallback?.(speed);

    switch (mode) {
      case 'real-time':
        this.startRealTimeSimulation();
        break;
      case 'step-by-step':
        this.startStepByStepSimulation();
        break;
    }
  }

  /**
   * Stop simulation
   */
  stopSimulation(): void {
    this.state.isRunning = false;
    this.state.mode = 'stopped';
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.stepTimeoutId) {
      clearTimeout(this.stepTimeoutId);
      this.stepTimeoutId = null;
    }

    this.onModeChangeCallback?.('stopped');
  }

  /**
   * Pause simulation
   */
  pauseSimulation(): void {
    if (this.state.isRunning) {
      this.state.isRunning = false;
      this.state.mode = 'paused';
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      
      if (this.stepTimeoutId) {
        clearTimeout(this.stepTimeoutId);
        this.stepTimeoutId = null;
      }

      this.onModeChangeCallback?.('paused');
    }
  }

  /**
   * Resume simulation
   */
  resumeSimulation(): void {
    if (this.state.mode === 'paused') {
      this.state.isRunning = true;
      this.state.mode = this.state.mode === 'real-time' ? 'real-time' : 'step-by-step';
      this.state.lastUpdateTime = performance.now();

      if (this.state.mode === 'real-time') {
        this.startRealTimeSimulation();
      } else {
        this.startStepByStepSimulation();
      }

      this.onModeChangeCallback?.(this.state.mode);
    }
  }

  /**
   * Change simulation speed
   */
  changeSpeed(speed: SimulationSpeed): void {
    this.state.speed = speed;
    this.state.stepInterval = this.getStepInterval(speed);
    this.onSpeedChangeCallback?.(speed);
  }

  /**
   * Get step interval based on speed
   */
  private getStepInterval(speed: SimulationSpeed): number {
    switch (speed) {
      case 'slow': return 2000; // 2 seconds
      case 'normal': return 1000; // 1 second
      case 'fast': return 500; // 0.5 seconds
      case 'ultra-fast': return 100; // 0.1 seconds
      default: return 1000;
    }
  }

  /**
   * Start real-time simulation
   */
  private startRealTimeSimulation(): void {
    const animate = (timestamp: number) => {
      if (!this.state.isRunning || this.state.mode !== 'real-time') {
        return;
      }

      const deltaTime = timestamp - this.state.lastUpdateTime;
      
      if (deltaTime >= this.state.stepInterval) {
        this.executeSimulationStep(timestamp);
        this.state.lastUpdateTime = timestamp;
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Start step-by-step simulation
   */
  private startStepByStepSimulation(): void {
    const executeStep = () => {
      if (!this.state.isRunning || this.state.mode !== 'step-by-step') {
        return;
      }

      this.executeSimulationStep(performance.now());
      
      this.stepTimeoutId = setTimeout(executeStep, this.state.stepInterval);
    };

    this.stepTimeoutId = setTimeout(executeStep, this.state.stepInterval);
  }

  /**
   * Execute a simulation step
   */
  private executeSimulationStep(timestamp: number): void {
    this.state.currentStep++;
    this.state.elapsedTime = timestamp - this.state.startTime;

    // Create simulation step
    const step: SimulationStep = {
      stepNumber: this.state.currentStep,
      timestamp,
      description: this.generateStepDescription(),
      circuitData: this.getCurrentCircuitData(),
      componentStates: this.getCurrentComponentStates(),
      connectionStates: this.getCurrentConnectionStates()
    };

    // Add to history
    this.addToHistory(step);

    // Notify callback
    this.onStepCallback?.(step);
  }

  /**
   * Generate step description
   */
  private generateStepDescription(): string {
    switch (this.state.mode) {
      case 'real-time':
        return `Real-time simulation step ${this.state.currentStep}`;
      case 'step-by-step':
        return `Step-by-step simulation step ${this.state.currentStep}`;
      default:
        return `Simulation step ${this.state.currentStep}`;
    }
  }

  /**
   * Get current circuit data (placeholder - would be provided by physics engine)
   */
  private getCurrentCircuitData(): CircuitData {
    return {
      totalVoltage: 12,
      totalCurrent: 0.5,
      totalResistance: 24,
      totalPower: 6,
      isShortCircuit: false,
      fuseBlown: false
    };
  }

  /**
   * Get current component states
   */
  private getCurrentComponentStates(): Map<string, any> {
    const states = new Map<string, any>();
    // This would be populated with actual component states
    return states;
  }

  /**
   * Get current connection states
   */
  private getCurrentConnectionStates(): Map<string, any> {
    const states = new Map<string, any>();
    // This would be populated with actual connection states
    return states;
  }

  /**
   * Add step to history
   */
  private addToHistory(step: SimulationStep): void {
    this.history.steps.push(step);
    this.history.currentIndex = this.history.steps.length - 1;

    // Limit history size
    if (this.history.steps.length > this.history.maxSteps) {
      this.history.steps.shift();
      this.history.currentIndex--;
    }
  }

  /**
   * Go to previous step
   */
  goToPreviousStep(): SimulationStep | null {
    if (this.history.currentIndex > 0) {
      this.history.currentIndex--;
      return this.history.steps[this.history.currentIndex];
    }
    return null;
  }

  /**
   * Go to next step
   */
  goToNextStep(): SimulationStep | null {
    if (this.history.currentIndex < this.history.steps.length - 1) {
      this.history.currentIndex++;
      return this.history.steps[this.history.currentIndex];
    }
    return null;
  }

  /**
   * Go to specific step
   */
  goToStep(stepNumber: number): SimulationStep | null {
    const step = this.history.steps.find(s => s.stepNumber === stepNumber);
    if (step) {
      this.history.currentIndex = this.history.steps.indexOf(step);
      return step;
    }
    return null;
  }

  /**
   * Clear simulation history
   */
  clearHistory(): void {
    this.history.steps = [];
    this.history.currentIndex = -1;
  }

  /**
   * Set callbacks
   */
  setOnStepCallback(callback: (step: SimulationStep) => void): void {
    this.onStepCallback = callback;
  }

  setOnModeChangeCallback(callback: (mode: SimulationMode) => void): void {
    this.onModeChangeCallback = callback;
  }

  setOnSpeedChangeCallback(callback: (speed: SimulationSpeed) => void): void {
    this.onSpeedChangeCallback = callback;
  }

  /**
   * Get current state
   */
  getState(): SimulationState {
    return { ...this.state };
  }

  /**
   * Get simulation history
   */
  getHistory(): SimulationHistory {
    return { ...this.history };
  }

  /**
   * Get current step
   */
  getCurrentStep(): SimulationStep | null {
    if (this.history.currentIndex >= 0 && this.history.currentIndex < this.history.steps.length) {
      return this.history.steps[this.history.currentIndex];
    }
    return null;
  }

  /**
   * Get simulation statistics
   */
  getStatistics(): Record<string, any> {
    return {
      totalSteps: this.state.currentStep,
      elapsedTime: this.state.elapsedTime,
      averageStepTime: this.state.currentStep > 0 ? this.state.elapsedTime / this.state.currentStep : 0,
      historySize: this.history.steps.length,
      currentMode: this.state.mode,
      currentSpeed: this.state.speed,
      isRunning: this.state.isRunning
    };
  }
}

// Global simulation mode manager instance
export const simulationModeManager = new SimulationModeManager();
