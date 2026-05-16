// ============================================
// SIMPLE ENTITIES
// ============================================

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  targetAudience: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Topic {
  id: string;
  subCategoryId: string;
  name: string;
  description: string;
  questionCount: number;
}

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  topicId: string;
  stem: string;
  choices: Choice[];
  correctAnswerId: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ============================================
// QUIZ TYPES
// ============================================

export interface QuizConfig {
  scope: 'topic' | 'subCategory' | 'category' | 'mixed';
  scopeId?: string;
  questionCount: number;
}

export interface QuizQuestion {
  question: Question;
  timeLimit: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedChoiceId: string | null;
  isCorrect: boolean | null;
}

export interface QuizSession {
  id: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  currentIndex: number;
  status: 'active' | 'completed';
  startedAt: string;
  completedAt?: string;
}

// ============================================
// EXAM TYPES
// ============================================

export interface ExamConfig {
  scope: 'topic' | 'subCategory' | 'category' | 'mixed';
  scopeId?: string;
  questionCount: number;
  timeLimitMinutes: number;
}

export interface ExamQuestion {
  id: string;
  topicId: string;
  stem: string;
  choices: Choice[];
  orderIndex: number;
}

export interface ExamAnswer {
  questionId: string;
  selectedChoiceId: string | null;
  isFlagged: boolean;
}

export interface ExamSession {
  id: string;
  config: ExamConfig;
  questions: ExamQuestion[];
  answers: ExamAnswer[];
  currentIndex: number;
  timeRemainingSeconds: number;
  status: 'in-progress' | 'submitted';
  startedAt: string;
  submittedAt?: string;
}

export interface ExamResult {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  questions: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  stem: string;
  userChoiceText: string;
  correctChoiceText: string;
  isCorrect: boolean;
  explanation: string;
  topicName: string;
}

// ============================================
// GUEST SESSION
// ============================================

export interface GuestSession {
  sessionId: string;
  topicsSeen: Record<string, string[]>;
}
