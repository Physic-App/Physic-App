export interface PhysicsTopic {
  id: string;
  name: string;
  description: string;
}

export type QuestionType = 'mcq' | 'quiz' | 'short-answer';
export type DifficultyLevel = 'easy' | 'intermediate' | 'hard';
export type TimerOption = '30min' | '1hour' | '2hour';

export interface TestConfiguration {
  topic: string;
  questionCount: 5 | 10 | 15;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  timer: TimerOption;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty: DifficultyLevel;
  questionType: 'mcq' | 'quiz';
}

export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionType: 'short-answer';
}

export type Question = MCQQuestion | QuizQuestion;

export interface TestSession {
  id: string;
  configuration: TestConfiguration;
  questions: Question[];
  answers: Record<string, string | number>;
  startTime: Date;
  endTime?: Date;
  score?: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface TestResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  timeTaken: number;
  topic: string;
  difficulty: DifficultyLevel;
  completedAt: Date;
}

export interface TestHistory {
  id: string;
  results: TestResult[];
  totalTests: number;
  averageScore: number;
  bestScore: number;
  topicsAttempted: string[];
}
