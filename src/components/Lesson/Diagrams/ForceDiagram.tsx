import React from 'react';

interface ForceDiagramProps {
  forces: Array<{
    id: string;
    label: string;
    magnitude: string;
    direction: number; // angle in degrees
    color: string;
  }>;
  objectLabel?: string;
  width?: number;
  height?: number;
  className?: string;
}

const ForceDiagram: React.FC<ForceDiagramProps> = ({
  forces,
  objectLabel = "Object",
  width = 400,
  height = 300,
  className = ""
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const arrowLength = 80;

  const drawArrow = (x1: number, y1: number, x2: number, y2: number, color: string) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowHeadLength = 15;
    const arrowHeadAngle = Math.PI / 6;

    return (
      <g>
        {/* Arrow line */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth="3"
        />
        {/* Arrow head */}
        <path
          d={`M ${x2} ${y2} L ${x2 - arrowHeadLength * Math.cos(angle - arrowHeadAngle)} ${y2 - arrowHeadLength * Math.sin(angle - arrowHeadAngle)} M ${x2} ${y2} L ${x2 - arrowHeadLength * Math.cos(angle + arrowHeadAngle)} ${y2 - arrowHeadLength * Math.sin(angle + arrowHeadAngle)}`}
          stroke={color}
          strokeWidth="3"
          fill="none"
        />
      </g>
    );
  };

  return (
    <div className={`force-diagram-container ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          Force Diagram
        </h4>
        <div className="flex justify-center">
          <svg width={width} height={height} className="border border-gray-300 dark:border-gray-600 rounded-lg">
            
            {/* Grid lines for reference */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Object at center */}
            <circle
              cx={centerX}
              cy={centerY}
              r="20"
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="2"
            />
            <text
              x={centerX}
              y={centerY + 5}
              textAnchor="middle"
              className="text-xs font-medium fill-white"
            >
              {objectLabel}
            </text>
            
            {/* Force arrows */}
            {forces.map((force) => {
              const endX = centerX + arrowLength * Math.cos((force.direction * Math.PI) / 180);
              const endY = centerY + arrowLength * Math.sin((force.direction * Math.PI) / 180);
              
              return (
                <g key={force.id}>
                  {drawArrow(centerX, centerY, endX, endY, force.color)}
                  
                  {/* Force label */}
                  <text
                    x={endX + 10}
                    y={endY - 10}
                    className="text-sm font-medium fill-gray-700 dark:fill-gray-300"
                  >
                    {force.label}
                  </text>
                  
                  {/* Force magnitude */}
                  <text
                    x={endX + 10}
                    y={endY + 5}
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {force.magnitude}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ForceDiagram;
