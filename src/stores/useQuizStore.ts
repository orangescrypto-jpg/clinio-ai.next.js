import { create } from 'zustand';
import type { QuizConfig, QuizQuestion, QuizAnswer, QuizSession } from '@/types';

interface QuizState {
  session: QuizSession | null;
  config: QuizConfig | null;
  currentQuestion: QuizQuestion | null;
  currentIndex: number;
  showFeedback: boolean;
  isComplete: boolean;
  score: { correct: number; total: number };

  startQuiz: (questions: QuizQuestion[], config: QuizConfig) => void;
  answerQuestion: (choiceId: string) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  session: null,
  config: null,
  currentQuestion: null,
  currentIndex: 0,
  showFeedback: false,
  isComplete: false,
  score: { correct: 0, total: 0 },

  startQuiz: (questions, config) => {
    const session: QuizSession = {
      id: 'quiz_' + Date.now(),
      config,
      questions,
      answers: [],
      currentIndex: 0,
      status: 'active',
      startedAt: new Date().toISOString(),
    };
    set({
      session,
      config,
      currentQuestion: questions[0],
      currentIndex: 0,
      showFeedback: false,
      isComplete: false,
      score: { correct: 0, total: 0 },
    });
  },

  answerQuestion: (choiceId) => {
    const { session, currentQuestion, currentIndex, score } = get();
    if (!session || !currentQuestion) return;

    const isCorrect = choiceId === currentQuestion.question.correctAnswerId;

    const answer: QuizAnswer = {
      questionId: currentQuestion.question.id,
      selectedChoiceId: choiceId,
      isCorrect,
    };

    const answers = [...session.answers];
    answers[currentIndex] = answer;

    set({
      session: { ...session, answers },
      showFeedback: true,
      score: {
        correct: score.correct + (isCorrect ? 1 : 0),
        total: score.total + 1,
      },
    });
  },

  nextQuestion: () => {
    const { session, currentIndex } = get();
    if (!session) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= session.questions.length) {
      set({
        isComplete: true,
        session: {
          ...session,
          currentIndex: nextIndex,
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      });
    } else {
      set({
        currentQuestion: session.questions[nextIndex],
        currentIndex: nextIndex,
        showFeedback: false,
        session: { ...session, currentIndex: nextIndex },
      });
    }
  },

  resetQuiz: () => {
    set({
      session: null,
      config: null,
      currentQuestion: null,
      currentIndex: 0,
      showFeedback: false,
      isComplete: false,
      score: { correct: 0, total: 0 },
    });
  },
}));
