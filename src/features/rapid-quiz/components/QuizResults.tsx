'use client';

import React, { useState } from 'react';
import { useQuizStore } from '@/stores/useQuizStore';

interface Props {
  onRetry: () => void;
  onHome: () => void;
}

export const QuizResults: React.FC<Props> = ({ onRetry, onHome }) => {
  const { session, score } = useQuizStore();
  const [showReview, setShowReview] = useState(false);

  if (!session) return null;

  const total = session.questions.length;
  const correct = score.correct;
  const incorrect = total - correct;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'Excellent!', color: 'text-green-600', ringColor: 'border-green-400', bg: 'bg-green-50', icon: '🌟' };
    if (pct >= 75) return { label: 'Great Job!', color: 'text-blue-600', ringColor: 'border-blue-400', bg: 'bg-blue-50', icon: '👏' };
    if (pct >= 60) return { label: 'Good Effort', color: 'text-yellow-600', ringColor: 'border-yellow-400', bg: 'bg-yellow-50', icon: '💪' };
    return { label: 'Keep Practicing', color: 'text-red-600', ringColor: 'border-red-400', bg: 'bg-red-50', icon: '📚' };
  };

  const grade = getGrade(percentage);

  const startTime = new Date(session.startedAt).getTime();
  const endTime = session.completedAt ? new Date(session.completedAt).getTime() : Date.now();
  const timeSpentSec = Math.max(0, Math.floor((endTime - startTime) / 1000));
  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-12">
      {/* Score */}
      <div className="text-center pt-4">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${grade.ringColor} ${grade.bg} mb-4`}>
          <div>
            <p className={`text-3xl font-extrabold ${grade.color}`}>{percentage}%</p>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{correct}/{total}</p>
          </div>
        </div>
        <p className={`text-xl font-bold ${grade.color}`}>{grade.icon} {grade.label}</p>
      </div>

      {/* Stats */}
      <div className="card space-y-0 p-0 overflow-hidden">
        <h3 className="font-bold text-gray-900 px-6 pt-5 pb-3 border-b border-gray-50">Quiz Summary</h3>
        {[
          { label: 'Total Questions', value: total, color: 'text-gray-700' },
          { label: '✅ Correct', value: correct, color: 'text-green-600' },
          { label: '❌ Incorrect', value: incorrect, color: 'text-red-600' },
          { label: '⏱ Time Spent', value: formatTime(timeSpentSec), color: 'text-gray-700' },
          { label: 'Accuracy', value: `${percentage}%`, color: grade.color, bold: true },
        ].map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between items-center px-6 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className={`text-sm font-semibold ${row.color} ${row.bold ? 'text-base' : ''}`}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={onRetry} className="btn-primary w-full">⚡ Try Another Quiz</button>
        <button
          onClick={() => setShowReview(r => !r)}
          className="btn-secondary w-full"
        >
          {showReview ? 'Hide' : '📋 Review'} Answers
        </button>
        <button onClick={onHome} className="btn-secondary w-full">← Back to Setup</button>
      </div>

      {/* Answer Review */}
      {showReview && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Answer Review</h3>
          {session.questions.map((q, i) => {
            const answer = session.answers[i];
            const isCorrect = answer?.isCorrect;
            const timedOut = answer?.selectedChoiceId === '';
            const userChoice = q.question.choices.find(c => c.id === answer?.selectedChoiceId);
            const correctChoice = q.question.choices.find(c => c.id === q.question.correctAnswerId);

            return (
              <div
                key={q.question.id}
                className={`bg-white rounded-xl border-l-4 border border-gray-100 p-5 ${isCorrect ? 'border-l-green-500' : 'border-l-red-400'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">Question {i + 1}</span>
                  <span className={`text-xs font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✅ Correct' : timedOut ? '⏰ Timed Out' : '❌ Incorrect'}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-3 leading-relaxed">{q.question.stem}</p>
                <div className="text-sm space-y-1 mb-3">
                  <p>
                    <span className="text-gray-400">Your answer: </span>
                    <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                      {timedOut ? 'Not answered (timed out)' : userChoice?.text || 'Not answered'}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p>
                      <span className="text-gray-400">Correct answer: </span>
                      <span className="text-green-700 font-medium">{correctChoice?.text || 'N/A'}</span>
                    </p>
                  )}
                </div>
                {q.question.explanation ? (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 font-medium mb-1">Explanation</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{q.question.explanation}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
