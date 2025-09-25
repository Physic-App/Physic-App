import { Component, Connection, CircuitData } from '../types/circuit';

export interface AssessmentCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  type: 'circuit_structure' | 'measurement' | 'calculation' | 'troubleshooting' | 'design';
}

export interface AssessmentResult {
  criteriaId: string;
  score: number;
  maxScore: number;
  feedback: string;
  isCorrect: boolean;
  details: Record<string, any>;
}

export interface AssessmentReport {
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  grade: string;
  results: AssessmentResult[];
  feedback: string;
  suggestions: string[];
  timeSpent: number;
  completedAt: Date;
}

export interface CircuitDesignChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  constraints: string[];
  expectedCircuit: {
    components: Component[];
    connections: Connection[];
  };
  expectedMeasurements: {
    totalVoltage: number;
    totalCurrent: number;
    totalResistance: number;
    totalPower: number;
  };
  criteria: AssessmentCriteria[];
  timeLimit?: number;
  hints: string[];
}

export class AssessmentSystem {
  private criteria: AssessmentCriteria[] = [
    {
      id: 'circuit_structure',
      name: 'Circuit Structure',
      description: 'Correct placement and connection of components',
      weight: 0.3,
      maxScore: 100,
      type: 'circuit_structure'
    },
    {
      id: 'measurement_accuracy',
      name: 'Measurement Accuracy',
      description: 'Accuracy of voltage and current measurements',
      weight: 0.25,
      maxScore: 100,
      type: 'measurement'
    },
    {
      id: 'calculation_correctness',
      name: 'Calculation Correctness',
      description: 'Correct application of electrical laws and formulas',
      weight: 0.25,
      maxScore: 100,
      type: 'calculation'
    },
    {
      id: 'troubleshooting_skills',
      name: 'Troubleshooting Skills',
      description: 'Ability to identify and fix circuit problems',
      weight: 0.1,
      maxScore: 100,
      type: 'troubleshooting'
    },
    {
      id: 'design_efficiency',
      name: 'Design Efficiency',
      description: 'Efficiency and elegance of circuit design',
      weight: 0.1,
      maxScore: 100,
      type: 'design'
    }
  ];

  /**
   * Assess a circuit design challenge
   */
  assessCircuitDesign(
    challenge: CircuitDesignChallenge,
    studentCircuit: {
      components: Component[];
      connections: Connection[];
    },
    measurements: CircuitData,
    timeSpent: number
  ): AssessmentReport {
    const results: AssessmentResult[] = [];

    // Assess circuit structure
    const structureResult = this.assessCircuitStructure(
      challenge.expectedCircuit,
      studentCircuit
    );
    results.push(structureResult);

    // Assess measurement accuracy
    const measurementResult = this.assessMeasurementAccuracy(
      challenge.expectedMeasurements,
      measurements
    );
    results.push(measurementResult);

    // Assess calculation correctness
    const calculationResult = this.assessCalculationCorrectness(
      challenge.expectedMeasurements,
      measurements,
      studentCircuit
    );
    results.push(calculationResult);

    // Assess troubleshooting skills
    const troubleshootingResult = this.assessTroubleshootingSkills(
      challenge,
      studentCircuit,
      measurements
    );
    results.push(troubleshootingResult);

    // Assess design efficiency
    const designResult = this.assessDesignEfficiency(
      challenge,
      studentCircuit
    );
    results.push(designResult);

    // Calculate total score
    const totalScore = results.reduce((sum, result) => {
      const criteria = this.criteria.find(c => c.id === result.criteriaId);
      return sum + (result.score * (criteria?.weight || 0));
    }, 0);

    const maxTotalScore = this.criteria.reduce((sum, criteria) => {
      return sum + (criteria.maxScore * criteria.weight);
    }, 0);

    const percentage = (totalScore / maxTotalScore) * 100;
    const grade = this.calculateGrade(percentage);

    // Generate feedback and suggestions
    const feedback = this.generateFeedback(results, challenge);
    const suggestions = this.generateSuggestions(results, challenge);

    return {
      totalScore,
      maxTotalScore,
      percentage,
      grade,
      results,
      feedback,
      suggestions,
      timeSpent,
      completedAt: new Date()
    };
  }

  /**
   * Assess circuit structure
   */
  private assessCircuitStructure(
    expected: { components: Component[]; connections: Connection[] },
    actual: { components: Component[]; connections: Connection[] }
  ): AssessmentResult {
    let score = 0;
    const details: Record<string, any> = {};
    const feedback: string[] = [];

    // Check component count
    const expectedComponentCount = expected.components.length;
    const actualComponentCount = actual.components.length;
    const componentCountScore = Math.max(0, 100 - Math.abs(expectedComponentCount - actualComponentCount) * 10);
    score += componentCountScore * 0.3;
    details.componentCount = { expected: expectedComponentCount, actual: actualComponentCount, score: componentCountScore };

    if (expectedComponentCount !== actualComponentCount) {
      feedback.push(`Expected ${expectedComponentCount} components, found ${actualComponentCount}`);
    }

    // Check component types
    const expectedTypes = expected.components.map(c => c.type).sort();
    const actualTypes = actual.components.map(c => c.type).sort();
    const typeMatchScore = this.calculateArraySimilarity(expectedTypes, actualTypes) * 100;
    score += typeMatchScore * 0.4;
    details.componentTypes = { expected: expectedTypes, actual: actualTypes, score: typeMatchScore };

    if (typeMatchScore < 1) {
      feedback.push('Component types do not match expected circuit');
    }

    // Check connection count
    const expectedConnectionCount = expected.connections.length;
    const actualConnectionCount = actual.connections.length;
    const connectionCountScore = Math.max(0, 100 - Math.abs(expectedConnectionCount - actualConnectionCount) * 15);
    score += connectionCountScore * 0.3;
    details.connectionCount = { expected: expectedConnectionCount, actual: actualConnectionCount, score: connectionCountScore };

    if (expectedConnectionCount !== actualConnectionCount) {
      feedback.push(`Expected ${expectedConnectionCount} connections, found ${actualConnectionCount}`);
    }

    return {
      criteriaId: 'circuit_structure',
      score: Math.round(score),
      maxScore: 100,
      feedback: feedback.join('; '),
      isCorrect: score >= 80,
      details
    };
  }

  /**
   * Assess measurement accuracy
   */
  private assessMeasurementAccuracy(
    expected: CircuitData,
    actual: CircuitData
  ): AssessmentResult {
    let score = 0;
    const details: Record<string, any> = {};
    const feedback: string[] = [];

    // Check voltage accuracy
    const voltageError = Math.abs(expected.totalVoltage - actual.totalVoltage);
    const voltageAccuracy = Math.max(0, 100 - (voltageError / expected.totalVoltage) * 100);
    score += voltageAccuracy * 0.3;
    details.voltage = { expected: expected.totalVoltage, actual: actual.totalVoltage, accuracy: voltageAccuracy };

    if (voltageError > expected.totalVoltage * 0.1) {
      feedback.push(`Voltage measurement is inaccurate (expected: ${expected.totalVoltage}V, actual: ${actual.totalVoltage}V)`);
    }

    // Check current accuracy
    const currentError = Math.abs(expected.totalCurrent - actual.totalCurrent);
    const currentAccuracy = Math.max(0, 100 - (currentError / expected.totalCurrent) * 100);
    score += currentAccuracy * 0.3;
    details.current = { expected: expected.totalCurrent, actual: actual.totalCurrent, accuracy: currentAccuracy };

    if (currentError > expected.totalCurrent * 0.1) {
      feedback.push(`Current measurement is inaccurate (expected: ${expected.totalCurrent}A, actual: ${actual.totalCurrent}A)`);
    }

    // Check resistance accuracy
    const resistanceError = Math.abs(expected.totalResistance - actual.totalResistance);
    const resistanceAccuracy = Math.max(0, 100 - (resistanceError / expected.totalResistance) * 100);
    score += resistanceAccuracy * 0.2;
    details.resistance = { expected: expected.totalResistance, actual: actual.totalResistance, accuracy: resistanceAccuracy };

    if (resistanceError > expected.totalResistance * 0.1) {
      feedback.push(`Resistance calculation is inaccurate (expected: ${expected.totalResistance}Ω, actual: ${actual.totalResistance}Ω)`);
    }

    // Check power accuracy
    const powerError = Math.abs(expected.totalPower - actual.totalPower);
    const powerAccuracy = Math.max(0, 100 - (powerError / expected.totalPower) * 100);
    score += powerAccuracy * 0.2;
    details.power = { expected: expected.totalPower, actual: actual.totalPower, accuracy: powerAccuracy };

    if (powerError > expected.totalPower * 0.1) {
      feedback.push(`Power calculation is inaccurate (expected: ${expected.totalPower}W, actual: ${actual.totalPower}W)`);
    }

    return {
      criteriaId: 'measurement_accuracy',
      score: Math.round(score),
      maxScore: 100,
      feedback: feedback.join('; '),
      isCorrect: score >= 80,
      details
    };
  }

