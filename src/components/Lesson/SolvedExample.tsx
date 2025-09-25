import React, { useState } from 'react';

interface SolvedExampleProps {
  problem: string;
  solution: string;
  steps: string[];
  answer: string;
  units?: string;
  className?: string;
}

const SolvedExample: React.FC<SolvedExampleProps> = ({ 
  problem, 
  solution, 
  steps, 
  answer, 
  units = '',
  className = '' 
}) => {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className={`solved-example bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 my-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Solved Example
            </h3>
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Problem:</h4>
              <p className="text-gray-700 dark:text-gray-300">{problem}</p>
            </div>

            {showSolution && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Solution Steps:</h4>
                  <ol className="space-y-2">
                    {steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3 text-gray-700 dark:text-gray-300">
                        <span className="w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Solution:</h4>
                  <p className="text-gray-700 dark:text-gray-300 font-mono text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    {solution}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/30 dark:to-emerald-800/30 rounded-lg p-4 border border-green-300 dark:border-green-600">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Answer:</h4>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {answer} {units && <span className="text-lg font-normal text-gray-600 dark:text-gray-400">{units}</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolvedExample;
