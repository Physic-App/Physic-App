import React, { useState, useEffect } from 'react';
import { Question, TestSession, MCQQuestion, QuizQuestion } from '../../types/test';
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface TestInterfaceProps {
  session: TestSession;
  onCompleteTest: (session: TestSession) => void;
  onExitTest: () => void;
}

const TestInterface: React.FC<TestInterfaceProps> = ({ session, onCompleteTest, onExitTest }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>(session.answers);
  const [timeLeft, setTimeLeft] = useState(() => {
    const timerMinutes = session.configuration.timer === '30min' ? 30 : 
                        session.configuration.timer === '1hour' ? 60 : 120;
    return timerMinutes * 60;
  });

  const currentQuestion = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    console.log('Submit button clicked');
    console.log('Current answers:', answers);
    console.log('Session:', session);
    
    const updatedSession: TestSession = {
      ...session,
      answers,
      endTime: new Date(),
      score: calculateScore(),
      totalQuestions: session.questions.length,
      correctAnswers: calculateCorrectAnswers(),
      wrongAnswers: calculateWrongAnswers()
    };
    
    console.log('Updated session:', updatedSession);
    onCompleteTest(updatedSession);
  };

  const calculateScore = () => {
    let correct = 0;
    session.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined) {
        if (question.questionType === 'mcq' || question.questionType === 'quiz') {
          const mcqQuestion = question as MCQQuestion;
          if (userAnswer === mcqQuestion.correctAnswer) {
            correct++;
          }
        } else {
          const quizQuestion = question as QuizQuestion;
          if (userAnswer.toString().toLowerCase().trim() === quizQuestion.correctAnswer.toLowerCase().trim()) {
            correct++;
          }
        }
      }
    });
    return correct;
  };

  const calculateCorrectAnswers = () => calculateScore();
  const calculateWrongAnswers = () => session.questions.length - calculateScore();

  const isQuestionAnswered = (questionId: string) => {
    const answer = answers[questionId];
    return answer !== undefined && answer !== '';
  };

  const renderMCQQuestion = (question: MCQQuestion) => (
    <div className="space-y-4">
      {question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleAnswerChange(question.id, index)}
          className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${
            answers[question.id] === index 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center">
            <span className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mr-3 text-sm font-medium">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1 text-left text-gray-900 dark:text-gray-100">{option}</span>
          </div>
        </button>
      ))}
    </div>
  );

  const renderQuizQuestion = (question: QuizQuestion) => (
    <div className="space-y-4">
      <textarea
        value={answers[question.id] || ''}
        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
        placeholder="Type your answer here..."
        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        rows={4}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onExitTest}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Exit Test
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-mono text-lg">
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {session.questions.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          {session.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white'
                  : isQuestionAnswered(session.questions[index].id)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Question {currentQuestionIndex + 1}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
          </div>
        </div>

        {currentQuestion.questionType === 'mcq' || currentQuestion.questionType === 'quiz'
          ? renderMCQQuestion(currentQuestion as MCQQuestion)
          : renderQuizQuestion(currentQuestion as QuizQuestion)}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={isFirstQuestion}
          className={`flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            isFirstQuestion ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex space-x-4">
          {isLastQuestion ? (
            <button
              onClick={handleSubmitTest}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Test
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Time Warning */}
      {timeLeft <= 300 && timeLeft > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">
              {timeLeft <= 60 ? 'Less than 1 minute left!' : '5 minutes remaining!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;
