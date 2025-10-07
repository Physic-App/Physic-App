import React, { useState, useRef } from 'react';
import { Navigation } from './Navigation';
import { ReflectionSimulator } from './ReflectionSimulator';
import { RefractionSimulator } from './RefractionSimulator';
import { LensSimulator } from './LensSimulator';
import { TIRSimulator } from './TIRSimulator';
import { PrismSimulator } from './PrismSimulator';
import { DiffractionSimulator } from './DiffractionSimulator';
import { PolarizationSimulator } from './PolarizationSimulator';
import { KeyboardShortcuts } from './ui/KeyboardShortcuts';
import { ErrorBoundary } from './ErrorBoundary';
import { TutorialSystem, defaultTutorials } from './TutorialSystem';
import { HelpSystem } from './HelpSystem';
import { InteractiveExperiments } from './InteractiveExperiments';
import { AdvancedVisualizations, defaultVisualizationConfig } from './AdvancedVisualizations';
import { DataAnalysis } from './DataAnalysis';
import { AccessibilityFeatures, defaultAccessibilityConfig } from './AccessibilityFeatures';
import { useDataCollection } from '../../../utils/dataCollection';

export type SimulatorType = 'reflection' | 'refraction' | 'lens' | 'tir' | 'prism' | 'diffraction' | 'polarization';

interface LightSimulatorMainProps {
  onBack?: () => void;
}

const LightSimulatorMain: React.FC<LightSimulatorMainProps> = ({ onBack }) => {
  const [activeSimulator, setActiveSimulator] = useState<SimulatorType>('reflection');
  const [showTutorials, setShowTutorials] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showExperiments, setShowExperiments] = useState(false);
  const [showDataAnalysis, setShowDataAnalysis] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [visualizationConfig, setVisualizationConfig] = useState(defaultVisualizationConfig);
  const [accessibilityConfig, setAccessibilityConfig] = useState(defaultAccessibilityConfig);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Data collection hook
  const { dataPoints } = useDataCollection();

  const renderSimulator = () => {
    switch (activeSimulator) {
      case 'reflection':
        return <ReflectionSimulator />;
      case 'refraction':
        return <RefractionSimulator />;
      case 'lens':
        return <LensSimulator />;
      case 'tir':
        return <TIRSimulator />;
      case 'prism':
        return <PrismSimulator />;
      case 'diffraction':
        return <DiffractionSimulator />;
      case 'polarization':
        return <PolarizationSimulator />;
      default:
        return <ReflectionSimulator />;
    }
  };

  // Keyboard shortcuts for navigation
  const shortcuts = [
    { key: '1', description: 'Switch to Reflection', action: () => setActiveSimulator('reflection') },
    { key: '2', description: 'Switch to Refraction', action: () => setActiveSimulator('refraction') },
    { key: '3', description: 'Switch to Lenses', action: () => setActiveSimulator('lens') },
    { key: '4', description: 'Switch to TIR', action: () => setActiveSimulator('tir') },
    { key: '5', description: 'Switch to Prisms', action: () => setActiveSimulator('prism') },
    { key: '6', description: 'Switch to Diffraction', action: () => setActiveSimulator('diffraction') },
    { key: '7', description: 'Switch to Polarization', action: () => setActiveSimulator('polarization') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-300 flex items-center gap-2"
          >
            ← Back to Simulators
          </button>
        )}

        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Light: Reflection & Refraction Simulator
          </h1>
          <p className="text-blue-200 text-xl mb-6">
            Interactive Physics Demonstrations for Class 10-12
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <button
              onClick={() => setShowTutorials(true)}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-200 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Interactive Tutorials
            </button>
            
            <button
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-200 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help & Documentation
            </button>
            
            <button
              onClick={() => setShowExperiments(true)}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-purple-200 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Experiments & Challenges
            </button>
            
            <button
              onClick={() => setShowDataAnalysis(true)}
              className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 rounded-lg text-orange-200 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Data Analysis
            </button>
            
            <button
              onClick={() => setShowAccessibility(true)}
              className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-lg text-indigo-200 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Accessibility
            </button>
          </div>
        </header>

        <Navigation 
          activeSimulator={activeSimulator} 
          setActiveSimulator={setActiveSimulator} 
        />

        <div className="mt-8">
          <ErrorBoundary>
            {renderSimulator()}
          </ErrorBoundary>
        </div>

        <footer className="text-center mt-16 text-blue-200 border-t border-white/10 pt-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg mb-4 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              🌟 Explore, experiment, and discover the fascinating world of optics! 🌟
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-blue-300">
              <span className="flex items-center gap-2">
                <kbd className="bg-gray-700/50 px-2 py-1 rounded-md text-xs">Ctrl</kbd> + 
                <kbd className="bg-gray-700/50 px-2 py-1 rounded-md text-xs">?</kbd> 
                for shortcuts
              </span>
              <span>•</span>
              <span>Press <kbd className="bg-gray-700/50 px-2 py-1 rounded-md text-xs">1-7</kbd> to switch simulators</span>
              <span>•</span>
              <span>Professional Physics Education Tool</span>
            </div>
          </div>
        </footer>
      </div>
      
      <KeyboardShortcuts shortcuts={shortcuts} />
      
      {/* Advanced Features */}
      {showTutorials && (
        <TutorialSystem
          tutorials={defaultTutorials}
          onClose={() => setShowTutorials(false)}
          onComplete={(tutorialId) => {
            console.log(`Tutorial completed: ${tutorialId}`);
            setShowTutorials(false);
          }}
        />
      )}
      
      {showHelp && (
        <HelpSystem
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      )}
      
      {showExperiments && (
        <InteractiveExperiments
          isOpen={showExperiments}
          onClose={() => setShowExperiments(false)}
          onStartExperiment={(experiment) => {
            console.log(`Starting experiment: ${experiment.title}`);
            setShowExperiments(false);
          }}
          currentSimulator={activeSimulator}
        />
      )}
      
      <AdvancedVisualizations
        config={visualizationConfig}
        onConfigChange={setVisualizationConfig}
        canvasRef={canvasRef}
        simulationType={activeSimulator}
      />
      
      {showDataAnalysis && (
        <DataAnalysis
          isOpen={showDataAnalysis}
          onClose={() => setShowDataAnalysis(false)}
          dataPoints={dataPoints}
          currentSimulator={activeSimulator}
        />
      )}
      
      {showAccessibility && (
        <AccessibilityFeatures
          isOpen={showAccessibility}
          onClose={() => setShowAccessibility(false)}
          config={accessibilityConfig}
          onConfigChange={setAccessibilityConfig}
        />
      )}
    </div>
  );
};

export default LightSimulatorMain;
