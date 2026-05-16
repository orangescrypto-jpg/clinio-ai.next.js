export type {
  Category,
  SubCategory,
  Topic,
  Choice,
  Question,
  QuizConfig,
  QuizQuestion,
  QuizAnswer,
  QuizSession,
  ExamConfig,
  ExamQuestion,
  ExamAnswer,
  ExamSession,
  ExamResult,
  QuestionResult,
  GuestSession,
} from './entities';

export interface ContentPost {
  id: string;
  title: string;
  content: string;
  topic: string;
  youtubeUrl?: string;
  author: string;
  readTime: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  specialty: string;
  totalSteps: number;
}

export interface ScenarioStep {
  stepId: string;
  stepNumber: number;
  situation: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  feedback: string;
}
