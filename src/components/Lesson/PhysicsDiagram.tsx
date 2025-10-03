import React from 'react';
import { TemplateDiagram } from './Diagrams/DiagramTemplates';

interface PhysicsDiagramProps {
  type: 'freeBodyDiagram' | 'inclinedPlane' | 'simpleCircuit' | 'parallelCircuit' | 'transverseWave' | 'longitudinalWave' | 'standingWave';
  title?: string;
  description?: string;
  className?: string;
  showTitle?: boolean;
}

const PhysicsDiagram: React.FC<PhysicsDiagramProps> = ({
  type,
  title,
  description,
  className = '',
  showTitle = true
}) => {
  const getDiagramTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'freeBodyDiagram':
        return 'Free Body Diagram';
      case 'inclinedPlane':
        return 'Forces on Inclined Plane';
      case 'simpleCircuit':
        return 'Simple Electric Circuit';
      case 'parallelCircuit':
        return 'Parallel Circuit';
      case 'transverseWave':
        return 'Transverse Wave';
      case 'longitudinalWave':
        return 'Longitudinal Wave';
      case 'standingWave':
        return 'Standing Wave';
      default:
        return 'Physics Diagram';
    }
  };

  const getDiagramDescription = () => {
    if (description) return description;
    
    switch (type) {
      case 'freeBodyDiagram':
        return 'Shows all forces acting on an object in a free body diagram';
      case 'inclinedPlane':
        return 'Demonstrates forces acting on an object on an inclined plane';
      case 'simpleCircuit':
        return 'Basic electric circuit with battery, resistor, and bulb';
      case 'parallelCircuit':
        return 'Parallel circuit configuration with multiple resistors';
      case 'transverseWave':
        return 'Wave where particles move perpendicular to wave direction';
      case 'longitudinalWave':
        return 'Wave where particles move parallel to wave direction';
      case 'standingWave':
        return 'Interference pattern created by two waves of same frequency';
      default:
        return '';
    }
  };

  return (
    <div className={`physics-diagram ${className}`}>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700 shadow-lg">
        {showTitle && (
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {getDiagramTitle()}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getDiagramDescription()}
            </p>
          </div>
        )}
        
        <div className="flex justify-center">
          <TemplateDiagram template={type} />
        </div>
        
        {showTitle && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Interactive Physics Diagram</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysicsDiagram;
