import React from 'react';
import { useNavigate } from 'react-router-dom';
import LightSimulatorMain from '../components/Simulators/LightSimulator/LightSimulatorMain';

const LightSimulator: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app/simulator');
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <LightSimulatorMain onBack={handleBack} />
    </div>
  );
};

export default LightSimulator;
