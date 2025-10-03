import React from 'react';
import { ForceDiagram, CircuitDiagram, WaveDiagram } from './index';

// Predefined diagram templates for common physics concepts
export const DiagramTemplates = {
  // Force diagrams
  freeBodyDiagram: {
    forces: [
      {
        id: 'weight',
        label: 'Weight (mg)',
        magnitude: 'mg',
        direction: 90, // downward
        color: '#ef4444'
      },
      {
        id: 'normal',
        label: 'Normal Force (N)',
        magnitude: 'N',
        direction: 270, // upward
        color: '#3b82f6'
      }
    ],
    objectLabel: 'Block'
  },

  inclinedPlane: {
    forces: [
      {
        id: 'weight',
        label: 'Weight (mg)',
        magnitude: 'mg',
        direction: 90,
        color: '#ef4444'
      },
      {
        id: 'normal',
        label: 'Normal (N)',
        magnitude: 'N',
        direction: 0, // perpendicular to surface
        color: '#3b82f6'
      },
      {
        id: 'friction',
        label: 'Friction (f)',
        magnitude: 'f',
        direction: 180, // opposite to motion
        color: '#f59e0b'
      }
    ],
    objectLabel: 'Block'
  },

  // Circuit diagrams
  simpleCircuit: {
    components: [
      {
        id: 'battery1',
        type: 'battery',
        label: 'Battery',
        value: '9V',
        x: 100,
        y: 150
      },
      {
        id: 'resistor1',
        type: 'resistor',
        label: 'R₁',
        value: '10Ω',
        x: 300,
        y: 150
      },
      {
        id: 'bulb1',
        type: 'bulb',
        label: 'Bulb',
        x: 500,
        y: 150
      }
    ],
    connections: [
      { from: 'battery1', to: 'resistor1' },
      { from: 'resistor1', to: 'bulb1' },
      { from: 'bulb1', to: 'battery1' }
    ]
  },

  parallelCircuit: {
    components: [
      {
        id: 'battery1',
        type: 'battery',
        label: 'Battery',
        value: '12V',
        x: 100,
        y: 150
      },
      {
        id: 'resistor1',
        type: 'resistor',
        label: 'R₁',
        value: '20Ω',
        x: 300,
        y: 100
      },
      {
        id: 'resistor2',
        type: 'resistor',
        label: 'R₂',
        value: '30Ω',
        x: 300,
        y: 200
      },
      {
        id: 'switch1',
        type: 'switch',
        label: 'Switch',
        x: 200,
        y: 150
      }
    ],
    connections: [
      { from: 'battery1', to: 'switch1' },
      { from: 'switch1', to: 'resistor1' },
      { from: 'switch1', to: 'resistor2' },
      { from: 'resistor1', to: 'battery1' },
      { from: 'resistor2', to: 'battery1' }
    ]
  },

  // Wave diagrams
  transverseWave: {
    type: 'transverse',
    amplitude: 40,
    wavelength: 200,
    frequency: 1
  },

  longitudinalWave: {
    type: 'longitudinal',
    amplitude: 30,
    wavelength: 150,
    frequency: 1.5
  },

  standingWave: {
    type: 'standing',
    amplitude: 50,
    wavelength: 180,
    frequency: 2
  }
};

// Component to render template diagrams
export const TemplateDiagram: React.FC<{
  template: keyof typeof DiagramTemplates;
  className?: string;
}> = ({ template, className = '' }) => {
  const templateData = DiagramTemplates[template];
  
  if (!templateData) {
    return <div className="text-red-500">Template not found: {template}</div>;
  }

  // Determine diagram type and render accordingly
  if ('forces' in templateData) {
    return <ForceDiagram {...templateData} className={className} />;
  } else if ('components' in templateData) {
    return <CircuitDiagram {...templateData} className={className} />;
  } else if ('type' in templateData) {
    return <WaveDiagram {...templateData} className={className} />;
  }

  return null;
};

export default TemplateDiagram;
