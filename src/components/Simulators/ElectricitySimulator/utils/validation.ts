import { Component, Connection } from '../types/circuit';

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Component property validation rules
const COMPONENT_VALIDATION_RULES = {
  battery: {
    voltage: { min: 0.1, max: 1000, required: true },
    resistance: { min: 0.001, max: 100, required: false }
  },
  bulb: {
    resistance: { min: 0.1, max: 10000, required: true },
    power: { min: 0, max: 1000, required: false },
    brightness: { min: 0, max: 1, required: false }
  },
  resistor: {
    resistance: { min: 0.001, max: 1000000, required: true }
  },
  capacitor: {
    capacitance: { min: 0.001, max: 10000, required: true },
    charge: { min: 0, max: 1000, required: false },
    energy: { min: 0, max: 1000, required: false }
  },
  switch: {
    isOn: { type: 'boolean', required: true },
    resistance: { min: 0.001, max: 100, required: false }
  },
  fuse: {
    maxCurrent: { min: 0.1, max: 100, required: true },
    isBlown: { type: 'boolean', required: false },
    resistance: { min: 0.001, max: 100, required: false }
  },
  ammeter: {
    reading: { min: 0, max: 1000, required: false },
    resistance: { min: 0.001, max: 100, required: false }
  },
  voltmeter: {
    reading: { min: 0, max: 10000, required: false },
    resistance: { min: 1000, max: 10000000, required: false }
  }
};

