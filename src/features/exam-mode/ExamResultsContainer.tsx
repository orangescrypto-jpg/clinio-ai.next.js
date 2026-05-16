'use client';

import { COLLECTIONS } from '@/lib/firebase';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/stores/useExamStore';

interface QuestionResult {
  questionId: string;
  stem: string;
  topicName: string;
  userChoiceText: string;
  correctChoiceText: string;
  isCorrect: boolean;
  explanation: string;
}


export const ExamResultsContainer: React.FC = () => {
  const router = useRouter();
  const { session, resetExam } = useExamStore();
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, incorrect: 0, unanswered: 0, total: 0 });
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (session) {
      calculateTimeSpent();
      fetchAnswers();
    } else {
      router.push('/exam');
    }
  }, []);

  const calculateTimeSpent = () => {
    if (session) {
      const start = new Date(session.startedAt).getTime();
      const end = session.submittedAt ? new Date(session.submittedAt).getTime() : Date.now();
      setTimeSpent(Math.floor((end - start) / 1000));
    }
  };

  const fetchAnswers = async () => {
    if (!session) return;
    try {
      const response = await fetch(`${COLLECTIONS.questions}`);
      const data = await response.json();
      let correct = 0, incorrect = 0, unanswered = 0;
      const allResults: QuestionResult[] = [];
      if (data.documents) {
        const questionsMap = new Map<string, any>();
        data.documents.forEach((doc: any) => {
          const f = doc.fields;
          const correctId = f.correctAnswerId?.stringValue || '';
          const choices = f.choices?.arrayValue?.values || [];
          const correctChoice = choices.find((v: any) => v.mapValue?.fields?.id?.stringValue === correctId);
          questionsMap.set(doc.name.split('/').pop(), {
            stem: f.stem?.stringValue || '',
            correctAnswerId: correctId,
            correctChoiceText: correctChoice?.mapValue?.fields?.text?.stringValue || 'N/A',
            explanation: f.explanation?.stringValue || '',
            topicName: (f.topicId?.stringValue || 'general').replace(/-/g, ' '),
          });
        });
        session.questions.forEach((examQ) => {
          const fullQ = questionsMap.get(examQ.id);
          const userAnswer = session.answers.find(a => a.questionId === examQ.id);
          const userChoiceId = userAnswer?.selectedChoiceId || null;
          if (fullQ) {
            const selectedChoice = examQ.choices.find(c => c.id === userChoiceId);
            const isCorrect = userChoiceId === fullQ.correctAnswerId;
            if (!userChoiceId) unanswered++;
            else if (isCorrect) correct++;
            else incorrect++;
            allResults.push({
              questionId: examQ.id,
              stem: fullQ.stem,
              topicName: fullQ.topicName,
              userChoiceText: selectedChoice?.text || 'Not answered',
              correctChoiceText: fullQ.correctChoiceText,
              isCorrect: !!userChoiceId && isCorrect,
              explanation: fullQ.explanation,
            });
          }
        });
      }
      setResults(allResults);
      setScore({ correct, incorrect, unanswered, total: session.questions.length });
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSetup = () => { resetExam(); router.push('/exam'); };
  const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'Excellent!', color: 'text-green-600', icon: '🌟' };
    if (pct >= 75) return { label: 'Great Job!', color: 'text-blue-600', icon: '👏' };
    if (pct >= 60) return { label: 'Good Effort', color: 'text-yellow-600', icon: '💪' };
    return { label: 'Keep Practicing', color: 'text-red-600', icon: '📚' };
  };
  const grade = getGrade(percentage);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent mx-auto"></div>
        <p className="text-gray-400 mt-4 text-sm">Calculating results...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 pb-24">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-36 h-36 rounded-full border-4 border-primary-500 bg-primary-50 mb-4">
          <p className="text-4xl font-bold text-primary-600">{percentage}%</p>
        </div>
        <p className={`text-xl font-bold ${grade.color}`}>{grade.icon} {grade.label}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center p-4"><p className="text-2xl font-bold text-gray-900">{score.total}</p><p className="text-xs text-gray-500">Questions</p></div>
        <div className="card text-center p-4"><p className="text-2xl font-bold text-green-600">{score.correct}</p><p className="text-xs text-gray-500">Correct</p></div>
        <div className="card text-center p-4"><p className="text-2xl font-bold text-red-600">{score.incorrect}</p><p className="text-xs text-gray-500">Incorrect</p></div>
        <div className="card text-center p-4"><p className="text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</p><p className="text-xs text-gray-500">Time</p></div>
      </div>
      {score.unanswered > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm text-center">
          ⚠️ You left {score.unanswered} question(s) unanswered.
        </div>
      )}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">📋 Answer Review</h3>
        {results.map((q, i) => (
          <div key={q.questionId} className={`card border-l-4 ${q.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Question {i + 1} · {q.topicName}</span>
              <span className={`text-sm font-medium ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{q.isCorrect ? '✅ Correct' : '❌ Incorrect'}</span>
            </div>
            <p className="text-sm text-gray-800 mb-3">{q.stem}</p>
            <div className="text-sm space-y-1 mb-3">
              <p><span className="text-gray-500">Your answer:</span> <span className={q.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{q.userChoiceText}</span></p>
              {!q.isCorrect && <p><span className="text-gray-500">Correct answer:</span> <span className="text-green-600 font-medium">{q.correctChoiceText}</span></p>}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Explanation:</p>
              <p className="text-sm text-gray-700">{q.explanation}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <button onClick={handleBackToSetup} className="btn-primary w-full">Take Another Exam</button>
        <button onClick={() => router.push('/')} className="btn-secondary w-full">Back to Home</button>
      </div>
    </div>
  );
};
