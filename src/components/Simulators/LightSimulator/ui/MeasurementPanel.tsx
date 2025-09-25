import React from 'react';

interface MeasurementData {
  label: string;
  value: string | number;
  unit?: string;
  precision?: number;
}

interface MeasurementPanelProps {
  title: string;
  measurements: MeasurementData[];
  className?: string;
}

export const MeasurementPanel: React.FC<MeasurementPanelProps> = ({ 
  title, 
  measurements, 
  className = "" 
}) => {
  const formatValue = (value: string | number, precision?: number): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') {
      if (precision !== undefined) {
        return value.toFixed(precision);
      }
      return value.toString();
    }
    return String(value);
  };

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 border border-gray-600 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        {title}
      </h3>
      <div className="space-y-3">
        {measurements.map((measurement, index) => (
          <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded">
            <span className="text-gray-300 font-medium">{measurement.label}</span>
            <span className="text-white font-mono text-sm">
              {formatValue(measurement.value, measurement.precision)}
              {measurement.unit && <span className="text-gray-400 ml-1">{measurement.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
