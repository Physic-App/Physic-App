import React from 'react';
import { CheckCircle, Circle, ArrowRight, BookOpen } from 'lucide-react';
import { ExperimentStep, ThemeMode } from './hooks/useCircuitState';

interface ExperimentGuideProps {
  currentStep: number;
  steps: ExperimentStep[];
  onNextStep: () => void;
  themeMode: ThemeMode;
}

export const ExperimentGuide: React.FC<ExperimentGuideProps> = ({
  currentStep,
  steps,
  onNextStep,
  themeMode
}) => {
  const currentStepData = steps[currentStep];

  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 ${
      themeMode === 'dark' ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-purple-200'
    }`}>
      <div className={`p-5 border-b transition-colors duration-300 ${
        themeMode === 'dark' ? 'bg-gradient-to-r from-purple-800 to-pink-800 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Guided Experiment Mode</h3>
            <p className={`text-sm font-medium ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Step-by-step circuit building tutorial</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Progress</span>
            <span className={`text-sm font-medium ${
              themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>{currentStep + 1} of {steps.length}</span>
          </div>
          <div className={`w-full h-3 rounded-full ${
            themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className={`p-4 rounded-xl border-2 border-purple-300 ${
          themeMode === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <span className="text-white font-bold text-sm">{currentStep + 1}</span>
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-lg mb-2 ${
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{currentStepData.title}</h4>
              <p className={`text-sm mb-3 ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>{currentStepData.description}</p>
              <div className={`p-3 rounded-lg ${
                themeMode === 'dark' ? 'bg-gray-700' : 'bg-white'
              }`}>
                <p className={`text-sm font-medium ${
                  themeMode === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  <strong>Action:</strong> {currentStepData.action}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : themeMode === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {currentStep < steps.length - 1 && (
            <button
              onClick={onNextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Physics Tip */}
        <div className={`mt-4 p-3 rounded-lg border ${
          themeMode === 'dark' 
            ? 'bg-blue-900/20 border-blue-700 text-blue-300' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <h5 className="font-semibold text-sm mb-1">🔬 Physics Insight</h5>
          <p className="text-sm">
            {currentStep === 0 && "Batteries provide electromotive force (EMF) that drives electrons through the circuit."}
            {currentStep === 1 && "Light bulbs convert electrical energy to light and heat. Brightness depends on power (P = VI)."}
            {currentStep === 2 && "Wires provide a low-resistance path for current flow, completing the circuit."}
            {currentStep === 3 && "Switches control current flow by opening or closing the circuit path."}
            {currentStep === 4 && "When the circuit is complete, current flows from positive to negative terminal."}
            {currentStep === 5 && "Observe how Ohm's Law (V = IR) governs the relationship between voltage, current, and resistance."}
          </p>
        </div>
      </div>
    </div>
  );
};
