import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-14 h-8 rounded-full transition-colors duration-300 ${
          checked ? 'bg-blue-500' : 'bg-gray-600'
        }`}>
          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            checked ? 'translate-x-7 mt-1 ml-1' : 'translate-x-1 mt-1'
          }`} />
        </div>
      </div>
      <span className="ml-3 text-white font-medium">{label}</span>
    </label>
  );
};
