import React from 'react';

interface CircuitDiagramProps {
  components: Array<{
    id: string;
    type: 'battery' | 'resistor' | 'bulb' | 'switch' | 'wire';
    label: string;
    value?: string;
    x: number;
    y: number;
    rotation?: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
  }>;
  width?: number;
  height?: number;
  className?: string;
}

const CircuitDiagram: React.FC<CircuitDiagramProps> = ({
  components,
  connections,
  width = 500,
  height = 300,
  className = ""
}) => {
  const getComponentSymbol = (component: CircuitDiagramProps['components'][0]) => {
    const { type, x, y, rotation = 0, label, value } = component;
    
    switch (type) {
      case 'battery':
        return (
          <g key={component.id} transform={`translate(${x}, ${y}) rotate(${rotation})`}>
            <rect x="-20" y="-8" width="40" height="16" fill="none" stroke="#ef4444" strokeWidth="2" rx="2"/>
            <line x1="-15" y1="-8" x2="-15" y2="8" stroke="#ef4444" strokeWidth="3"/>
            <line x1="15" y1="-8" x2="15" y2="8" stroke="#ef4444" strokeWidth="3"/>
            <text x="0" y="-15" textAnchor="middle" className="text-xs font-medium fill-gray-700 dark:fill-gray-300">
              {label}
            </text>
            {value && (
              <text x="0" y="25" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                {value}
              </text>
            )}
          </g>
        );
      
      case 'resistor':
        return (
          <g key={component.id} transform={`translate(${x}, ${y}) rotate(${rotation})`}>
            <rect x="-25" y="-4" width="50" height="8" fill="none" stroke="#f59e0b" strokeWidth="2" rx="2"/>
            <line x1="-30" y1="0" x2="-25" y2="0" stroke="#374151" strokeWidth="2"/>
            <line x1="25" y1="0" x2="30" y2="0" stroke="#374151" strokeWidth="2"/>
            <text x="0" y="-15" textAnchor="middle" className="text-xs font-medium fill-gray-700 dark:fill-gray-300">
              {label}
            </text>
            {value && (
              <text x="0" y="25" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                {value}
              </text>
            )}
          </g>
        );
      
      case 'bulb':
        return (
          <g key={component.id} transform={`translate(${x}, ${y}) rotate(${rotation})`}>
            <circle cx="0" cy="0" r="12" fill="none" stroke="#eab308" strokeWidth="2"/>
            <circle cx="0" cy="0" r="8" fill="#fef3c7" stroke="#eab308" strokeWidth="1"/>
            <line x1="-15" y1="0" x2="-12" y2="0" stroke="#374151" strokeWidth="2"/>
            <line x1="12" y1="0" x2="15" y2="0" stroke="#374151" strokeWidth="2"/>
            <text x="0" y="-25" textAnchor="middle" className="text-xs font-medium fill-gray-700 dark:fill-gray-300">
              {label}
            </text>
            {value && (
              <text x="0" y="25" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                {value}
              </text>
            )}
          </g>
        );
      
      case 'switch':
        return (
          <g key={component.id} transform={`translate(${x}, ${y}) rotate(${rotation})`}>
            <line x1="-15" y1="0" x2="-5" y2="0" stroke="#374151" strokeWidth="2"/>
            <line x1="5" y1="0" x2="15" y2="0" stroke="#374151" strokeWidth="2"/>
            <line x1="-5" y1="0" x2="5" y2="-8" stroke="#374151" strokeWidth="2"/>
            <text x="0" y="-20" textAnchor="middle" className="text-xs font-medium fill-gray-700 dark:fill-gray-300">
              {label}
            </text>
          </g>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`circuit-diagram-container ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          Circuit Diagram
        </h4>
        <div className="flex justify-center">
          <svg width={width} height={height} className="border border-gray-300 dark:border-gray-600 rounded-lg">
            {/* Background */}
            <rect width="100%" height="100%" fill="#f9fafb" className="dark:fill-gray-900"/>
            
            {/* Draw connections first (wires) */}
            {connections.map((connection, index) => {
              const fromComp = components.find(c => c.id === connection.from);
              const toComp = components.find(c => c.id === connection.to);
              
              if (!fromComp || !toComp) return null;
              
              return (
                <line
                  key={index}
                  x1={fromComp.x}
                  y1={fromComp.y}
                  x2={toComp.x}
                  y2={toComp.y}
                  stroke="#374151"
                  strokeWidth="2"
                />
              );
            })}
            
            {/* Draw components */}
            {components.map(getComponentSymbol)}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CircuitDiagram;
