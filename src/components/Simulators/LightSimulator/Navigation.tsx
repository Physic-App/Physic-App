import React from 'react';
import { SimulatorType } from '../App';
import { Eye, Zap, Pen as Lens, Sparkles, Triangle, Waves, Compass } from 'lucide-react';

interface NavigationProps {
  activeSimulator: SimulatorType;
  setActiveSimulator: (simulator: SimulatorType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeSimulator, 
  setActiveSimulator 
}) => {
  const simulators = [
    { id: 'reflection', name: 'Reflection', icon: Eye },
    { id: 'refraction', name: 'Refraction', icon: Zap },
    { id: 'lens', name: 'Lenses', icon: Lens },
    { id: 'tir', name: 'Total Internal Reflection', icon: Sparkles },
    { id: 'prism', name: 'Prisms', icon: Triangle },
    { id: 'diffraction', name: 'Diffraction', icon: Waves },
    { id: 'polarization', name: 'Polarization', icon: Compass },
  ] as const;

  return (
    <nav className="flex flex-wrap justify-center gap-3 mb-8">
      {simulators.map(({ id, name, icon: Icon }, index) => (
        <button
          key={id}
          onClick={() => setActiveSimulator(id)}
          className={`
            group relative flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
            ${activeSimulator === id
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/30 scale-105'
              : 'bg-white/10 backdrop-blur-md text-blue-100 hover:bg-white/20 hover:text-white border border-white/20'
            }
          `}
          title={`${name} (Press ${index + 1})`}
        >
          <Icon 
            size={22} 
            className={`transition-transform duration-300 ${
              activeSimulator === id ? 'scale-110' : 'group-hover:scale-110'
            }`} 
          />
          <span className="text-sm lg:text-base">{name}</span>
          
          {/* Active indicator */}
          {activeSimulator === id && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          )}
        </button>
      ))}
    </nav>
  );
};