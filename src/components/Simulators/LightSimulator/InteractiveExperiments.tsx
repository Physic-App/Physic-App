import React, { useState, useEffect } from 'react';
import { Target, Trophy, Clock, CheckCircle, XCircle, RotateCcw, Play, Pause } from 'lucide-react';

export interface Experiment {
  id: string;
  title: string;
  description: string;
  objective: string;
  instructions: string[];
  parameters: {
    [key: string]: {
      min: number;
      max: number;
      step: number;
      unit: string;
      description: string;
    };
  };
  successCriteria: {
    [key: string]: {
      target: number;
      tolerance: number;
      description: string;
    };
  };
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  category: string;
  simulator: string;
}

export interface ExperimentResult {
  experimentId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  attempts: number;
  parameters: { [key: string]: number };
  timestamp: Date;
}

interface InteractiveExperimentsProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExperiment: (experiment: Experiment) => void;
  currentSimulator: string;
}

export const InteractiveExperiments: React.FC<InteractiveExperimentsProps> = ({
  isOpen,
  onClose,
  onStartExperiment,
  currentSimulator
}) => {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [completedExperiments, setCompletedExperiments] = useState<Set<string>>(new Set());
  const [experimentResults, setExperimentResults] = useState<ExperimentResult[]>([]);

  const experiments: Experiment[] = [
    {
      id: 'reflection-angle-challenge',
      title: 'Reflection Angle Challenge',
      description: 'Master the law of reflection by achieving specific angles',
      objective: 'Set the incident angle to exactly 45° and verify the reflected angle matches',
      instructions: [
        'Switch to the Reflection Simulator',
        'Adjust the incident angle slider to 45°',
        'Verify that the reflected angle is also 45°',
        'Enable multiple rays to see the pattern',
        'Try different mirror types to see the effect'
      ],
      parameters: {
        incidentAngle: {
          min: 0,
          max: 89,
          step: 1,
          unit: '°',
          description: 'Angle of the incoming light ray'
        }
      },
      successCriteria: {
        incidentAngle: {
          target: 45,
          tolerance: 1,
          description: 'Incident angle should be 45° ± 1°'
        }
      },
      hints: [
        'Remember: angle of incidence = angle of reflection',
        'Use the formula panel to verify your calculations',
        'The normal line helps visualize the angles'
      ],
      difficulty: 'easy',
      estimatedTime: 3,
      category: 'reflection',
      simulator: 'reflection'
    },
    {
      id: 'critical-angle-discovery',
      title: 'Critical Angle Discovery',
      description: 'Find the critical angle for total internal reflection',
      objective: 'Determine the critical angle for glass-to-air interface and observe TIR',
      instructions: [
        'Switch to the Refraction Simulator',
        'Set medium type to "Glass-Air"',
        'Start with a small incident angle',
        'Gradually increase the angle until TIR occurs',
        'Record the critical angle value',
        'Verify using the formula θc = sin⁻¹(n₂/n₁)'
      ],
      parameters: {
        incidentAngle: {
          min: 0,
          max: 89,
          step: 0.5,
          unit: '°',
          description: 'Incident angle to test for TIR'
        },
        mediumType: {
          min: 0,
          max: 1,
          step: 1,
          unit: '',
          description: 'Medium combination (0=Glass-Air, 1=Water-Air)'
        }
      },
      successCriteria: {
        criticalAngle: {
          target: 41.8,
          tolerance: 2,
          description: 'Critical angle should be approximately 42° for glass-air'
        }
      },
      hints: [
        'The critical angle is when refraction angle becomes 90°',
        'Look for the transition from refraction to total reflection',
        'Use the error message to identify when TIR occurs'
      ],
      difficulty: 'medium',
      estimatedTime: 8,
      category: 'refraction',
      simulator: 'refraction'
    },
    {
      id: 'lens-focusing-challenge',
      title: 'Lens Focusing Challenge',
      description: 'Create a sharp image using the thin lens formula',
      objective: 'Position an object to create a real, inverted image with magnification of -2',
      instructions: [
        'Switch to the Lens Simulator',
        'Set focal length to 20 cm',
        'Calculate the required object distance for m = -2',
        'Adjust object distance to achieve the target magnification',
        'Verify the image is real and inverted',
        'Check that the thin lens formula is satisfied'
      ],
      parameters: {
        focalLength: {
          min: 10,
          max: 50,
          step: 1,
          unit: 'cm',
          description: 'Focal length of the lens'
        },
        objectDistance: {
          min: 5,
          max: 100,
          step: 1,
          unit: 'cm',
          description: 'Distance of object from lens'
        }
      },
      successCriteria: {
        magnification: {
          target: -2,
          tolerance: 0.1,
          description: 'Magnification should be -2.0 ± 0.1'
        },
        imageType: {
          target: 1, // 1 for real image
          tolerance: 0,
          description: 'Image should be real (not virtual)'
        }
      },
      hints: [
        'Use the formula: m = -v/u = -f/(u-f)',
        'For m = -2, solve: -2 = -f/(u-f)',
        'Real images have positive image distance',
        'Check the formula panel for calculations'
      ],
      difficulty: 'hard',
      estimatedTime: 12,
      category: 'lenses',
      simulator: 'lens'
    },
    {
      id: 'prism-spectrum-analysis',
      title: 'Prism Spectrum Analysis',
      description: 'Analyze light dispersion through a prism',
      objective: 'Measure the deviation angle for different colors and find minimum deviation',
      instructions: [
        'Switch to the Prism Simulator',
        'Set prism angle to 60°',
        'Enable dispersion to see color separation',
        'Start with incident angle of 30°',
        'Gradually adjust to find minimum deviation',
        'Record the minimum deviation angle',
        'Observe how different colors deviate differently'
      ],
      parameters: {
        incidentAngle: {
          min: 0,
          max: 89,
          step: 1,
          unit: '°',
          description: 'Angle of incident light'
        },
        prismAngle: {
          min: 30,
          max: 90,
          step: 5,
          unit: '°',
          description: 'Apex angle of the prism'
        }
      },
      successCriteria: {
        minimumDeviation: {
          target: 37.2,
          tolerance: 3,
          description: 'Minimum deviation should be approximately 37°'
        }
      },
      hints: [
        'Minimum deviation occurs when light passes symmetrically',
        'Look for the smallest deviation angle as you adjust',
        'The spectrum shows how different wavelengths behave',
        'Use the deviation formula: δ = i₁ + i₂ - A'
      ],
      difficulty: 'medium',
      estimatedTime: 10,
      category: 'prisms',
      simulator: 'prism'
    },
    {
      id: 'polarization-extinction',
      title: 'Polarization Extinction',
      description: 'Achieve complete light extinction using crossed polarizers',
      objective: 'Set up two polarizers to completely block light transmission',
      instructions: [
        'Switch to the Polarization Simulator',
        'Set polarizer angle to 0°',
        'Set analyzer angle to 90°',
        'Verify that transmitted intensity is 0%',
        'Try different incident intensities',
        'Rotate the analyzer to see intensity changes',
        'Verify Malus\'s law: I = I₀ cos²(θ)'
      ],
      parameters: {
        polarizerAngle: {
          min: 0,
          max: 180,
          step: 5,
          unit: '°',
          description: 'Angle of the first polarizer'
        },
        analyzerAngle: {
          min: 0,
          max: 180,
          step: 5,
          unit: '°',
          description: 'Angle of the second polarizer'
        }
      },
      successCriteria: {
        transmittedIntensity: {
          target: 0,
          tolerance: 1,
          description: 'Transmitted intensity should be 0% ± 1%'
        }
      },
      hints: [
        'Crossed polarizers (90° difference) block all light',
        'Use the intensity display to verify extinction',
        'Malus\'s law predicts I = I₀ cos²(90°) = 0',
        'Try rotating one polarizer to see the effect'
      ],
      difficulty: 'easy',
      estimatedTime: 5,
      category: 'polarization',
      simulator: 'polarization'
    }
  ];

  const filteredExperiments = experiments.filter(exp => 
    exp.simulator === currentSimulator || currentSimulator === 'all'
  );

  const startExperiment = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    onStartExperiment(experiment);
  };

  const completeExperiment = (experimentId: string, score: number, timeSpent: number, parameters: { [key: string]: number }) => {
    const newCompleted = new Set(completedExperiments);
    newCompleted.add(experimentId);
    setCompletedExperiments(newCompleted);

    const result: ExperimentResult = {
      experimentId,
      completed: true,
      score,
      timeSpent,
      attempts: 1, // This would be tracked in the actual implementation
      parameters,
      timestamp: new Date()
    };

    setExperimentResults(prev => [...prev, result]);
    setShowResults(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-400';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Interactive Experiments</h2>
              <p className="text-blue-200 text-sm">Challenge yourself with physics experiments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XCircle className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!selectedExperiment ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Available Experiments for {currentSimulator === 'all' ? 'All Simulators' : currentSimulator}
                </h3>
                <p className="text-blue-200 text-sm">
                  Complete experiments to test your understanding of physics concepts
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExperiments.map(experiment => (
                  <div
                    key={experiment.id}
                    className="p-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-1">
                          {experiment.title}
                        </h4>
                        <p className="text-blue-200 text-sm mb-2">
                          {experiment.description}
                        </p>
                      </div>
                      {completedExperiments.has(experiment.id) && (
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <span className={`px-2 py-1 rounded border ${getDifficultyColor(experiment.difficulty)}`}>
                        {experiment.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-blue-300">
                        <Clock className="w-4 h-4" />
                        {experiment.estimatedTime} min
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-white mb-2">Objective:</h5>
                      <p className="text-blue-200 text-sm">{experiment.objective}</p>
                    </div>

                    <button
                      onClick={() => startExperiment(experiment)}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Experiment
                    </button>
                  </div>
                ))}
              </div>

              {filteredExperiments.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Experiments Available</h3>
                  <p className="text-blue-200">
                    Switch to a specific simulator to see available experiments.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedExperiment.title}</h3>
                  <p className="text-blue-200">{selectedExperiment.description}</p>
                </div>
                <button
                  onClick={() => setSelectedExperiment(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Instructions */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Objective</h4>
                    <p className="text-blue-200 bg-white/5 p-3 rounded-lg">
                      {selectedExperiment.objective}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Instructions</h4>
                    <ol className="space-y-2">
                      {selectedExperiment.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-3 text-blue-200">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Success Criteria</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedExperiment.successCriteria).map(([key, criteria]) => (
                        <div key={key} className="bg-white/5 p-3 rounded-lg">
                          <div className="text-white font-medium">{criteria.description}</div>
                          <div className="text-blue-300 text-sm">
                            Target: {criteria.target} ± {criteria.tolerance}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hints and Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Hints</h4>
                    <div className="space-y-2">
                      {selectedExperiment.hints.map((hint, index) => (
                        <div key={index} className="bg-yellow-500/10 border border-yellow-400/30 p-3 rounded-lg">
                          <div className="text-yellow-200 text-sm">{hint}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Experiment Info</h4>
                    <div className="bg-white/5 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Difficulty:</span>
                        <span className={`px-2 py-1 rounded border text-sm ${getDifficultyColor(selectedExperiment.difficulty)}`}>
                          {selectedExperiment.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Estimated Time:</span>
                        <span className="text-white">{selectedExperiment.estimatedTime} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Category:</span>
                        <span className="text-white">{selectedExperiment.category}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // This would start the actual experiment
                      onStartExperiment(selectedExperiment);
                    }}
                    className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Begin Experiment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