  /**
   * Assess calculation correctness
   */
  private assessCalculationCorrectness(
    expected: CircuitData,
    actual: CircuitData,
    circuit: { components: Component[]; connections: Connection[] }
  ): AssessmentResult {
    let score = 0;
    const details: Record<string, any> = {};
    const feedback: string[] = [];

    // Check Ohm's Law application
    const expectedOhmsLaw = expected.totalVoltage / expected.totalCurrent;
    const actualOhmsLaw = actual.totalVoltage / actual.totalCurrent;
    const ohmsLawError = Math.abs(expectedOhmsLaw - actualOhmsLaw);
    const ohmsLawAccuracy = Math.max(0, 100 - (ohmsLawError / expectedOhmsLaw) * 100);
    score += ohmsLawAccuracy * 0.4;
    details.ohmsLaw = { expected: expectedOhmsLaw, actual: actualOhmsLaw, accuracy: ohmsLawAccuracy };

    if (ohmsLawError > expectedOhmsLaw * 0.1) {
      feedback.push('Ohm\'s Law calculation is incorrect');
    }

    // Check power calculation
    const expectedPower = expected.totalVoltage * expected.totalCurrent;
    const actualPower = actual.totalVoltage * actual.totalCurrent;
    const powerError = Math.abs(expectedPower - actualPower);
    const powerAccuracy = Math.max(0, 100 - (powerError / expectedPower) * 100);
    score += powerAccuracy * 0.3;
    details.powerCalculation = { expected: expectedPower, actual: actualPower, accuracy: powerAccuracy };

    if (powerError > expectedPower * 0.1) {
      feedback.push('Power calculation is incorrect');
    }

    // Check series/parallel resistance calculation
    const resistanceCalculation = this.assessResistanceCalculation(circuit, expected.totalResistance);
    score += resistanceCalculation * 0.3;
    details.resistanceCalculation = { score: resistanceCalculation };

    if (resistanceCalculation < 80) {
      feedback.push('Resistance calculation method is incorrect');
    }

    return {
      criteriaId: 'calculation_correctness',
      score: Math.round(score),
      maxScore: 100,
      feedback: feedback.join('; '),
      isCorrect: score >= 80,
      details
    };
  }

  /**
   * Assess troubleshooting skills
   */
  private assessTroubleshootingSkills(
    challenge: CircuitDesignChallenge,
    circuit: { components: Component[]; connections: Connection[] },
    measurements: CircuitData
  ): AssessmentResult {
    let score = 100;
    const details: Record<string, any> = {};
    const feedback: string[] = [];

    // Check for short circuits
    if (measurements.isShortCircuit) {
      score -= 30;
      feedback.push('Circuit has a short circuit');
    }

    // Check for blown fuses
    if (measurements.fuseBlown) {
      score -= 20;
      feedback.push('Fuse is blown');
    }

    // Check for open circuits
    if (measurements.totalCurrent === 0 && measurements.totalVoltage > 0) {
      score -= 25;
      feedback.push('Circuit appears to be open');
    }

    // Check for proper component values
    const componentValues = this.checkComponentValues(circuit.components);
    if (componentValues < 100) {
      score -= (100 - componentValues) * 0.25;
      feedback.push('Some component values are unrealistic');
    }

    details.troubleshooting = { score, issues: feedback.length };

    return {
      criteriaId: 'troubleshooting_skills',
      score: Math.max(0, Math.round(score)),
      maxScore: 100,
      feedback: feedback.join('; '),
      isCorrect: score >= 80,
      details
    };
  }

  /**
   * Assess design efficiency
   */
  private assessDesignEfficiency(
    challenge: CircuitDesignChallenge,
    circuit: { components: Component[]; connections: Connection[] }
  ): AssessmentResult {
    let score = 100;
    const details: Record<string, any> = {};
    const feedback: string[] = [];

    // Check for unnecessary components
    const unnecessaryComponents = this.findUnnecessaryComponents(circuit);
    if (unnecessaryComponents.length > 0) {
      score -= unnecessaryComponents.length * 10;
      feedback.push(`Unnecessary components: ${unnecessaryComponents.join(', ')}`);
    }

    // Check for inefficient connections
    const inefficientConnections = this.findInefficientConnections(circuit);
    if (inefficientConnections.length > 0) {
      score -= inefficientConnections.length * 5;
      feedback.push(`Inefficient connections detected`);
    }

    // Check for proper component placement
    const placementScore = this.assessComponentPlacement(circuit);
    score = (score + placementScore) / 2;

    details.efficiency = { score, unnecessaryComponents, inefficientConnections };

    return {
      criteriaId: 'design_efficiency',
      score: Math.max(0, Math.round(score)),
      maxScore: 100,
      feedback: feedback.join('; '),
      isCorrect: score >= 80,
      details
    };
  }

