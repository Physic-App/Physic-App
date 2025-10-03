import React from 'react';

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
  helpText?: string;
}

export const ControlSlider: React.FC<ControlSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
  className = '',
  helpText
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-300">
        {label}: {value.toFixed(step < 1 ? 2 : 0)}{unit}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        aria-label={label}
      />
      {helpText && (
        <p className="text-xs text-slate-400">{helpText}</p>
      )}
    </div>
  );
};
