import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SimulationButtonProps {
  onClick: () => void;
  variant: 'play' | 'pause' | 'reset' | 'launch';
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const SimulationButton: React.FC<SimulationButtonProps> = ({
  onClick,
  variant,
  isActive = false,
  disabled = false,
  className = '',
  children
}) => {
  const getButtonStyles = () => {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2';
    
    switch (variant) {
      case 'play':
        return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25`;
      case 'pause':
        return `${baseStyles} bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25`;
      case 'reset':
        return `${baseStyles} bg-slate-700 hover:bg-slate-600 text-white`;
      case 'launch':
        return `${baseStyles} bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/25`;
      default:
        return baseStyles;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${getButtonStyles()} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
