import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { OnboardingData, OnboardingQuestion } from '../types/onboarding';
import { supabase } from '../services/supabase';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({
    studiedChapters: [],
  });

  // Don't redirect - allow testing onboarding flow

  const questions: OnboardingQuestion[] = [
    {
      id: 'studentClass',
      title: 'Which class are you in?',
      subtitle: 'Essential for content targeting',
      type: 'single-select',
      options: [
        { value: 'class-11', label: 'Class 11' },
        { value: 'class-12', label: 'Class 12' },
        { value: 'drop-year', label: 'Drop Year / Repeater' },
        { value: 'exploring', label: 'Just Exploring' },
      ],
    },
    {
      id: 'board',
      title: 'Which board are you studying under?',
      subtitle: 'Helps align with NCERT or state variations',
      type: 'single-select',
      options: [
        { value: 'cbse', label: 'CBSE' },
        { value: 'state-board', label: 'State Board' },
        { value: 'icse', label: 'ICSE' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'physicsFeeling',
      title: 'How do you feel about Physics right now?',
      subtitle: 'Friendly tone + analytics insight',
      type: 'single-select',
      options: [
        { value: 'tough', label: 'I find it tough', emoji: '😕' },
        { value: 'basics', label: 'I understand basics', emoji: '😐' },
        { value: 'improving', label: "I'm improving", emoji: '🙂' },
        { value: 'love', label: 'I love Physics', emoji: '😎' },
      ],
    },
    {
      id: 'studiedChapters',
      title: 'Which chapters have you already studied?',
      subtitle: 'Multi-select, optional—can be used for progress tracking later',
      type: 'multi-select',
      options: [
        { value: 'force-pressure', label: 'Force and Pressure' },
        { value: 'friction', label: 'Friction' },
        { value: 'electric-current', label: 'Electric Current and Its Effects' },
        { value: 'motion', label: 'Motion' },
        { value: 'force-laws', label: 'Force and Laws of Motion' },
        { value: 'gravitation', label: 'Gravitation' },
        { value: 'light', label: 'Light: Reflection and Refraction' },
        { value: 'electricity', label: 'Electricity' },
        { value: 'magnetic-effects', label: 'Magnetic Effects of Electric Current' },
        { value: 'work-energy', label: 'Work and Energy' },
      ],
    },
    {
      id: 'studyGoal',
      title: "What's your current study goal?",
      subtitle: 'Academic focus, but foundation-oriented',
      type: 'single-select',
      options: [
        { value: 'build-basics', label: 'Build strong basics' },
        { value: 'revise', label: 'Revise chapters' },
        { value: 'practice', label: 'Practice questions' },
        { value: 'school-exams', label: 'Prepare for school exams' },
        { value: 'entrance-exams', label: 'Prepare for entrance exams' },
      ],
    },
    {
      id: 'heardAbout',
      title: 'Where did you hear about this app?',
      subtitle: 'Marketing analytics',
      type: 'single-select',
      options: [
        { value: 'youtube', label: 'YouTube' },
        { value: 'friend', label: 'Friend / Senior' },
        { value: 'coaching', label: 'Coaching Institute' },
        { value: 'google', label: 'Google' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'learningPreference',
      title: 'How do you prefer to learn?',
      subtitle: 'Optional, for future personalization',
      type: 'single-select',
      options: [
        { value: 'videos', label: 'Video explanations' },
        { value: 'notes', label: 'Concept notes' },
        { value: 'quizzes', label: 'Practice quizzes' },
        { value: 'doubts', label: 'Doubt-solving' },
        { value: 'mixed', label: 'Mixed approach' },
      ],
    },
  ];

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const handleAnswer = (value: string) => {
    if (currentQuestion.type === 'multi-select') {
      const currentValues = (answers.studiedChapters || []) as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setAnswers({ ...answers, studiedChapters: newValues });
    } else if (currentQuestion.type === 'boolean') {
      setAnswers({ ...answers, [currentQuestion.id]: value === 'true' });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save onboarding data to user profile
      console.log('Saving onboarding data:', answers);
      if (!user) {
        showToast('Please log in first', 'error');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
          student_class: answers.studentClass,
          board: answers.board,
          physics_feeling: answers.physicsFeeling,
          studied_chapters: answers.studiedChapters || [],
          study_goal: answers.studyGoal,
          heard_about: answers.heardAbout,
          learning_preference: answers.learningPreference,
          onboarding_completed: true,
        });
      
      console.log('Save result:', { data, error });

      if (error) throw error;
      
      showToast('Welcome to Physics! 🎉', 'success');
      // Redirect to dashboard after successful onboarding
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Onboarding save error:', error);
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'multi-select') {
      return true; // Multi-select is optional
    }
    return answer !== undefined && answer !== null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8 transition-colors duration-300">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of 7
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {Math.round(((currentStep + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {currentQuestion.title}
            </h1>
            {currentQuestion.subtitle && (
              <p className="text-gray-600 dark:text-gray-400">
                {currentQuestion.subtitle}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="mb-8 grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected = currentQuestion.type === 'multi-select'
                ? (answers.studiedChapters || []).includes(option.value)
                : answers[currentQuestion.id] === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 text-left border-2 rounded-lg font-medium transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.emoji && <span className="text-xl">{option.emoji}</span>}
                    <span>{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            {isLastStep ? (
              <button
                onClick={handleComplete}
                disabled={!isAnswered() || loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isAnswered()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Skip Option */}
        {(currentQuestion.id === 'studiedChapters' || currentQuestion.id === 'learningPreference') && (
          <div className="mt-4 text-center">
            <button
              onClick={handleNext}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Skip this question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
