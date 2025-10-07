import React, { useState } from 'react';

interface InfoPanelProps {
  title: string;
  content: {
    definition: string;
    formula?: string;
    explanation: string;
    applications: string[];
    examples: string[];
  };
  className?: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ 
  title, 
  content, 
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gray-800/50 rounded-lg border border-gray-600 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {title}
        </h3>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Definition */}
          <div>
            <h4 className="text-blue-300 font-semibold mb-2">Definition</h4>
            <p className="text-gray-200 text-sm">{content.definition}</p>
          </div>

          {/* Formula */}
          {content.formula && (
            <div>
              <h4 className="text-green-300 font-semibold mb-2">Formula</h4>
              <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
                <code className="text-green-200 font-mono text-sm">{content.formula}</code>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <h4 className="text-yellow-300 font-semibold mb-2">Explanation</h4>
            <p className="text-gray-200 text-sm">{content.explanation}</p>
          </div>

          {/* Applications */}
          <div>
            <h4 className="text-purple-300 font-semibold mb-2">Real-World Applications</h4>
            <ul className="space-y-1">
              {content.applications.map((app, index) => (
                <li key={index} className="text-gray-200 text-sm flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  {app}
                </li>
              ))}
            </ul>
          </div>

          {/* Examples */}
          <div>
            <h4 className="text-orange-300 font-semibold mb-2">Examples</h4>
            <ul className="space-y-1">
              {content.examples.map((example, index) => (
                <li key={index} className="text-gray-200 text-sm flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  {example}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
