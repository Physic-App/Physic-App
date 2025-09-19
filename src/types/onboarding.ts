export interface OnboardingData {
  studentClass: 'class-11' | 'class-12' | 'drop-year' | 'exploring';
  board: 'cbse' | 'state-board' | 'icse' | 'other';
  physicsFeeling: 'tough' | 'basics' | 'improving' | 'love';
  studiedChapters: string[]; // Array of chapter names
  studyGoal: 'build-basics' | 'revise' | 'practice' | 'school-exams' | 'entrance-exams';
  heardAbout: 'youtube' | 'friend' | 'coaching' | 'google' | 'instagram' | 'other';
  learningPreference: 'videos' | 'notes' | 'quizzes' | 'doubts' | 'mixed';
}

export interface OnboardingQuestion {
  id: keyof OnboardingData;
  title: string;
  subtitle?: string;
  type: 'single-select' | 'multi-select' | 'boolean';
  options: Array<{
    value: string;
    label: string;
    emoji?: string;
  }>;
}
