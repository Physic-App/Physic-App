import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ReflectionSimulator } from './ReflectionSimulator';
import { RefractionSimulator } from './RefractionSimulator';
import { LensSimulator } from './LensSimulator';
import { TIRSimulator } from './TIRSimulator';
import { PrismSimulator } from './PrismSimulator';

interface LightSimulatorMainProps {
  onBack: () => void;
}

const LightSimulatorMain: React.FC<LightSimulatorMainProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('reflection');

  const tabs = [
    { id: 'reflection', label: 'Reflection', component: ReflectionSimulator },
    { id: 'refraction', label: 'Refraction', component: RefractionSimulator },
    { id: 'lenses', label: 'Lenses', component: LensSimulator },
    { id: 'tir', label: 'Total Internal Reflection', component: TIRSimulator },
    { id: 'prisms', label: 'Prisms', component: PrismSimulator }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ReflectionSimulator;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Simulators
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightSimulatorMain;