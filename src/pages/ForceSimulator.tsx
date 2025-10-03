import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ForceSimulatorMain from '../components/Simulators/ForceSimulator/ForceSimulatorMain';

const ForceSimulator: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate('/app/simulator')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Simulators
        </button>
        <ForceSimulatorMain />
      </div>
    </div>
  );
};

export default ForceSimulator;
