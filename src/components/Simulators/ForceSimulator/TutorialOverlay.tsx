import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Play, MousePointer, Settings, BarChart3 } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  icon: any;
}

interface TutorialOverlayProps {
  isActive: boolean;
  onComplete: () => void;
  simulatorType: string;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isActive,
  onComplete,
  simulatorType
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const getTutorialSteps = (): TutorialStep[] => {
    switch (simulatorType) {
      case 'newton':
        return [
          {
            id: 'welcome',
            title: 'Welcome to Newton\'s Laws Simulator!',
            description: 'Let\'s learn about the three fundamental laws of motion through interactive simulation.',
            target: '.simulation-header',
            position: 'bottom',
            icon: Play
          },
          {
            id: 'law-selection',
            title: 'Choose a Law',
            description: 'Click on any of these cards to select which law you want to explore. Each law demonstrates different physics concepts.',
            target: '.law-cards',
            position: 'bottom',
            icon: Settings
          },
          {
            id: 'controls',
            title: 'Adjust Parameters',
            description: 'Use these sliders to change the applied force, mass, and friction. Watch how they affect the object\'s motion.',
            target: '.controls-panel',
            position: 'left',
            icon: Settings
          },
          {
            id: 'simulation',
            title: 'Run the Simulation',
            description: 'Click the Play button to start the simulation. You can also drag the object to change its position.',
            target: '.simulation-canvas',
            position: 'top',
            icon: Play
          },
          {
            id: 'data',
            title: 'Monitor Live Data',
            description: 'Watch the real-time data update as the simulation runs. This shows you the physics in action.',
            target: '.data-panel',
            position: 'right',
            icon: BarChart3
          }
        ];
      case 'friction':
        return [
          {
            id: 'welcome',
            title: 'Friction Simulator',
            description: 'Learn how friction affects motion on different surfaces.',
            target: '.simulation-header',
            position: 'bottom',
            icon: Play
          },
          {
            id: 'surface-selection',
            title: 'Choose Surface Type',
            description: 'Select between smooth and rough surfaces to see how friction changes.',
            target: '.surface-cards',
            position: 'bottom',
            icon: Settings
          },
          {
            id: 'friction-controls',
            title: 'Adjust Friction',
            description: 'Use the friction coefficient slider to see how it affects the object\'s movement.',
            target: '.friction-controls',
            position: 'left',
            icon: Settings
          },
          {
            id: 'observe-motion',
            title: 'Observe the Motion',
            description: 'Watch how the object behaves differently on smooth vs rough surfaces.',
            target: '.simulation-canvas',
            position: 'top',
            icon: MousePointer
          }
        ];
      case 'collision':
        return [
          {
            id: 'welcome',
            title: 'Collision Simulator',
            description: 'Explore different types of collisions between objects.',
            target: '.simulation-header',
            position: 'bottom',
            icon: Play
          },
          {
            id: 'collision-type',
            title: 'Select Collision Type',
            description: 'Choose between elastic, inelastic, or perfectly inelastic collisions.',
            target: '.collision-cards',
            position: 'bottom',
            icon: Settings
          },
          {
            id: 'adjust-masses',
            title: 'Adjust Object Masses',
            description: 'Change the masses of both objects to see how it affects the collision.',
            target: '.collision-controls',
            position: 'left',
            icon: Settings
          },
          {
            id: 'watch-collision',
            title: 'Watch the Collision',
            description: 'Run the simulation to see how the objects collide and exchange momentum.',
            target: '.simulation-canvas',
            position: 'top',
            icon: Play
          }
        ];
      case 'gravity':
        return [
          {
            id: 'welcome',
            title: 'Gravity Simulator',
            description: 'Explore projectile motion and gravitational forces.',
            target: '.simulation-header',
            position: 'bottom',
            icon: Play
          },
          {
            id: 'motion-type',
            title: 'Choose Motion Type',
            description: 'Select between free fall, projectile, or orbital motion.',
            target: '.gravity-cards',
            position: 'bottom',
            icon: Settings
          },
          {
            id: 'launch-parameters',
            title: 'Set Launch Parameters',
            description: 'Adjust the launch angle and initial velocity to see different trajectories.',
            target: '.gravity-controls',
            position: 'left',
            icon: Settings
          },
          {
            id: 'launch-object',
            title: 'Launch the Object',
            description: 'Click the Launch button and watch the object follow a parabolic path.',
            target: '.simulation-canvas',
            position: 'top',
            icon: Play
          }
        ];
      default:
        return [];
    }
  };

  const steps = getTutorialSteps();
  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsHighlighted(true);
      
      // Add highlight effect
      targetElement.classList.add('tutorial-highlight');
      
      return () => {
        targetElement.classList.remove('tutorial-highlight');
        setIsHighlighted(false);
      };
    }
  }, [currentStep, isActive, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isActive || !currentStepData) return null;

  const getTooltipPosition = () => {
    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) return { top: '50%', left: '50%' };

    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (currentStepData.position) {
      case 'top':
        return {
          top: `${rect.top + scrollTop - 20}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: 'translateX(-50%) translateY(-100%)'
        };
      case 'bottom':
        return {
          top: `${rect.bottom + scrollTop + 20}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.left + scrollLeft - 20}px`,
          transform: 'translateX(-100%) translateY(-50%)'
        };
      case 'right':
        return {
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.right + scrollLeft + 20}px`,
          transform: 'translateY(-50%)'
        };
      default:
        return { top: '50%', left: '50%' };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      
      {/* Tooltip */}
      <div
        className="fixed z-50 bg-slate-800 rounded-xl p-6 max-w-sm border border-slate-600 shadow-2xl"
        style={getTooltipPosition()}
      >
        <div className="flex items-center gap-3 mb-4">
          {currentStepData.icon && <currentStepData.icon className="w-6 h-6 text-blue-400" />}
          <h3 className="text-lg font-semibold text-white">{currentStepData.title}</h3>
        </div>
        
        <p className="text-slate-300 mb-6 leading-relaxed">{currentStepData.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-400">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="px-3 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
