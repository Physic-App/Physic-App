import React, { useState, useEffect } from 'react';
import { Zap, Play, HelpCircle, Settings } from 'lucide-react';
import { TabNavigation } from './TabNavigation';
import { NewtonLawsSimulator } from './simulators/NewtonLawsSimulator';
import { FrictionSimulator } from './simulators/FrictionSimulator';
import { CollisionSimulator } from './simulators/CollisionSimulator';
import { GravitySimulator } from './simulators/GravitySimulator';
import { SettingsPanel } from './SettingsPanel';
import { HelpModal } from './HelpModal';
import { TutorialOverlay } from './TutorialOverlay';
import { ErrorBoundary } from './ErrorBoundary';
import { PerformanceMonitor } from './PerformanceMonitor';
import { NotificationProvider } from './NotificationSystem';
import { DebugPanel } from './DebugPanel';

type TabType = 'newton' | 'friction' | 'collision' | 'gravity';

const ForceSimulatorMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('newton');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    theme: 'dark',
    showGrid: true,
    showTrajectory: true,
    showVectors: true,
    simulationSpeed: 1.0,
    environment: 'earth' as 'earth' | 'moon' | 'mars' | 'space'
  });

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        setShowPerformanceMonitor(prev => !prev);
      }
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setShowDebugPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderActiveSimulator = () => {
    switch (activeTab) {
      case 'newton':
        return <NewtonLawsSimulator settings={globalSettings} />;
      case 'friction':
        return <FrictionSimulator settings={globalSettings} />;
      case 'collision':
        return <CollisionSimulator settings={globalSettings} />;
      case 'gravity':
        return <GravitySimulator settings={globalSettings} />;
      default:
        return <NewtonLawsSimulator settings={globalSettings} />;
    }
  };

  return (
    <NotificationProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          {/* Header */}
          <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Force & Law of Motion Simulator
                    </h1>
                    <p className="text-sm text-slate-300">Interactive Physics Learning Platform</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Tutorial
                  </button>
                  <button
                    onClick={() => setShowHelp(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
              {renderActiveSimulator()}
            </div>
          </main>

          {/* Modals */}
          {showSettings && (
            <SettingsPanel
              settings={globalSettings}
              onSettingsChange={setGlobalSettings}
              onClose={() => setShowSettings(false)}
            />
          )}

          {showHelp && (
            <HelpModal
              activeTab={activeTab}
              onClose={() => setShowHelp(false)}
            />
          )}

          {showTutorial && (
            <TutorialOverlay
              isActive={showTutorial}
              onComplete={() => setShowTutorial(false)}
              simulatorType={activeTab}
            />
          )}

          {/* Performance Monitor */}
          <PerformanceMonitor 
            isVisible={showPerformanceMonitor}
            onToggle={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
          />

          {/* Debug Panel */}
          <DebugPanel 
            isVisible={showDebugPanel}
            onToggle={() => setShowDebugPanel(!showDebugPanel)}
            simulationData={globalSettings}
          />
        </div>
      </ErrorBoundary>
    </NotificationProvider>
  );
};

export default ForceSimulatorMain;
