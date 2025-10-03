export class ErrorHandler {
  static handlePhysicsError(error: Error, context: string): void {
    console.error(`Physics Error in ${context}:`, error);
    
    // Log to user-visible error system if needed
    this.logUserError(`Physics calculation error: ${error.message}`);
  }

  static validatePhysicsInputs(inputs: {
    mass?: number;
    force?: number;
    velocity?: { x: number; y: number };
    position?: { x: number; y: number };
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (inputs.mass !== undefined) {
      if (inputs.mass <= 0) {
        errors.push('Mass must be positive');
      }
      if (inputs.mass > 1000) {
        errors.push('Mass too large (max 1000 kg)');
      }
      if (!isFinite(inputs.mass)) {
        errors.push('Mass must be a finite number');
      }
    }

    if (inputs.force !== undefined) {
      if (!isFinite(inputs.force)) {
        errors.push('Force must be a finite number');
      }
      if (Math.abs(inputs.force) > 10000) {
        errors.push('Force too large (max 10000 N)');
      }
    }

    if (inputs.velocity) {
      if (!isFinite(inputs.velocity.x) || !isFinite(inputs.velocity.y)) {
        errors.push('Velocity components must be finite numbers');
      }
      const speed = Math.sqrt(inputs.velocity.x ** 2 + inputs.velocity.y ** 2);
      if (speed > 1000) {
        errors.push('Velocity too high (max 1000 m/s)');
      }
    }

    if (inputs.position) {
      if (!isFinite(inputs.position.x) || !isFinite(inputs.position.y)) {
        errors.push('Position components must be finite numbers');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizePhysicsValue(value: number, min: number = -Infinity, max: number = Infinity): number {
    if (!isFinite(value)) {
      return 0;
    }
    return Math.max(min, Math.min(max, value));
  }

  static logUserError(message: string): void {
    // In a real app, this would show a user-friendly error message
    console.warn('User Error:', message);
  }

  static handleCanvasError(error: Error, canvasContext: string): void {
    console.error(`Canvas Error in ${canvasContext}:`, error);
    this.logUserError(`Display error: ${error.message}`);
  }

  static validateSimulationState(state: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!state.object) {
      errors.push('Simulation object is missing');
      return { isValid: false, errors };
    }

    const objectValidation = this.validatePhysicsInputs({
      mass: state.object.mass,
      velocity: state.object.velocity,
      position: state.object.position
    });

    errors.push(...objectValidation.errors);

    if (state.appliedForce !== undefined) {
      const forceValidation = this.validatePhysicsInputs({
        force: state.appliedForce
      });
      errors.push(...forceValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