  /**
   * Calculate array similarity
   */
  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  /**
   * Calculate grade based on percentage
   */
  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate feedback
   */
  private generateFeedback(results: AssessmentResult[], challenge: CircuitDesignChallenge): string {
    const positiveResults = results.filter(r => r.isCorrect);
    const negativeResults = results.filter(r => !r.isCorrect);

    if (positiveResults.length === results.length) {
      return 'Excellent work! You have successfully completed the challenge with high accuracy.';
    }

    if (negativeResults.length === 1) {
      return `Good effort! You did well in most areas but need to improve in ${negativeResults[0].criteriaId}.`;
    }

    return `You have completed the challenge but need to improve in several areas: ${negativeResults.map(r => r.criteriaId).join(', ')}.`;
  }

  /**
   * Generate suggestions
   */
  private generateSuggestions(results: AssessmentResult[], challenge: CircuitDesignChallenge): string[] {
    const suggestions: string[] = [];

    results.forEach(result => {
      if (!result.isCorrect) {
        switch (result.criteriaId) {
          case 'circuit_structure':
            suggestions.push('Review the circuit structure requirements and ensure all components are properly connected.');
            break;
          case 'measurement_accuracy':
            suggestions.push('Double-check your measurements and ensure instruments are properly calibrated.');
            break;
          case 'calculation_correctness':
            suggestions.push('Review electrical formulas and calculation methods, especially Ohm\'s Law and power calculations.');
            break;
          case 'troubleshooting_skills':
            suggestions.push('Practice identifying common circuit problems like short circuits and open circuits.');
            break;
          case 'design_efficiency':
            suggestions.push('Consider removing unnecessary components and optimizing your circuit design.');
            break;
        }
      }
    });

    return suggestions;
  }

  /**
   * Assess resistance calculation
   */
  private assessResistanceCalculation(circuit: { components: Component[]; connections: Connection[] }, expectedResistance: number): number {
    // This is a simplified assessment - in a real implementation, you would
    // analyze the circuit topology and calculate the equivalent resistance
    const totalResistance = circuit.components
      .filter(c => c.type === 'resistor')
      .reduce((sum, c) => sum + (c.properties.resistance || 0), 0);

    const error = Math.abs(totalResistance - expectedResistance);
    return Math.max(0, 100 - (error / expectedResistance) * 100);
  }

  /**
   * Check component values
   */
  private checkComponentValues(components: Component[]): number {
    let validComponents = 0;
    
    components.forEach(component => {
      switch (component.type) {
        case 'resistor':
          if (component.properties.resistance && component.properties.resistance > 0) {
            validComponents++;
          }
          break;
        case 'battery':
          if (component.properties.voltage && component.properties.voltage > 0) {
            validComponents++;
          }
          break;
        case 'bulb':
          if (component.properties.resistance && component.properties.resistance > 0) {
            validComponents++;
          }
          break;
        default:
          validComponents++;
      }
    });

    return (validComponents / components.length) * 100;
  }

  /**
   * Find unnecessary components
   */
  private findUnnecessaryComponents(circuit: { components: Component[]; connections: Connection[] }): string[] {
    const unnecessary: string[] = [];
    
    // Check for components with no connections
    circuit.components.forEach(component => {
      const hasConnections = circuit.connections.some(conn => 
        conn.fromComponentId === component.id || conn.toComponentId === component.id
      );
      
      if (!hasConnections) {
        unnecessary.push(component.id);
      }
    });

    return unnecessary;
  }

  /**
   * Find inefficient connections
   */
  private findInefficientConnections(circuit: { components: Component[]; connections: Connection[] }): string[] {
    const inefficient: string[] = [];
    
    // Check for duplicate connections
    const connectionPairs = new Set<string>();
    
    circuit.connections.forEach(connection => {
      const pair = [connection.fromComponentId, connection.toComponentId].sort().join('-');
      if (connectionPairs.has(pair)) {
        inefficient.push(connection.id);
      } else {
        connectionPairs.add(pair);
      }
    });

    return inefficient;
  }

  /**
   * Assess component placement
   */
  private assessComponentPlacement(circuit: { components: Component[]; connections: Connection[] }): number {
    // This is a simplified assessment - in a real implementation, you would
    // analyze the spatial arrangement and connection lengths
    return 85; // Placeholder score
  }

  /**
   * Get assessment criteria
   */
  getCriteria(): AssessmentCriteria[] {
    return [...this.criteria];
  }

  /**
   * Create a new assessment criteria
   */
  addCriteria(criteria: AssessmentCriteria): void {
    this.criteria.push(criteria);
  }

  /**
   * Remove assessment criteria
   */
  removeCriteria(criteriaId: string): void {
    this.criteria = this.criteria.filter(c => c.id !== criteriaId);
  }
}

// Global assessment system instance
export const assessmentSystem = new AssessmentSystem();
