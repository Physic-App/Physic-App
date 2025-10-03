import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Zap, Gauge } from 'lucide-react';

const Simulator: React.FC = () => {
  const navigate = useNavigate();
  
  const simulators = [
    {
      id: 'light-reflection',
      title: 'Light: Reflection and Refraction',
      description: 'Explore how light behaves when it hits mirrors and passes through different materials',
      icon: Lightbulb,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700'
    },
    {
      id: 'force-motion',
      title: 'Force and Law of Motion',
      description: 'Interactive simulation of forces, acceleration, and Newton\'s laws',
      icon: Gauge,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    {
      id: 'electricity',
      title: 'Electricity',
      description: 'Build circuits, see current flow, and understand electrical concepts',
      icon: Zap,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700'
    }
  ];

  const handleSimulatorClick = (simulatorId: string) => {
    switch (simulatorId) {
      case 'light-reflection':
        navigate('/app/simulator/light');
        break;
      case 'force-motion':
        navigate('/app/simulator/force');
        break;
      case 'electricity':
        navigate('/app/simulator/electricity');
        break;
      default:
        console.log(`Opening simulator: ${simulatorId}`);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎮 Physics Simulators
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Interactive simulations to help you understand physics concepts through hands-on experimentation
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {simulators.map((simulator) => {
            const IconComponent = simulator.icon;
            return (
              <div
                key={simulator.id}
                onClick={() => handleSimulatorClick(simulator.id)}
                className={`
                  ${simulator.bgColor} ${simulator.borderColor}
                  border-2 rounded-2xl p-8 cursor-pointer
                  hover:shadow-xl hover:scale-105 transition-all duration-300
                  group
                `}
              >
                {/* Icon */}
                <div className={`
                  w-20 h-20 mx-auto mb-6 rounded-2xl
                  bg-gradient-to-r ${simulator.color}
                  flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  <IconComponent size={40} className="text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                  {simulator.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                  {simulator.description}
                </p>

                {/* Hover Effect */}
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-300">
                    Launch Simulator →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              More Simulators Coming Soon!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We're working on additional physics simulations including wave mechanics, thermodynamics, and quantum physics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
