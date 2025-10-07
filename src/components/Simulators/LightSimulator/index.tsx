import React, { useState } from 'react';
import { ReflectionSimulator } from './ReflectionSimulator';
import { RefractionSimulator } from './RefractionSimulator';
import { LensSimulator } from './LensSimulator';
import { PrismSimulator } from './PrismSimulator';
import { TIRSimulator } from './TIRSimulator';

type SimulatorType = 'reflection' | 'refraction' | 'lens' | 'prism' | 'tir';

export const LightSimulator: React.FC = () => {
  const [activeSimulator, setActiveSimulator] = useState<SimulatorType>('reflection');

  const simulators = [
    { id: 'reflection' as const, name: 'Reflection', description: 'Light bouncing off surfaces' },
    { id: 'refraction' as const, name: 'Refraction', description: 'Light bending through media' },
    { id: 'lens' as const, name: 'Lens', description: 'Light focusing through lenses' },
    { id: 'prism' as const, name: 'Prism', description: 'Light dispersion through prisms' },
    { id: 'tir' as const, name: 'Total Internal Reflection', description: 'Light trapped in medium' }
  ];

  const renderActiveSimulator = () => {
    switch (activeSimulator) {
      case 'reflection':
        return <ReflectionSimulator />;
      case 'refraction':
        return <RefractionSimulator />;
      case 'lens':
        return <LensSimulator />;
      case 'prism':
        return <PrismSimulator />;
      case 'tir':
        return <TIRSimulator />;
      default:
        return <ReflectionSimulator />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Light and Reflection Simulator</h1>
          <p className="text-blue-200 text-lg">
            Interactive simulations for understanding light behavior, reflection, refraction, and optical phenomena
          </p>
        </div>

        {/* Simulator Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {simulators.map((simulator) => (
              <button
                key={simulator.id}
                onClick={() => setActiveSimulator(simulator.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeSimulator === simulator.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
              >
                {simulator.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Simulator */}
        <div className="mb-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">
              {simulators.find(s => s.id === activeSimulator)?.name}
            </h2>
            <p className="text-blue-200">
              {simulators.find(s => s.id === activeSimulator)?.description}
            </p>
          </div>
        </div>

        {/* Render Active Simulator */}
        {renderActiveSimulator()}
      </div>
    </div>
  );
};
