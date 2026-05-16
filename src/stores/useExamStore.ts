import { create } from 'zustand';
import type { ExamConfig, ExamQuestion, ExamAnswer, ExamSession } from '@/types';

interface ExamState {
  session: ExamSession | null;
  config: ExamConfig | null;
  currentQuestion: ExamQuestion | null;
  currentIndex: number;
  timeRemaining: number;
  isSubmitted: boolean;
  isComplete: boolean;
  timerInterval: ReturnType<typeof setInterval> | null;

  startExam: (questions: ExamQuestion[], config: ExamConfig) => void;
  answerQuestion: (choiceId: string) => void;
  toggleFlag: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  jumpToQuestion: (index: number) => void;
  submitExam: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  session: null,
  config: null,
  currentQuestion: null,
  currentIndex: 0,
  timeRemaining: 0,
  isSubmitted: false,
  isComplete: false,
  timerInterval: null,

  startExam: (questions, config) => {
    const answers: ExamAnswer[] = questions.map((q) => ({
      questionId: q.id,
      selectedChoiceId: null,
      isFlagged: false,
    }));

    const session: ExamSession = {
      id: 'exam_' + Date.now(),
      config,
      questions,
      answers,
      currentIndex: 0,
      timeRemainingSeconds: config.timeLimitMinutes * 60,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
    };

    set({
      session,
      config,
      currentQuestion: questions[0],
      currentIndex: 0,
      timeRemaining: config.timeLimitMinutes * 60,
      isSubmitted: false,
      isComplete: false,
    });

    const timer = setInterval(() => {
      const state = get();
      if (state.timeRemaining <= 1) {
        clearInterval(timer);
        state.submitExam();
      } else {
        set({ timeRemaining: state.timeRemaining - 1 });
      }
    }, 1000);

    set({ timerInterval: timer });
  },

  answerQuestion: (choiceId) => {
    const { session, currentIndex } = get();
    if (!session) return;

    const answers = [...session.answers];
    answers[currentIndex] = {
      ...answers[currentIndex],
      selectedChoiceId: choiceId,
    };

    set({ session: { ...session, answers } });
  },

  toggleFlag: () => {
    const { session, currentIndex } = get();
    if (!session) return;

    const answers = [...session.answers];
    answers[currentIndex] = {
      ...answers[currentIndex],
      isFlagged: !answers[currentIndex].isFlagged,
    };

    set({ session: { ...session, answers } });
  },

  nextQuestion: () => {
    const { session, currentIndex } = get();
    if (!session) return;
    const next = currentIndex + 1;
    if (next < session.questions.length) {
      set({
        currentQuestion: session.questions[next],
        currentIndex: next,
        session: { ...session, currentIndex: next },
      });
    }
  },

  previousQuestion: () => {
    const { session, currentIndex } = get();
    if (!session) return;
    const prev = currentIndex - 1;
    if (prev >= 0) {
      set({
        currentQuestion: session.questions[prev],
        currentIndex: prev,
        session: { ...session, currentIndex: prev },
      });
    }
  },

  jumpToQuestion: (index) => {
    const { session } = get();
    if (!session || index < 0 || index >= session.questions.length) return;
    set({
      currentQuestion: session.questions[index],
      currentIndex: index,
      session: { ...session, currentIndex: index },
    });
  },

  submitExam: () => {
    const { timerInterval, session } = get();
    if (timerInterval) clearInterval(timerInterval);
    const now = new Date().toISOString();
    set({
      isSubmitted: true,
      isComplete: true,
      timerInterval: null,
      session: session ? { ...session, status: 'submitted', submittedAt: now } : null,
    });
  },

  resetExam: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({
      session: null,
      config: null,
      currentQuestion: null,
      currentIndex: 0,
      timeRemaining: 0,
      isSubmitted: false,
      isComplete: false,
      timerInterval: null,
    });
  },
}));
