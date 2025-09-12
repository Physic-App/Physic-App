import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chapter } from '../types';
import Breadcrumb from '../components/Common/Breadcrumb';
import { Clock, Award, Play, Lock } from 'lucide-react';

const Chapters: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'completed'>('all');

  const mathChapters: Chapter[] = [
    {
      id: 1,
      title: "Basic Algebra",
      description: "Master the fundamentals of algebraic expressions and equations",
      icon: "📊",
      progress: 100,
      isUnlocked: true,
      isCompleted: true,
      topics: ["Variables & Constants", "Linear Equations", "Factorization", "Polynomials"],
      studyTime: 8,
      quizzes: 5
    },
    {
      id: 2,
      title: "Geometry",
      description: "Explore shapes, angles, and spatial relationships",
      icon: "📐",
      progress: 75,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Triangles", "Circles", "Polygons", "Area & Perimeter"],
      studyTime: 6,
      quizzes: 4
    },
    {
      id: 3,
      title: "Trigonometry",
      description: "Learn about ratios, angles, and wave functions",
      icon: "📊",
      progress: 40,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Basic Ratios", "Identities", "Heights & Distances", "Graphs"],
      studyTime: 3,
      quizzes: 2
    },
    {
      id: 4,
      title: "Coordinate Geometry",
      description: "Combine algebra and geometry using coordinate systems",
      icon: "📈",
      progress: 0,
      isUnlocked: false,
      isCompleted: false,
      topics: ["Point & Distance", "Lines", "Circles", "Conic Sections"],
      studyTime: 0,
      quizzes: 0
    },
    {
      id: 5,
      title: "Statistics & Probability",
      description: "Analyze data and understand chance and uncertainty",
      icon: "📊",
      progress: 0,
      isUnlocked: false,
      isCompleted: false,
      topics: ["Data Handling", "Mean, Median, Mode", "Probability", "Distributions"],
      studyTime: 0,
      quizzes: 0
    },
    {
      id: 6,
      title: "Calculus Basics",
      description: "Introduction to limits, derivatives, and integrals",
      icon: "∫",
      progress: 0,
      isUnlocked: false,
      isCompleted: false,
      topics: ["Limits", "Derivatives", "Applications", "Basic Integration"],
      studyTime: 0,
      quizzes: 0
    }
  ];

  const physicsChapters: Chapter[] = [
    {
      id: 7,
      title: "Force and Pressure",
      description: "Understanding forces and their effects on matter",
      icon: "💪",
      progress: 85,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Types of Forces", "Pressure in Fluids", "Atmospheric Pressure", "Buoyancy"],
      studyTime: 8,
      quizzes: 4
    },
    {
      id: 8,
      title: "Friction",
      description: "Study the force that opposes motion between surfaces",
      icon: "🛞",
      progress: 70,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Static Friction", "Kinetic Friction", "Rolling Friction", "Factors Affecting Friction"],
      studyTime: 6,
      quizzes: 4
    },
    {
      id: 9,
      title: "Electric Current and Its Effects",
      description: "Explore electric current and its various applications",
      icon: "⚡",
      progress: 60,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Electric Current", "Heating Effect", "Chemical Effect", "Magnetic Effect"],
      studyTime: 6,
      quizzes: 4
    },
    {
      id: 10,
      title: "Motion",
      description: "Understanding different types of motion and their characteristics",
      icon: "🏃",
      progress: 90,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Types of Motion", "Speed and Velocity", "Acceleration", "Equations of Motion"],
      studyTime: 10,
      quizzes: 5
    },
    {
      id: 11,
      title: "Force and Laws of Motion",
      description: "Learn Newton's laws and their applications",
      icon: "🎯",
      progress: 75,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Conservation of Momentum"],
      studyTime: 8,
      quizzes: 4
    },
    {
      id: 12,
      title: "Gravitation",
      description: "Study gravitational force and its effects",
      icon: "🌍",
      progress: 40,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Universal Gravitation", "Free Fall", "Weight and Mass", "Planetary Motion"],
      studyTime: 7,
      quizzes: 3
    },
    {
      id: 13,
      title: "Light: Reflection and Refraction",
      description: "Explore how light behaves when it encounters different materials",
      icon: "💡",
      progress: 55,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Laws of Reflection", "Mirrors", "Refraction", "Lenses"],
      studyTime: 9,
      quizzes: 4
    },
    {
      id: 14,
      title: "Electricity",
      description: "Understanding electric circuits and electrical phenomena",
      icon: "🔌",
      progress: 30,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Electric Charge", "Electric Potential", "Ohm's Law", "Electric Circuits"],
      studyTime: 8,
      quizzes: 4
    },
    {
      id: 15,
      title: "Magnetic Effects of Electric Current",
      description: "Study the relationship between electricity and magnetism",
      icon: "🧲",
      progress: 25,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Magnetic Field", "Electromagnetic Induction", "Electric Motor", "Electric Generator"],
      studyTime: 4,
      quizzes: 3
    },
    {
      id: 16,
      title: "Work and Energy",
      description: "Learn about work, energy, and power in physical systems",
      icon: "⚙️",
      progress: 15,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Work Done", "Kinetic Energy", "Potential Energy", "Conservation of Energy"],
      studyTime: 2,
      quizzes: 2
    }
  ];

  const chemistryChapters: Chapter[] = [
    {
      id: 17,
      title: "Atomic Structure",
      description: "Understanding atoms, electrons, and chemical bonding",
      icon: "⚛️",
      progress: 100,
      isUnlocked: true,
      isCompleted: true,
      topics: ["Electron Configuration", "Periodic Table", "Chemical Bonding", "Molecular Geometry"],
      studyTime: 10,
      quizzes: 5
    },
    {
      id: 18,
      title: "Chemical Reactions",
      description: "Study reaction types, kinetics, and equilibrium",
      icon: "🧪",
      progress: 90,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Reaction Types", "Stoichiometry", "Kinetics", "Equilibrium"],
      studyTime: 8,
      quizzes: 4
    },
    {
      id: 19,
      title: "Organic Chemistry",
      description: "Explore carbon compounds and their reactions",
      icon: "🧬",
      progress: 70,
      isUnlocked: true,
      isCompleted: false,
      topics: ["Hydrocarbons", "Functional Groups", "Isomerism", "Reaction Mechanisms"],
      studyTime: 6,
      quizzes: 3
    }
  ];

  useEffect(() => {
    switch (filter) {
      case 'unlocked':
        setChapters(physicsChapters);
        break;
      case 'completed':
        setChapters(chemistryChapters);
        break;
      default:
        setChapters(mathChapters);
    }
  }, [filter]);

  const filteredChapters = chapters.filter(chapter => {
    // Since we're now switching entire chapter sets, show all chapters from the selected subject
    return true;
  });

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Chapters' }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <section className="flex flex-col lg:flex-row justify-between items-center mb-8 py-8 gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Choose Your Subject</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Master fundamentals step by step</p>
          </div>
          
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-md">
            {(['all', 'unlocked', 'completed'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-5 py-3 rounded-md font-medium transition-all duration-200 ${
                  filter === filterType
                    ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {filterType === 'all' ? 'Mathematics' : 
                 filterType === 'unlocked' ? 'Physics' : 'Chemistry'}
              </button>
            ))}
          </div>
        </section>

        {/* Breadcrumb - moved below header */}
        <div className="flex justify-center mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Chapters Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${
                  !chapter.isUnlocked ? 'opacity-60' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header with gradient background */}
                <div className="bg-gradient-to-br from-blue-600 to-teal-600 dark:from-blue-700 dark:to-teal-700 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="relative z-10">
                    <div className="text-3xl mb-3">{chapter.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{chapter.title}</h3>
                    <p className="text-sm opacity-90">{chapter.description}</p>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold z-20">
                    {chapter.isCompleted ? '✓' : chapter.isUnlocked ? chapter.progress + '%' : <Lock className="w-4 h-4" />}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Stats */}
                  <div className="flex gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {chapter.studyTime}h
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      {chapter.quizzes} quizzes
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{chapter.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-teal-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${chapter.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Topics</div>
                    <div className="flex flex-wrap gap-2">
                      {chapter.topics.slice(0, 3).map((topic, i) => (
                        <span key={i} className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                          {topic}
                        </span>
                      ))}
                      {chapter.topics.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                          +{chapter.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {chapter.isUnlocked ? (
                      <>
                        <Link
                          to={`/chapters/${chapter.id}`}
                          className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          {chapter.progress > 0 ? 'Continue' : 'Start'}
                        </Link>
                        <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                          Preview
                        </button>
                      </>
                    ) : (
                      <button className="w-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed">
                        Complete Previous Chapters
                      </button>
                    )}
                  </div>
                </div>

                {/* Locked overlay */}
                {!chapter.isUnlocked && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <Lock className="w-12 h-12 text-gray-400 mb-4" />
                    <div className="text-center px-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Chapter Locked</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Complete previous chapters to unlock</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Chapters;