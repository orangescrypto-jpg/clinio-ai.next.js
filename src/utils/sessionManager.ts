import type { GuestSession } from '@/types';

const STORAGE_KEY = 'clinio_session';

export const sessionManager = {
  getSession(): GuestSession {
    if (typeof window === 'undefined') return this.createSession();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as GuestSession;
    }
    return this.createSession();
  },

  createSession(): GuestSession {
    const session: GuestSession = {
      sessionId: 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      topicsSeen: {},
    };
    this.saveSession(session);
    return session;
  },

  saveSession(session: GuestSession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  getSeenQuestions(session: GuestSession, scopeKey: string): string[] {
    return session.topicsSeen[scopeKey] || [];
  },

  markQuestionsSeen(
    session: GuestSession,
    scopeKey: string,
    questionIds: string[]
  ): GuestSession {
    if (!session.topicsSeen[scopeKey]) {
      session.topicsSeen[scopeKey] = [];
    }
    const newIds = questionIds.filter(
      (id) => !session.topicsSeen[scopeKey].includes(id)
    );
    session.topicsSeen[scopeKey].push(...newIds);
    this.saveSession(session);
    return session;
  },

  resetScope(session: GuestSession, scopeKey: string): GuestSession {
    session.topicsSeen[scopeKey] = [];
    this.saveSession(session);
    return session;
  },

  buildScopeKey(scope: string, scopeId?: string): string {
    if (scope === 'mixed') return 'mixed:all';
    return `${scope}:${scopeId || 'all'}`;
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
