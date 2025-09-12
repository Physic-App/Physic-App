export interface User {
  id: string;
  name: string;
  email: string;
  streak: number;
  completedChapters: number;
  totalChapters: number;
  studyTime: number;
  averageScore: number;
  achievements: number;
  lastTopic: {
    chapter: string;
    topic: string;
    progress: number;
  };
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  topics: string[];
  studyTime: number;
  quizzes: number;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizState {
  currentQuestion: number;
  score: number;
  answers: number[];
  isCompleted: boolean;
}

export interface TopicData {
  id: number;
  title: string;
  chapter: string;
  description: string;
  progress: number;
  lessonContent: string;
  questions: Question[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}