import React, { useState } from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
  showValue?: boolean;
  precision?: number;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ 
  min, 
  max, 
  value, 
  onChange, 
  step = 1,
  unit = "",
  showValue = true,
  precision = 1,
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const percentage = ((value - min) / (max - min)) * 100;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const formatValue = (val: number) => {
    if (precision === 0) return val.toString();
    return val.toFixed(precision);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>{formatValue(min)}{unit}</span>
        {showValue && (
          <span className="text-blue-400 font-semibold">
            {formatValue(value)}{unit}
          </span>
        )}
        <span>{formatValue(max)}{unit}</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        />
        
        {/* Progress bar */}
        <div 
          className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg pointer-events-none transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Value indicator */}
        {isDragging && (
          <div 
            className="absolute top-6 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-10"
            style={{ left: `${percentage}%` }}
          >
            {formatValue(value)}{unit}
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 0 0 rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(0,0,0,0.4), 0 0 0 4px rgba(59, 130, 246, 0.3);
        }
        
        .slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 0 6px rgba(59, 130, 246, 0.4);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 0 4px rgba(59, 130, 246, 0.5);
        }
        
        .slider::-webkit-slider-track {
          background: transparent;
        }
        
        .slider::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
};