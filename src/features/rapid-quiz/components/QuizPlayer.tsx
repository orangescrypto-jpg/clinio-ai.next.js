'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuizStore } from '@/stores/useQuizStore';

interface Props {
  onComplete: () => void;
  onExit: () => void;
}

export const QuizPlayer: React.FC<Props> = ({ onComplete, onExit }) => {
  const { session, currentQuestion, currentIndex, showFeedback, answerQuestion, nextQuestion } = useQuizStore();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);

  // Reset state when question changes
  useEffect(() => {
    setSelectedChoice(null);
    setTimer(currentQuestion?.timeLimit || 60);
  }, [currentIndex, currentQuestion]);

  // Timer countdown — auto-submit on timeout
  const handleAnswer = useCallback((choiceId: string) => {
    if (showFeedback) return;
    setSelectedChoice(choiceId);
    answerQuestion(choiceId);
  }, [showFeedback, answerQuestion]);

  useEffect(() => {
    if (showFeedback) return;
    if (timer <= 0) {
      handleAnswer(''); // Time's up — mark unanswered
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, showFeedback, handleAnswer]);

  const handleNext = () => {
    const total = session?.questions.length || 0;
    if (currentIndex + 1 >= total) {
      onComplete();
    } else {
      nextQuestion();
    }
  };

  if (!session || !currentQuestion) {
    return (
      <div className="text-center py-16 max-w-lg mx-auto">
        <p className="text-5xl mb-4">📭</p>
        <p className="text-gray-600 font-medium mb-2">No questions available</p>
        <p className="text-gray-400 text-sm mb-6">Please go back and try a different topic.</p>
        <button onClick={onExit} className="btn-primary">← Back to Setup</button>
      </div>
    );
  }

  const question = currentQuestion.question;
  const total = session.questions.length;
  const currentAnswer = session.answers[currentIndex];
  const isCorrect = currentAnswer?.isCorrect;
  const progress = Math.round(((currentIndex + 1) / total) * 100);
  const timerPct = (timer / (currentQuestion.timeLimit || 60)) * 100;
  const timerColor = timer <= 10 ? 'bg-red-500' : timer <= 20 ? 'bg-yellow-400' : 'bg-primary-500';

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          aria-label="Exit quiz"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          ✕ Exit
        </button>
        <span className="text-sm font-semibold text-gray-600">
          {currentIndex + 1} <span className="text-gray-300">/</span> {total}
        </span>
        <span
          className={`text-sm font-bold tabular-nums ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}
          aria-live="polite"
          aria-label={`${timer} seconds remaining`}
        >
          ⏱ {timer}s
        </span>
      </div>

      {/* Progress bars */}
      <div className="space-y-1">
        {/* Quiz progress */}
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Timer progress */}
        <div className="w-full bg-gray-100 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
          {question.topicId.replace(/-/g, ' ')}
        </p>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
          {question.stem}
        </h3>

        {/* Choices */}
        <div className="space-y-2" role="radiogroup" aria-label="Answer choices">
          {question.choices.map(choice => {
            let cls = 'w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ';

            if (showFeedback) {
              if (choice.id === question.correctAnswerId) {
                cls += 'border-green-500 bg-green-50 text-green-900';
              } else if (choice.id === selectedChoice && !isCorrect) {
                cls += 'border-red-400 bg-red-50 text-red-900';
              } else {
                cls += 'border-gray-100 text-gray-400 cursor-default';
              }
            } else if (choice.id === selectedChoice) {
              cls += 'border-primary-500 bg-primary-50 text-gray-900';
            } else {
              cls += 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 text-gray-800 cursor-pointer';
            }

            return (
              <button
                key={choice.id}
                onClick={() => handleAnswer(choice.id)}
                disabled={showFeedback}
                aria-pressed={selectedChoice === choice.id}
                className={cls}
              >
                <span className="font-bold mr-2 text-gray-400">{choice.id.toUpperCase()}.</span>
                {choice.text}
                {showFeedback && choice.id === question.correctAnswerId && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
                {showFeedback && choice.id === selectedChoice && !isCorrect && (
                  <span className="ml-2 text-red-500">✗</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`card border-2 ${isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
          <p className={`font-bold mb-2 text-base ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect ? '✅ Correct!' : selectedChoice === '' ? '⏰ Time\'s Up!' : '❌ Incorrect'}
          </p>
          {question.explanation ? (
            <p className="text-sm text-gray-700 leading-relaxed">{question.explanation}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No explanation provided for this question.</p>
          )}
          <button onClick={handleNext} className="btn-primary w-full mt-4">
            {currentIndex + 1 >= total ? '🏁 View Results' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  );
};
