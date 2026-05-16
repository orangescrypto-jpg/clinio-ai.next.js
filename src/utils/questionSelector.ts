import type { Question, GuestSession } from '@/types';
import { sessionManager } from './sessionManager';

export const questionSelector = {
  selectQuestions(
    allQuestions: Question[],
    session: GuestSession,
    scopeKey: string,
    count: number
  ): {
    selected: Question[];
    updatedSession: GuestSession;
    isNewCycle: boolean;
  } {
    const seenIds = sessionManager.getSeenQuestions(session, scopeKey);

    // Get unseen questions
    let available = allQuestions.filter((q) => !seenIds.includes(q.id));

    // If not enough, reset cycle
    let isNewCycle = false;
    if (available.length < count) {
      session = sessionManager.resetScope(session, scopeKey);
      available = allQuestions;
      isNewCycle = true;
    }

    // Shuffle and pick
    const shuffled = this.shuffle([...available]);
    const selected = shuffled.slice(0, count);

    // Mark as seen
    session = sessionManager.markQuestionsSeen(
      session,
      scopeKey,
      selected.map((q) => q.id)
    );

    return { selected, updatedSession: session, isNewCycle };
  },

  shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
};
