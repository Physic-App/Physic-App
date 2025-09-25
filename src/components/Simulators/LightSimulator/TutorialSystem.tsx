import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, HelpCircle, X } from 'lucide-react';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
  action?: () => void; // Action to perform
  position?: 'top' | 'bottom' | 'left' | 'right';
  showNext?: boolean;
  showPrevious?: boolean;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  estimatedTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

interface TutorialSystemProps {
  tutorials: Tutorial[];
  onClose: () => void;
  onComplete: (tutorialId: string) => void;
}

export const TutorialSystem: React.FC<TutorialSystemProps> = ({
  tutorials,
  onClose,
  onComplete
}) => {
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [showTutorialList, setShowTutorialList] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load completed tutorials from localStorage
    const saved = localStorage.getItem('completedTutorials');
    if (saved) {
      setCompletedTutorials(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    if (currentTutorial && isPlaying) {
      const currentStep = currentTutorial.steps[currentStepIndex];
      if (currentStep.autoAdvance && currentStep.autoAdvanceDelay) {
        const timer = setTimeout(() => {
          nextStep();
        }, currentStep.autoAdvanceDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [currentTutorial, currentStepIndex, isPlaying]);

  const startTutorial = (tutorial: Tutorial) => {
    setCurrentTutorial(tutorial);
    setCurrentStepIndex(0);
    setShowTutorialList(false);
    setIsPlaying(true);
  };

  const nextStep = () => {
    if (!currentTutorial) return;
    
    if (currentStepIndex < currentTutorial.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Tutorial completed
      const newCompleted = new Set(completedTutorials);
      newCompleted.add(currentTutorial.id);
      setCompletedTutorials(newCompleted);
      localStorage.setItem('completedTutorials', JSON.stringify([...newCompleted]));
      onComplete(currentTutorial.id);
      setCurrentTutorial(null);
      setShowTutorialList(true);
      setIsPlaying(false);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTutorial = () => {
    if (currentTutorial) {
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  };

  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add highlight effect
      element.classList.add('tutorial-highlight');
      setTimeout(() => {
        element.classList.remove('tutorial-highlight');
      }, 2000);
    }
  };

  const executeStepAction = (step: TutorialStep) => {
    if (step.action) {
      step.action();
    }
    if (step.target) {
      highlightElement(step.target);
    }
  };

  if (showTutorialList) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Interactive Tutorials</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  completedTutorials.has(tutorial.id)
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
                onClick={() => startTutorial(tutorial)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{tutorial.title}</h3>
                  {completedTutorials.has(tutorial.id) && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-blue-200 text-sm mb-3">{tutorial.description}</p>
                <div className="flex items-center justify-between text-xs text-blue-300">
                  <span className={`px-2 py-1 rounded ${
                    tutorial.difficulty === 'beginner' ? 'bg-green-500/30' :
                    tutorial.difficulty === 'intermediate' ? 'bg-yellow-500/30' :
                    'bg-red-500/30'
                  }`}>
                    {tutorial.difficulty}
                  </span>
                  <span>{tutorial.estimatedTime} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentTutorial) return null;

  const currentStep = currentTutorial.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / currentTutorial.steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-2xl w-full border border-white/20">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-blue-200 mb-2">
            <span>Step {currentStepIndex + 1} of {currentTutorial.steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tutorial Content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
          <p className="text-blue-200 leading-relaxed">{currentStep.content}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={previousStep}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={resetTutorial}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTutorialList(true)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              Back to List
            </button>
            
            <button
              onClick={nextStep}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-white"
            >
              {currentStepIndex === currentTutorial.steps.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tutorial data
export const defaultTutorials: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using the Light Simulator',
    estimatedTime: 5,
    difficulty: 'beginner',
    category: 'basics',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to the Light Simulator!',
        content: 'This interactive simulator helps you understand light physics through hands-on experimentation. Let\'s start with the basics.',
        showNext: true
      },
      {
        id: 'navigation',
        title: 'Navigation',
        content: 'Use the navigation buttons at the top to switch between different simulators. Each simulator focuses on a specific aspect of light physics.',
        target: 'nav',
        showNext: true
      },
      {
        id: 'controls',
        title: 'Controls',
        content: 'Each simulator has interactive controls like sliders and toggles. Try adjusting the parameters to see how they affect the simulation.',
        target: '.controls',
        showNext: true
      },
      {
        id: 'canvas',
        title: 'Interactive Canvas',
        content: 'The main canvas shows the physics simulation in real-time. Watch how changes in parameters affect the light behavior.',
        target: 'canvas',
        showNext: true
      },
      {
        id: 'formulas',
        title: 'Physics Formulas',
        content: 'Each simulator displays the relevant physics formulas and calculations. This helps you understand the mathematical relationships.',
        target: '.formula-panel',
        showNext: true
      }
    ]
  },
  {
    id: 'reflection-basics',
    title: 'Reflection Basics',
    description: 'Master the law of reflection with interactive examples',
    estimatedTime: 8,
    difficulty: 'beginner',
    category: 'reflection',
    steps: [
      {
        id: 'law-intro',
        title: 'Law of Reflection',
        content: 'The law of reflection states that the angle of incidence equals the angle of reflection. Let\'s explore this with the reflection simulator.',
        action: () => {
          // Switch to reflection simulator
          const event = new CustomEvent('switchSimulator', { detail: 'reflection' });
          window.dispatchEvent(event);
        },
        showNext: true
      },
      {
        id: 'angle-adjustment',
        title: 'Adjusting the Angle',
        content: 'Try changing the incident angle using the slider. Notice how the reflected angle always equals the incident angle.',
        target: '.slider',
        showNext: true
      },
      {
        id: 'mirror-types',
        title: 'Different Mirror Types',
        content: 'Explore different mirror types: plane, concave, and convex. Each creates different image characteristics.',
        target: 'select',
        showNext: true
      },
      {
        id: 'multiple-rays',
        title: 'Multiple Rays',
        content: 'Enable multiple rays to see how different incident angles behave. This helps visualize the law of reflection.',
        target: '.toggle',
        showNext: true
      }
    ]
  },
  {
    id: 'refraction-exploration',
    title: 'Refraction Exploration',
    description: 'Discover how light bends when changing media',
    estimatedTime: 10,
    difficulty: 'intermediate',
    category: 'refraction',
    steps: [
      {
        id: 'snells-law',
        title: 'Snell\'s Law',
        content: 'Snell\'s law describes how light bends when passing between different media. The bending depends on the refractive indices.',
        action: () => {
          const event = new CustomEvent('switchSimulator', { detail: 'refraction' });
          window.dispatchEvent(event);
        },
        showNext: true
      },
      {
        id: 'medium-selection',
        title: 'Choosing Media',
        content: 'Select different medium combinations to see how the refractive index affects light bending.',
        target: 'select',
        showNext: true
      },
      {
        id: 'critical-angle',
        title: 'Critical Angle',
        content: 'Increase the incident angle to find the critical angle where total internal reflection occurs.',
        target: '.slider',
        showNext: true
      },
      {
        id: 'tir-demo',
        title: 'Total Internal Reflection',
        content: 'When the incident angle exceeds the critical angle, all light is reflected back. This is total internal reflection.',
        showNext: true
      }
    ]
  }
];

// CSS for tutorial highlighting
export const tutorialStyles = `
  .tutorial-highlight {
    animation: tutorial-pulse 2s ease-in-out;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
    border: 2px solid rgba(59, 130, 246, 0.8);
    border-radius: 8px;
  }

  @keyframes tutorial-pulse {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
      transform: scale(1);
    }
    50% { 
      box-shadow: 0 0 30px rgba(59, 130, 246, 1);
      transform: scale(1.02);
    }
  }
`;