// Position validation
export const validatePosition = (position: { x: number; y: number }): ValidationResult => {
  const errors: ValidationError[] = [];

  if (typeof position.x !== 'number' || isNaN(position.x)) {
    errors.push({ field: 'x', message: 'X coordinate must be a valid number', value: position.x });
  } else if (position.x < 0 || position.x > 2000) {
    errors.push({ field: 'x', message: 'X coordinate must be between 0 and 2000', value: position.x });
  }

  if (typeof position.y !== 'number' || isNaN(position.y)) {
    errors.push({ field: 'y', message: 'Y coordinate must be a valid number', value: position.y });
  } else if (position.y < 0 || position.y > 2000) {
    errors.push({ field: 'y', message: 'Y coordinate must be between 0 and 2000', value: position.y });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Component validation
export const validateComponent = (component: Component): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate basic properties
  if (!component.id || typeof component.id !== 'string') {
    errors.push({ field: 'id', message: 'Component ID is required and must be a string' });
  }

  if (!component.type || typeof component.type !== 'string') {
    errors.push({ field: 'type', message: 'Component type is required and must be a string' });
  }

  // Validate position
  const positionValidation = validatePosition(component.position);
  if (!positionValidation.isValid) {
    errors.push(...positionValidation.errors.map(e => ({ ...e, field: `position.${e.field}` })));
  }

  // Validate terminals
  if (!Array.isArray(component.terminals)) {
    errors.push({ field: 'terminals', message: 'Terminals must be an array' });
  } else if (component.terminals.length < 2) {
    errors.push({ field: 'terminals', message: 'Component must have at least 2 terminals' });
  } else {
    component.terminals.forEach((terminal, index) => {
      const terminalValidation = validatePosition(terminal);
      if (!terminalValidation.isValid) {
        errors.push(...terminalValidation.errors.map(e => ({ 
          ...e, 
          field: `terminals[${index}].${e.field}` 
        })));
      }
    });
  }

  // Validate component-specific properties
  if (component.type in COMPONENT_VALIDATION_RULES) {
    const rules = COMPONENT_VALIDATION_RULES[component.type as keyof typeof COMPONENT_VALIDATION_RULES];
    
    Object.entries(rules).forEach(([property, rule]) => {
      const value = component.properties[property as keyof typeof component.properties];
      
      if (rule.required && (value === undefined || value === null)) {
        errors.push({ 
          field: `properties.${property}`, 
          message: `${property} is required for ${component.type}` 
        });
        return;
      }

      if (value !== undefined && value !== null) {
        if (rule.type === 'boolean') {
          if (typeof value !== 'boolean') {
            errors.push({ 
              field: `properties.${property}`, 
              message: `${property} must be a boolean`, 
              value 
            });
          }
        } else if (typeof rule.min === 'number' && typeof rule.max === 'number') {
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push({ 
              field: `properties.${property}`, 
              message: `${property} must be a valid number`, 
              value 
            });
          } else if (value < rule.min || value > rule.max) {
            errors.push({ 
              field: `properties.${property}`, 
              message: `${property} must be between ${rule.min} and ${rule.max}`, 
              value 
            });
          }
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Connection validation
export const validateConnection = (connection: Connection, components: Component[]): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!connection.id || typeof connection.id !== 'string') {
    errors.push({ field: 'id', message: 'Connection ID is required and must be a string' });
  }

  if (!connection.fromComponentId || typeof connection.fromComponentId !== 'string') {
    errors.push({ field: 'fromComponentId', message: 'From component ID is required' });
  }

  if (!connection.toComponentId || typeof connection.toComponentId !== 'string') {
    errors.push({ field: 'toComponentId', message: 'To component ID is required' });
  }

  if (connection.fromComponentId === connection.toComponentId) {
    errors.push({ 
      field: 'toComponentId', 
      message: 'Cannot connect component to itself' 
    });
  }

  // Validate component existence
  const fromComponent = components.find(c => c.id === connection.fromComponentId);
  const toComponent = components.find(c => c.id === connection.toComponentId);

  if (!fromComponent) {
    errors.push({ 
      field: 'fromComponentId', 
      message: `Component with ID ${connection.fromComponentId} not found` 
    });
  }

  if (!toComponent) {
    errors.push({ 
      field: 'toComponentId', 
      message: `Component with ID ${connection.toComponentId} not found` 
    });
  }

  // Validate terminal indices
  if (fromComponent) {
    if (typeof connection.fromTerminal !== 'number' || 
        connection.fromTerminal < 0 || 
        connection.fromTerminal >= fromComponent.terminals.length) {
      errors.push({ 
        field: 'fromTerminal', 
        message: `Invalid terminal index ${connection.fromTerminal} for component ${connection.fromComponentId}` 
      });
    }
  }

  if (toComponent) {
    if (typeof connection.toTerminal !== 'number' || 
        connection.toTerminal < 0 || 
        connection.toTerminal >= toComponent.terminals.length) {
      errors.push({ 
        field: 'toTerminal', 
        message: `Invalid terminal index ${connection.toTerminal} for component ${connection.toComponentId}` 
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Circuit validation
export const validateCircuit = (components: Component[], connections: Connection[]): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate all components
  components.forEach((component, index) => {
    const componentValidation = validateComponent(component);
    if (!componentValidation.isValid) {
      errors.push(...componentValidation.errors.map(e => ({ 
        ...e, 
        field: `components[${index}].${e.field}` 
      })));
    }
  });

  // Validate all connections
  connections.forEach((connection, index) => {
    const connectionValidation = validateConnection(connection, components);
    if (!connectionValidation.isValid) {
      errors.push(...connectionValidation.errors.map(e => ({ 
        ...e, 
        field: `connections[${index}].${e.field}` 
      })));
    }
  });

  // Check for duplicate component IDs
  const componentIds = components.map(c => c.id);
  const duplicateComponentIds = componentIds.filter((id, index) => componentIds.indexOf(id) !== index);
  if (duplicateComponentIds.length > 0) {
    errors.push({ 
      field: 'components', 
      message: `Duplicate component IDs found: ${duplicateComponentIds.join(', ')}` 
    });
  }

  // Check for duplicate connection IDs
  const connectionIds = connections.map(c => c.id);
  const duplicateConnectionIds = connectionIds.filter((id, index) => connectionIds.indexOf(id) !== index);
  if (duplicateConnectionIds.length > 0) {
    errors.push({ 
      field: 'connections', 
      message: `Duplicate connection IDs found: ${duplicateConnectionIds.join(', ')}` 
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Voltage validation
export const validateVoltage = (voltage: number): ValidationResult => {
  const errors: ValidationError[] = [];

  if (typeof voltage !== 'number' || isNaN(voltage)) {
    errors.push({ field: 'voltage', message: 'Voltage must be a valid number', value: voltage });
  } else if (voltage < 0 || voltage > 1000) {
    errors.push({ field: 'voltage', message: 'Voltage must be between 0 and 1000 volts', value: voltage });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
