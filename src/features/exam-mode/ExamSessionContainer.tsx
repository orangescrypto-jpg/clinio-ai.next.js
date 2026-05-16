'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/stores/useExamStore';

export const ExamSessionContainer: React.FC = () => {
  const router = useRouter();
  const {
    session,
    currentQuestion,
    currentIndex,
    timeRemaining,
    answerQuestion,
    toggleFlag,
    nextQuestion,
    previousQuestion,
    jumpToQuestion,
    submitExam,
  } = useExamStore();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!session || !currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No exam in progress</p>
        <button onClick={() => router.push('/exam')} className="btn-primary mt-4">Back to Setup</button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = session.answers.filter(a => a.selectedChoiceId !== null).length;
  const unansweredCount = session.questions.length - answeredCount;
  const flaggedCount = session.answers.filter(a => a.isFlagged).length;

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setSubmitError(`You have ${unansweredCount} unanswered question(s). Please answer all questions before submitting.`);
      return;
    }
    setSubmitError('');
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    submitExam();
    router.push('/exam/results');
  };

  const allAnswered = unansweredCount === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-24">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-3 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <span className="text-sm font-medium text-gray-600">
          {currentIndex + 1}/{session.questions.length}
        </span>
        <span className={`text-base font-bold ${timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
          ⏱ {formatTime(timeRemaining)}
        </span>
        <button
          onClick={handleSubmitClick}
          className={`text-sm font-semibold text-white px-3 py-1.5 rounded-lg transition-colors ${
            allAnswered ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400'
          }`}
        >
          {allAnswered ? 'Submit' : `${session.questions.length - answeredCount} left`}
        </button>
      </div>

      {/* Unanswered Warning */}
      {submitError && (
        <div className="mx-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ⚠️ {submitError}
        </div>
      )}

      {/* Question */}
      <div className="card mx-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-400 font-medium">Question {currentIndex + 1} of {session.questions.length}</span>
          <button
            onClick={toggleFlag}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              session.answers[currentIndex]?.isFlagged
                ? 'border-yellow-400 bg-yellow-50 text-yellow-700 font-medium'
                : 'border-gray-200 text-gray-400 hover:border-yellow-300'
            }`}
          >
            🚩 {session.answers[currentIndex]?.isFlagged ? 'Flagged' : 'Flag'}
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">{currentQuestion.stem}</h3>

        <div className="space-y-2">
          {currentQuestion.choices.map(choice => {
            const isSelected = session.answers[currentIndex]?.selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => answerQuestion(choice.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold text-primary-600 mr-2">{choice.id.toUpperCase()}.</span>
                {choice.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between px-4">
        <button
          onClick={previousQuestion}
          disabled={currentIndex === 0}
          className="btn-secondary text-sm disabled:opacity-30"
        >
          ← Previous
        </button>
        <button
          onClick={() => setShowNavigator(true)}
          className="text-sm text-primary-600 font-medium hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg"
        >
          📋 Map
        </button>
        <button
          onClick={nextQuestion}
          disabled={currentIndex === session.questions.length - 1}
          className="btn-primary text-sm disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      {/* Stats Bar */}
      <div className="card mx-4">
        <div className="grid grid-cols-4 text-center text-sm">
          <div>
            <p className="text-green-600 font-bold text-lg">{answeredCount}</p>
            <p className="text-gray-500 text-xs">Answered</p>
          </div>
          <div>
            <p className={`font-bold text-lg ${unansweredCount > 0 ? 'text-red-500' : 'text-green-600'}`}>{unansweredCount}</p>
            <p className="text-gray-500 text-xs">Left</p>
          </div>
          <div>
            <p className="text-yellow-600 font-bold text-lg">{flaggedCount}</p>
            <p className="text-gray-500 text-xs">Flagged</p>
          </div>
          <div>
            <p className="text-gray-600 font-bold text-lg">{session.questions.length}</p>
            <p className="text-gray-500 text-xs">Total</p>
          </div>
        </div>
        <div className="mt-3 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${allAnswered ? 'bg-green-500' : 'bg-primary-500'}`}
            style={{ width: `${(answeredCount / session.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Fixed Mobile Submit Button */}
      <div className="fixed bottom-16 left-0 right-0 px-4 z-40 md:hidden">
        <button
          onClick={handleSubmitClick}
          disabled={!allAnswered}
          className={`w-full py-3 rounded-xl font-bold text-white text-base transition-all ${
            allAnswered
              ? 'bg-red-500 hover:bg-red-600 shadow-lg active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {allAnswered ? '✅ Submit Exam' : `Answer all questions to submit (${unansweredCount} left)`}
        </button>
      </div>

      {/* Desktop Submit Button */}
      <div className="hidden md:block text-center px-4">
        <button
          onClick={handleSubmitClick}
          disabled={!allAnswered}
          className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
            allAnswered
              ? 'bg-red-500 hover:bg-red-600 shadow-lg active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {allAnswered ? '✅ Submit Exam' : `Answer all questions to submit (${unansweredCount} left)`}
        </button>
      </div>

      {/* Question Navigator Modal */}
      {showNavigator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center" onClick={() => setShowNavigator(false)}>
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-lg max-h-[70vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">📋 Question Map</h3>
              <button onClick={() => setShowNavigator(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">Click any number to jump to that question</p>
            
            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-500 inline-block"></span> Answered</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block"></span> Unanswered</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-400 inline-block"></span> Flagged</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-100 border-2 border-primary-500 inline-block"></span> Current</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {session.questions.map((q, i) => {
                const answer = session.answers[i];
                let className = 'p-3 rounded-lg text-center text-sm font-medium border-2 transition-all cursor-pointer ';
                
                if (i === currentIndex) {
                  className += 'border-primary-500 bg-primary-100 ring-2 ring-primary-200 ';
                } else if (answer?.isFlagged) {
                  className += 'border-yellow-400 bg-yellow-50 ';
                } else if (answer?.selectedChoiceId) {
                  className += 'border-green-500 bg-green-50 ';
                } else {
                  className += 'border-gray-200 bg-white hover:border-gray-400 ';
                }
                
                return (
                  <button
                    key={q.id}
                    onClick={() => { jumpToQuestion(i); setShowNavigator(false); }}
                    className={className}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              {answeredCount} of {session.questions.length} answered
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center">
            <p className="text-4xl mb-4">✅</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Submit Exam?</h3>
            <p className="text-sm text-gray-600 mb-2">
              You have answered all {session.questions.length} questions.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Time remaining: {formatTime(timeRemaining)}
            </p>
            <div className="space-y-2">
              <button onClick={handleConfirmSubmit} className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-semibold transition-colors">
                Yes, Submit Exam
              </button>
              <button onClick={() => setShowSubmitModal(false)} className="w-full btn-secondary py-2.5">
                Continue Reviewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
