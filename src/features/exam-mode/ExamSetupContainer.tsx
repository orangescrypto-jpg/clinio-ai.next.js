'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ExamConfig, ExamQuestion, Question } from '@/types';
import { useExamStore } from '@/stores/useExamStore';
import { fetchCategories, fetchSubCategories, fetchTopics } from '@/data/categories';
import {
  fetchQuestionsByTopic,
  fetchQuestionsByTopics,
  fetchAllQuestionsForQuiz,
} from '@/data/questions';
import { sessionManager } from '@/utils/sessionManager';
import { questionSelector } from '@/utils/questionSelector';

export const ExamSetupContainer: React.FC = () => {
  const router = useRouter();
  const { startExam } = useExamStore();

  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [scope, setScope] = useState<'mixed' | 'category' | 'subCategory' | 'topic'>('mixed');
  const [questionCount] = useState(50);
  const [timeLimit, setTimeLimit] = useState(60);

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    if (categoryId && (scope === 'subCategory' || scope === 'topic')) {
      loadSubCategories(categoryId);
    } else {
      setSubCategories([]);
      setSubCategoryId('');
    }
  }, [categoryId, scope]);

  useEffect(() => {
    if (subCategoryId && scope === 'topic') {
      loadTopics(subCategoryId);
    } else {
      setTopics([]);
      setTopicId('');
    }
  }, [subCategoryId, scope]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch {
      setError('Failed to load categories. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategories = async (catId: string) => {
    try {
      const data = await fetchSubCategories(catId);
      setSubCategories(data);
    } catch {
      setError('Failed to load sub-categories. Please try again.');
    }
  };

  const loadTopics = async (subId: string) => {
    try {
      const data = await fetchTopics(subId);
      setTopics(data);
    } catch {
      setError('Failed to load topics. Please try again.');
    }
  };

  const resolveQuestions = async (): Promise<Question[]> => {
    if (scope === 'mixed') {
      return fetchAllQuestionsForQuiz();
    }
    if (scope === 'topic' && topicId) {
      return fetchQuestionsByTopic(topicId);
    }
    if (scope === 'subCategory' && subCategoryId) {
      const scopeTopics = await fetchTopics(subCategoryId);
      return fetchQuestionsByTopics(scopeTopics.map((t) => t.id));
    }
    if (scope === 'category' && categoryId) {
      const subs = await fetchSubCategories(categoryId);
      const allTopics = await Promise.all(subs.map((s) => fetchTopics(s.id)));
      return fetchQuestionsByTopics(allTopics.flat().map((t) => t.id));
    }
    return [];
  };

  const canStart =
    scope === 'mixed' ||
    (scope === 'category' && !!categoryId) ||
    (scope === 'subCategory' && !!categoryId && !!subCategoryId) ||
    (scope === 'topic' && !!categoryId && !!subCategoryId && !!topicId);

  const handleStart = async () => {
    if (!canStart) return;
    setError('');
    setStarting(true);

    try {
      const config: ExamConfig = {
        scope,
        scopeId:
          scope === 'topic' ? topicId
          : scope === 'subCategory' ? subCategoryId
          : scope === 'category' ? categoryId
          : undefined,
        questionCount,
        timeLimitMinutes: timeLimit,
      };

      const allQuestions = await resolveQuestions();

      if (allQuestions.length === 0) {
        setError('No questions found for this selection. Please choose a different scope or check back later.');
        return;
      }

      const session = sessionManager.getSession();
      const scopeKey = sessionManager.buildScopeKey(scope, config.scopeId);

      const { selected } = questionSelector.selectQuestions(
        allQuestions,
        session,
        scopeKey,
        Math.min(questionCount, allQuestions.length),
      );

      // Strip answers for exam mode
      const examQuestions: ExamQuestion[] = selected.map((q, i) => ({
        id: q.id,
        topicId: q.topicId,
        stem: q.stem,
        choices: q.choices,
        orderIndex: i + 1,
      }));

      startExam(examQuestions, config);
      router.push('/exam/session');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent mx-auto" />
        <p className="text-gray-500 mt-4">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-24 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">📝 Exam Mode</h2>
        <p className="text-gray-500 mt-1">Full exam simulation with timed conditions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Scope Selector */}
      <div className="card space-y-4">
        <p className="text-sm font-semibold text-gray-700">Exam Scope</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'mixed', label: 'All Categories', icon: '🎯' },
            { value: 'category', label: 'By Category', icon: '📂' },
            { value: 'subCategory', label: 'By System', icon: '🔬' },
            { value: 'topic', label: 'By Topic', icon: '📝' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setScope(opt.value as typeof scope);
                setCategoryId('');
                setSubCategoryId('');
                setTopicId('');
                setError('');
              }}
              className={`p-3 rounded-xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
                scope === opt.value ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="text-xl block">{opt.icon}</span>
              <p className="text-sm font-medium mt-1 text-gray-800">{opt.label}</p>
            </button>
          ))}
        </div>

        {(scope === 'category' || scope === 'subCategory' || scope === 'topic') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="exam-category">
              Category
            </label>
            <select
              id="exam-category"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); setTopicId(''); setError(''); }}
              className="input-field"
            >
              <option value="">Select a category…</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {(scope === 'subCategory' || scope === 'topic') && categoryId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="exam-sub">
              System / Area
            </label>
            {subCategories.length > 0 ? (
              <select
                id="exam-sub"
                value={subCategoryId}
                onChange={(e) => { setSubCategoryId(e.target.value); setTopicId(''); setError(''); }}
                className="input-field"
              >
                <option value="">Select a system…</option>
                {subCategories.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-400 italic">No sub-categories found for this category.</p>
            )}
          </div>
        )}

        {scope === 'topic' && subCategoryId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="exam-topic">
              Topic
            </label>
            {topics.length > 0 ? (
              <select
                id="exam-topic"
                value={topicId}
                onChange={(e) => { setTopicId(e.target.value); setError(''); }}
                className="input-field"
              >
                <option value="">Select a topic…</option>
                {topics.map((topic: any) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name} ({topic.questionCount} qs)
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-400 italic">No topics found for this system.</p>
            )}
          </div>
        )}
      </div>

      {/* Time Limit */}
      <div className="card space-y-3">
        <p className="text-sm font-semibold text-gray-700">Time Limit</p>
        <div className="grid grid-cols-4 gap-2">
          {[30, 45, 60, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => setTimeLimit(mins)}
              className={`p-3 rounded-xl border-2 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
                timeLimit === mins ? 'border-red-400 bg-red-50 font-bold' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <p className="text-lg font-bold text-gray-800">{mins}</p>
              <p className="text-xs text-gray-400">min</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card space-y-3 p-0 overflow-hidden">
        {[
          { label: 'Questions', value: questionCount },
          { label: 'Time Limit', value: `${timeLimit} minutes` },
          { label: 'Feedback', value: 'After submission only' },
        ].map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between px-6 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="text-sm font-semibold text-gray-800">{row.value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={!canStart || starting}
        className={`w-full text-white px-6 py-4 rounded-xl font-bold text-base transition-all sticky bottom-20 md:bottom-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 ${
          canStart && !starting
            ? 'bg-red-500 hover:bg-red-600 shadow-lg active:scale-95'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {starting ? '⏳ Loading questions…' : canStart ? '🚀 Start Exam' : 'Select options above to start'}
      </button>
    </div>
  );
};
