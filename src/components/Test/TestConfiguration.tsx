import React, { useState } from 'react';
import { TestConfiguration as TestConfigType, QuestionType, DifficultyLevel, TimerOption } from '../../types/test';
import { Clock, Target, Settings } from 'lucide-react';

interface TestConfigurationProps {
  onStartTest: (config: TestConfigType) => void;
  isLoading: boolean;
  chapterTitle?: string;
}

const TestConfiguration: React.FC<TestConfigurationProps> = ({ onStartTest, isLoading, chapterTitle = 'Force and Pressure' }) => {
  const [config, setConfig] = useState<TestConfigType>({
    topic: chapterTitle,
    questionCount: 5,
    questionType: 'mcq',
    difficulty: 'easy',
    timer: '30min'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartTest(config);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Ready to Test Yourself
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Test your understanding of {chapterTitle} with AI-generated questions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Test Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Question Count */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Number of Questions</h2>
            </div>
            <div className="space-y-2">
              {[5, 10, 15].map((count) => (
                <label
                  key={count}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    config.questionCount === count
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="questionCount"
                    value={count}
                    checked={config.questionCount === count}
                    onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) as 5 | 10 | 15 })}
                    className="mr-3"
                  />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{count} Questions</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question Type */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Question Type</h2>
            </div>
            <div className="space-y-2">
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                config.questionType === 'mcq'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
              }`}>
                <input
                  type="radio"
                  name="questionType"
                  value="mcq"
                  checked={config.questionType === 'mcq'}
                  onChange={(e) => setConfig({ ...config, questionType: e.target.value as QuestionType })}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Quiz (Multiple Choice)</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose from 4 options</p>
                </div>
              </label>
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                config.questionType === 'short-answer'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
              }`}>
                <input
                  type="radio"
                  name="questionType"
                  value="short-answer"
                  checked={config.questionType === 'short-answer'}
                  onChange={(e) => setConfig({ ...config, questionType: e.target.value as QuestionType })}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Short Answer</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type your answer</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Difficulty and Timer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty Level */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Difficulty Level</h2>
            <div className="space-y-2">
              {[
                { value: 'easy', label: 'Easy', color: 'green' },
                { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
                { value: 'hard', label: 'Hard', color: 'red' }
              ].map((level) => (
                <label
                  key={level.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    config.difficulty === level.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={level.value}
                    checked={config.difficulty === level.value}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value as DifficultyLevel })}
                    className="mr-3"
                  />
                  <span className={`font-medium px-2 py-1 rounded text-sm ${
                    level.value === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                    level.value === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Time Limit</h2>
            </div>
            <div className="space-y-2">
              {[
                { value: '30min', label: '30 Minutes' },
                { value: '1hour', label: '1 Hour' },
                { value: '2hour', label: '2 Hours' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    config.timer === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="timer"
                    value={option.value}
                    checked={config.timer === option.value}
                    onChange={(e) => setConfig({ ...config, timer: e.target.value as TimerOption })}
                    className="mr-3"
                  />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Configuration Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Test Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Topic:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">{chapterTitle}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Questions:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">{config.questionCount}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">{config.questionType.toUpperCase()}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{config.difficulty}</p>
            </div>
          </div>
        </div>

        {/* Start Test Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg transition-colors ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Questions...
              </div>
            ) : (
              'Start Test'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestConfiguration;
