import React from 'react';

interface ConceptualIntroProps {
  title: string;
  description: string;
  keyPoints: string[];
  className?: string;
}

const ConceptualIntro: React.FC<ConceptualIntroProps> = ({ 
  title, 
  description, 
  keyPoints, 
  className = '' 
}) => {
  return (
    <div className={`conceptual-intro bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 my-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            {title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {description}
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
              Key Concepts:
            </h4>
            <ul className="space-y-1">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptualIntro;
