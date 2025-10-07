import React from 'react';
<<<<<<< HEAD
import { LightSimulator } from '../components/Simulators/LightSimulator';

const LightSimulatorPage: React.FC = () => {
  return <LightSimulator />;
};

export default LightSimulatorPage;
=======
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
>>>>>>> ec44e8e66d2def0010ef81ca652a2e1ce955ee5f
