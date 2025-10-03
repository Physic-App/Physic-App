import React from 'react';

interface DataCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
};

interface DataRowProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

export const DataRow: React.FC<DataRowProps> = ({
  label,
  value,
  unit = '',
  className = ''
}) => {
  return (
    <div className={`flex justify-between ${className}`}>
      <span className="text-slate-400">{label}:</span>
      <span className="text-white font-mono">
        {typeof value === 'number' ? value.toFixed(2) : value}{unit}
      </span>
    </div>
  );
};
