import React, { useState, useEffect, useCallback } from 'react';
import { Component, Connection } from './types/circuit';
import { 
  BookOpen, 
  Trophy, 
  Star, 
  Target, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Award,
  Bookmark,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface LearningLevel {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  objectives: string[];
  prerequisites: string[];
  estimatedTime: number; // in minutes
  isUnlocked: boolean;
  isCompleted: boolean;
  score: number;
  maxScore: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'circuit_design' | 'measurement' | 'troubleshooting' | 'speed' | 'accuracy';
  requirement: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

interface LearningProgress {
  currentLevel: string;
  completedLevels: string[];
  totalScore: number;
  totalTimeSpent: number;
  achievements: Achievement[];
  streak: number;
  lastActivity: Date;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  level: string;
  circuit: {
    components: Component[];
    connections: Connection[];
  };
  objectives: string[];
  constraints: string[];
  timeLimit?: number;
  hints: string[];
  solution: {
    components: Component[];
    connections: Connection[];
  };
  isCompleted: boolean;
  score: number;
  maxScore: number;
}

export const InteractiveLearningSystem: React.FC<{
  themeMode: 'light' | 'dark';
  onLoadCircuit: (components: Component[], connections: Connection[]) => void;
}> = ({ themeMode, onLoadCircuit }) => {
  const [currentLevel, setCurrentLevel] = useState<string>('level_1');
  const [learningProgress, setLearningProgress] = useState<LearningProgress>({
    currentLevel: 'level_1',
    completedLevels: [],
    totalScore: 0,
    totalTimeSpent: 0,
    achievements: [],
    streak: 0,
    lastActivity: new Date()
  });
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [challengeTime, setChallengeTime] = useState(0);
  const [showHints, setShowHints] = useState(false);

  // Learning levels
  const learningLevels: LearningLevel[] = [
    {
      id: 'level_1',
      name: 'Basic Circuits',
      description: 'Learn the fundamentals of electrical circuits',
      difficulty: 'beginner',
      objectives: [
        'Understand voltage, current, and resistance',
        'Build simple series circuits',
        'Use Ohm\'s Law',
        'Measure voltage and current'
      ],
      prerequisites: [],
      estimatedTime: 30,
      isUnlocked: true,
      isCompleted: false,
      score: 0,
      maxScore: 100
    },
    {
      id: 'level_2',
      name: 'Parallel Circuits',
      description: 'Explore parallel circuit configurations',
      difficulty: 'beginner',
      objectives: [
        'Build parallel circuits',
        'Understand current division',
        'Calculate equivalent resistance',
        'Compare series vs parallel'
      ],
      prerequisites: ['level_1'],
      estimatedTime: 45,
      isUnlocked: false,
      isCompleted: false,
      score: 0,
      maxScore: 150
    },
    {
      id: 'level_3',
      name: 'Complex Circuits',
      description: 'Master combination circuits',
      difficulty: 'intermediate',
      objectives: [
        'Build series-parallel circuits',
        'Apply Kirchhoff\'s laws',
        'Solve complex circuit problems',
        'Use advanced measurement tools'
      ],
      prerequisites: ['level_1', 'level_2'],
      estimatedTime: 60,
      isUnlocked: false,
      isCompleted: false,
      score: 0,
      maxScore: 200
    },
    {
      id: 'level_4',
      name: 'AC Circuits',
      description: 'Introduction to alternating current',
      difficulty: 'intermediate',
      objectives: [
        'Understand AC vs DC',
        'Work with capacitors and inductors',
        'Calculate impedance',
        'Use oscilloscope'
      ],
      prerequisites: ['level_3'],
      estimatedTime: 90,
      isUnlocked: false,
      isCompleted: false,
      score: 0,
      maxScore: 250
    },
    {
      id: 'level_5',
      name: 'Advanced Analysis',
      description: 'Professional circuit analysis techniques',
      difficulty: 'advanced',
      objectives: [
        'Apply nodal analysis',
        'Use mesh analysis',
        'Design complex circuits',
        'Troubleshoot circuit problems'
      ],
      prerequisites: ['level_4'],
      estimatedTime: 120,
      isUnlocked: false,
      isCompleted: false,
      score: 0,
      maxScore: 300
    }
  ];

  // Achievements
  const achievements: Achievement[] = [
    {
      id: 'first_circuit',
      name: 'First Steps',
      description: 'Build your first circuit',
      icon: '🎯',
      category: 'circuit_design',
      requirement: 'Build a simple series circuit',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'ohm_master',
      name: 'Ohm\'s Law Master',
      description: 'Correctly apply Ohm\'s Law 10 times',
      icon: '⚡',
      category: 'accuracy',
      requirement: 'Apply Ohm\'s Law correctly 10 times',
      isUnlocked: false,
      progress: 0,
      maxProgress: 10
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a challenge in under 2 minutes',
      icon: '🏃',
      category: 'speed',
      requirement: 'Complete any challenge in under 2 minutes',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Get 100% score on 5 challenges',
      icon: '💯',
      category: 'accuracy',
      requirement: 'Get perfect score on 5 challenges',
      isUnlocked: false,
      progress: 0,
      maxProgress: 5
    },
    {
      id: 'troubleshooter',
      name: 'Troubleshooter',
      description: 'Fix 10 broken circuits',
      icon: '🔧',
      category: 'troubleshooting',
      requirement: 'Successfully troubleshoot 10 circuits',
      isUnlocked: false,
      progress: 0,
      maxProgress: 10
    }
  ];

  // Sample challenges
  const challenges: Challenge[] = [
    {
      id: 'challenge_1',
      title: 'Simple Series Circuit',
      description: 'Build a series circuit with a battery, resistor, and bulb',
      level: 'level_1',
      circuit: {
        components: [],
        connections: []
      },
      objectives: [
        'Add a 12V battery',
        'Add a 10Ω resistor',
        'Add a bulb',
        'Connect components in series',
        'Measure total current'
      ],
      constraints: [
        'Use exactly 3 components',
        'Connect in series configuration',
        'Total resistance should be 10Ω'
      ],
      timeLimit: 300, // 5 minutes
      hints: [
        'Start by placing the battery',
        'Connect the resistor to the battery',
        'Connect the bulb to complete the circuit',
        'Use an ammeter to measure current'
      ],
      solution: {
        components: [
          {
            id: 'battery_1',
            type: 'battery',
            position: { x: 100, y: 100 },
            terminals: [{ x: 0, y: 0 }, { x: 40, y: 0 }],
            properties: { voltage: 12, resistance: 0.001 }
          },
          {
            id: 'resistor_1',
            type: 'resistor',
            position: { x: 200, y: 100 },
            terminals: [{ x: 0, y: 0 }, { x: 40, y: 0 }],
            properties: { resistance: 10 }
          },
          {
            id: 'bulb_1',
            type: 'bulb',
            position: { x: 300, y: 100 },
            terminals: [{ x: 0, y: 0 }, { x: 40, y: 0 }],
            properties: { resistance: 10, power: 5 }
          }
        ],
        connections: [
          {
            id: 'conn_1',
            fromComponentId: 'battery_1',
            toComponentId: 'resistor_1',
            fromTerminal: 1,
            toTerminal: 0
          },
          {
            id: 'conn_2',
            fromComponentId: 'resistor_1',
            toComponentId: 'bulb_1',
            fromTerminal: 1,
            toTerminal: 0
          },
          {
            id: 'conn_3',
            fromComponentId: 'bulb_1',
            toComponentId: 'battery_1',
            fromTerminal: 1,
            toTerminal: 0
          }
        ]
      },
      isCompleted: false,
      score: 0,
      maxScore: 100
    }
  ];

  // Start challenge
  const startChallenge = useCallback((challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsChallengeActive(true);
    setChallengeTime(0);
    setShowHints(false);
    
    // Load the challenge circuit
    onLoadCircuit(challenge.circuit.components, challenge.circuit.connections);
  }, [onLoadCircuit]);

  // Complete challenge
  const completeChallenge = useCallback((score: number) => {
    if (!selectedChallenge) return;

    const updatedChallenge = {
      ...selectedChallenge,
      isCompleted: true,
      score
    };

    // Update learning progress
    setLearningProgress(prev => ({
      ...prev,
      totalScore: prev.totalScore + score,
      totalTimeSpent: prev.totalTimeSpent + challengeTime
    }));

    // Check for achievements
    checkAchievements(updatedChallenge);

    setIsChallengeActive(false);
    setSelectedChallenge(null);
  }, [selectedChallenge, challengeTime]);

  // Check achievements
  const checkAchievements = useCallback((challenge: Challenge) => {
    setLearningProgress(prev => {
      const updatedAchievements = [...prev.achievements];
      
      // Check speed demon achievement
      if (challengeTime < 120 && !updatedAchievements.find(a => a.id === 'speed_demon')?.isUnlocked) {
        const achievement = updatedAchievements.find(a => a.id === 'speed_demon');
        if (achievement) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date();
        }
      }
      
      // Check perfectionist achievement
      if (score === challenge.maxScore) {
        const achievement = updatedAchievements.find(a => a.id === 'perfectionist');
        if (achievement) {
          achievement.progress++;
          if (achievement.progress >= achievement.maxProgress) {
            achievement.isUnlocked = true;
            achievement.unlockedAt = new Date();
          }
        }
      }
      
      return {
        ...prev,
        achievements: updatedAchievements
      };
    });
  }, [challengeTime]);

  // Timer effect
  useEffect(() => {
    if (isChallengeActive && selectedChallenge?.timeLimit) {
      const timer = setInterval(() => {
        setChallengeTime(prev => {
          const newTime = prev + 1;
          if (newTime >= selectedChallenge.timeLimit!) {
            completeChallenge(0); // Time's up
            return prev;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isChallengeActive, selectedChallenge, completeChallenge]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-orange-500';
      case 'expert': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyBg = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Interactive Learning
            </h1>
            <p className={`text-sm ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Master electrical circuits through hands-on practice
            </p>
          </div>
        </div>
        
        {/* Progress Summary */}
        <div className={`p-4 rounded-lg border ${
          themeMode === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {learningProgress.totalScore}
            </div>
            <div className="text-sm opacity-75">Total Score</div>
          </div>
        </div>
      </div>

      {/* Learning Levels */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Learning Levels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {learningLevels.map(level => (
            <div
              key={level.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                level.isUnlocked
                  ? themeMode === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-500'
                  : themeMode === 'dark'
                    ? 'bg-gray-900 border-gray-800 opacity-50'
                    : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{level.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyBg(level.difficulty)}`}>
                  {level.difficulty}
                </span>
              </div>
              
              <p className={`text-sm mb-3 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {level.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{level.score}/{level.maxScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(level.score / level.maxScore) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{level.estimatedTime} min</span>
                </div>
                {level.isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <button
                onClick={() => setCurrentLevel(level.id)}
                disabled={!level.isUnlocked}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  level.isUnlocked
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {level.isCompleted ? 'Review' : 'Start Level'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Challenges
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges
            .filter(challenge => challenge.level === currentLevel)
            .map(challenge => (
              <div
                key={challenge.id}
                className={`p-4 rounded-lg border-2 ${
                  themeMode === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  {challenge.isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                
                <p className={`text-sm mb-3 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {challenge.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium">Objectives:</div>
                  <ul className="text-sm space-y-1">
                    {challenge.objectives.map((objective, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Target className="w-3 h-3" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    Score: {challenge.score}/{challenge.maxScore}
                  </div>
                  {challenge.timeLimit && (
                    <div className="text-sm">
                      Time Limit: {formatTime(challenge.timeLimit)}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => startChallenge(challenge)}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {challenge.isCompleted ? 'Retry Challenge' : 'Start Challenge'}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Active Challenge */}
      {isChallengeActive && selectedChallenge && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
          <div className={`max-w-4xl w-full rounded-2xl shadow-2xl border-2 ${
            themeMode === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b ${
              themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedChallenge.title}</h2>
                <div className="flex items-center space-x-4">
                  {selectedChallenge.timeLimit && (
                    <div className={`px-3 py-1 rounded ${
                      challengeTime > selectedChallenge.timeLimit * 0.8
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {formatTime(selectedChallenge.timeLimit - challengeTime)}
                    </div>
                  )}
                  <button
                    onClick={() => setIsChallengeActive(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Objectives</h3>
                  <ul className="space-y-2">
                    {selectedChallenge.objectives.map((objective, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Hints</h3>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="mb-3 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    {showHints ? 'Hide Hints' : 'Show Hints'}
                  </button>
                  
                  {showHints && (
                    <ul className="space-y-2">
                      {selectedChallenge.hints.map((hint, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Star className="w-4 h-4 mt-0.5 text-yellow-500" />
                          <span className="text-sm">{hint}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${
                achievement.isUnlocked
                  ? themeMode === 'dark'
                    ? 'bg-yellow-900/20 border-yellow-700'
                    : 'bg-yellow-50 border-yellow-200'
                  : themeMode === 'dark'
                    ? 'bg-gray-800 border-gray-700 opacity-50'
                    : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <p className="text-sm opacity-75">{achievement.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
              
              {achievement.isUnlocked && (
                <div className="mt-3 text-sm text-yellow-600">
                  <Trophy className="w-4 h-4 inline mr-1" />
                  Unlocked!
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
