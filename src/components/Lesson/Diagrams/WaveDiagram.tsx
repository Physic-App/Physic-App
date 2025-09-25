import React from 'react';

interface WaveDiagramProps {
  type: 'transverse' | 'longitudinal' | 'standing';
  amplitude?: number;
  wavelength?: number;
  frequency?: number;
  phase?: number;
  width?: number;
  height?: number;
  className?: string;
}

const WaveDiagram: React.FC<WaveDiagramProps> = ({
  type = 'transverse',
  amplitude = 50,
  wavelength = 200,
  frequency = 1,
  phase = 0,
  width = 600,
  height = 200,
  className = ""
}) => {
  const centerY = height / 2;
  const points: string[] = [];
  
  // Generate wave points
  for (let x = 0; x <= width; x += 2) {
    let y = centerY;
    
    if (type === 'transverse') {
      y = centerY + amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase);
    } else if (type === 'longitudinal') {
      // For longitudinal waves, we'll show compression and rarefaction
      const compression = amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase);
      y = centerY + compression;
    } else if (type === 'standing') {
      y = centerY + amplitude * Math.sin((2 * Math.PI * x) / wavelength) * Math.cos(2 * Math.PI * frequency * 0.1);
    }
    
    points.push(`${x},${y}`);
  }

  const getWaveDescription = () => {
    switch (type) {
      case 'transverse':
        return 'Transverse Wave - particles move perpendicular to wave direction';
      case 'longitudinal':
        return 'Longitudinal Wave - particles move parallel to wave direction';
      case 'standing':
        return 'Standing Wave - interference of two waves with same frequency';
      default:
        return '';
    }
  };

  const getWaveSymbols = () => {
    if (type === 'longitudinal') {
      return (
        <g>
          {/* Compression and rarefaction symbols */}
          {Array.from({ length: Math.floor(width / 50) }, (_, i) => {
            const x = i * 50;
            const compression = amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase);
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={centerY - 20}
                  x2={x}
                  y2={centerY + 20}
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <circle
                  cx={x}
                  cy={centerY + compression}
                  r="3"
                  fill="#ef4444"
                />
              </g>
            );
          })}
        </g>
      );
    }
    return null;
  };

  return (
    <div className={`wave-diagram-container ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center">
          {type.charAt(0).toUpperCase() + type.slice(1)} Wave
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          {getWaveDescription()}
        </p>
        <div className="flex justify-center">
          <svg width={width} height={height} className="border border-gray-300 dark:border-gray-600 rounded-lg">
            {/* Background grid */}
            <defs>
              <pattern id="waveGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waveGrid)" />
            
            {/* Center line */}
            <line
              x1="0"
              y1={centerY}
              x2={width}
              y2={centerY}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            
            {/* Wave line */}
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />
            
            {/* Wave symbols for longitudinal waves */}
            {getWaveSymbols()}
            
            {/* Amplitude indicators */}
            <g stroke="#ef4444" strokeWidth="2" fill="none">
              <line x1="20" y1={centerY - amplitude} x2="20" y2={centerY + amplitude} />
              <line x1="15" y1={centerY - amplitude} x2="25" y2={centerY - amplitude} />
              <line x1="15" y1={centerY + amplitude} x2="25" y2={centerY + amplitude} />
            </g>
            
            {/* Wavelength indicators */}
            <g stroke="#10b981" strokeWidth="2" fill="none">
              <line x1="100" y1={centerY + amplitude + 20} x2="100 + wavelength" y2={centerY + amplitude + 20} />
              <line x1="100" y1={centerY + amplitude + 15} x2="100" y2={centerY + amplitude + 25} />
              <line x1="100 + wavelength" y1={centerY + amplitude + 15} x2="100 + wavelength" y2={centerY + amplitude + 25} />
            </g>
            
            {/* Labels */}
            <text x="30" y={centerY - amplitude - 10} className="text-xs font-medium fill-red-600">
              A = {amplitude}px
            </text>
            <text x="100 + wavelength/2" y={centerY + amplitude + 35} textAnchor="middle" className="text-xs font-medium fill-green-600">
              λ = {wavelength}px
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WaveDiagram;
