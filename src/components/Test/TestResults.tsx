import React, { useState } from 'react';
import { TestSession, TestResult } from '../../types/test';
import { CheckCircle, XCircle, Clock, Download, RotateCcw, BarChart3 } from 'lucide-react';

interface TestResultsProps {
  session: TestSession;
  onRetakeTest: () => void;
  onNewTest: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ session, onRetakeTest, onNewTest }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  const result: TestResult = {
    sessionId: session.id,
    score: session.score || 0,
    totalQuestions: session.totalQuestions,
    correctAnswers: session.correctAnswers || 0,
    wrongAnswers: session.wrongAnswers || 0,
    percentage: Math.round(((session.score || 0) / session.totalQuestions) * 100),
    timeTaken: session.endTime ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60) : 0,
    topic: session.configuration.topic,
    difficulty: session.configuration.difficulty,
    completedAt: session.endTime || new Date()
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return { message: "Excellent! Outstanding performance!", color: "text-green-600 dark:text-green-400" };
    if (percentage >= 80) return { message: "Great job! Well done!", color: "text-green-500 dark:text-green-400" };
    if (percentage >= 70) return { message: "Good work! Keep it up!", color: "text-blue-500 dark:text-blue-400" };
    if (percentage >= 60) return { message: "Not bad! Room for improvement.", color: "text-yellow-500 dark:text-yellow-400" };
    return { message: "Keep practicing! You'll get better!", color: "text-red-500 dark:text-red-400" };
  };

  const performance = getPerformanceMessage(result.percentage);

  const downloadQuestionPaper = (includeAnswers: boolean = false) => {
    // Create a simple text file for download
    let content = `Physics Test Paper\n`;
    content += `Topic: ${session.configuration.topic}\n`;
    content += `Difficulty: ${session.configuration.difficulty}\n`;
    content += `Questions: ${session.totalQuestions}\n`;
    const displayType = session.configuration.questionType === 'mcq' ? 'Quiz' : 
                       session.configuration.questionType === 'short-answer' ? 'Short Answer' : 
                       session.configuration.questionType.toUpperCase();
    content += `Type: ${displayType}\n\n`;

    session.questions.forEach((question, index) => {
      content += `Question ${index + 1}:\n`;
      content += `${question.question.replace(/<[^>]*>/g, '')}\n\n`;

      if (question.questionType === 'mcq') {
        const mcqQuestion = question as any;
        mcqQuestion.options.forEach((option: string, optIndex: number) => {
          content += `${String.fromCharCode(65 + optIndex)}) ${option}\n`;
        });
      }

      if (includeAnswers) {
        content += `\nAnswer: `;
        if (question.questionType === 'mcq') {
          const mcqQuestion = question as any;
          content += `${String.fromCharCode(65 + mcqQuestion.correctAnswer)}) ${mcqQuestion.options[mcqQuestion.correctAnswer]}\n`;
        } else {
          const quizQuestion = question as any;
          content += `${quizQuestion.correctAnswer}\n`;
        }
      }
      content += `\n${'='.repeat(50)}\n\n`;
    });

    const filename = includeAnswers 
      ? `physics-test-${session.configuration.topic}-with-answers.txt`
      : `physics-test-${session.configuration.topic}-questions.txt`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Test Completed!</h1>
        <p className={`text-xl ${performance.color}`}>{performance.message}</p>
      </div>

      {/* Score Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {result.percentage}%
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.correctAnswers}</div>
              <div className="text-gray-600 dark:text-gray-400">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.wrongAnswers}</div>
              <div className="text-gray-600 dark:text-gray-400">Wrong</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.totalQuestions}</div>
              <div className="text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{result.timeTaken}m</div>
              <div className="text-gray-600 dark:text-gray-400">Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Test Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Topic:</span>
            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{result.topic.replace('-', ' ')}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{result.difficulty}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Question Type:</span>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {session.configuration.questionType === 'mcq' ? 'Quiz' : session.configuration.questionType === 'short-answer' ? 'Short Answer' : session.configuration.questionType.toUpperCase()}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Completed:</span>
            <p className="font-medium text-gray-900 dark:text-gray-100">{result.completedAt.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Download Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Download Question Paper</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Questions Only</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadQuestionPaper(false)}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Text
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">With Answers</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadQuestionPaper(true)}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Text
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetakeTest}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Retake Same Test
        </button>
        <button
          onClick={onNewTest}
          className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          New Test
        </button>
      </div>
    </div>
  );
};

export default TestResults;
