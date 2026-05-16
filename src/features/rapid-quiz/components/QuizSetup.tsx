'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { QuizConfig, QuizQuestion, Question } from '@/types';
import { fetchCategories, fetchSubCategories, fetchTopics } from '@/data/categories';
import {
  fetchQuestionsByTopic,
  fetchQuestionsByTopics,
  fetchAllQuestionsForQuiz,
} from '@/data/questions';
import { sessionManager } from '@/utils/sessionManager';
import { questionSelector } from '@/utils/questionSelector';

interface Props {
  onStart: (questions: QuizQuestion[], config: QuizConfig) => void;
}

export function QuizSetup({ onStart }: Props) {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get('topic') || '';

  const [categoryId, setCategoryId] = useState<string>('');
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [topicId, setTopicId] = useState<string>('');
  const [scope, setScope] = useState<'mixed' | 'category' | 'subCategory' | 'topic'>('mixed');
  const [questionCount] = useState(50);

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

  useEffect(() => {
    if (topicParam && !loading) {
      setScope('topic');
    }
  }, [topicParam, loading]);

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

  const handleStart = async () => {
    setError('');
    setStarting(true);
    try {
      const session = sessionManager.getSession();
      const scopeKey = sessionManager.buildScopeKey(scope, topicId || subCategoryId || categoryId);

      let rawQuestions: Question[] = [];
      if (scope === 'topic' && topicId) {
        rawQuestions = await fetchQuestionsByTopic(topicId);
      } else if (scope === 'subCategory' && subCategoryId) {
        const topicList = await fetchTopics(subCategoryId);
        rawQuestions = await fetchQuestionsByTopics(topicList.map((t) => t.id));
      } else if (scope === 'category' && categoryId) {
        const subCatList = await fetchSubCategories(categoryId);
        const topicIds: string[] = [];
        for (const sub of subCatList) {
          const tList = await fetchTopics(sub.id);
          topicIds.push(...tList.map((t) => t.id));
        }
        rawQuestions = await fetchQuestionsByTopics(topicIds);
      } else {
        rawQuestions = await fetchAllQuestionsForQuiz();
      }

      if (rawQuestions.length === 0) {
        setError('No questions found for the selected scope. Please try a different selection.');
        setStarting(false);
        return;
      }

      const { selected, updatedSession } = questionSelector.selectQuestions(
        rawQuestions,
        session,
        scopeKey,
        Math.min(questionCount, rawQuestions.length)
      );
      sessionManager.saveSession(updatedSession);

      const quizQuestions: QuizQuestion[] = selected.map((q) => ({
        question: q,
        timeLimit: 60,
      }));

      const config: QuizConfig = {
        scope,
        scopeId: topicId || subCategoryId || categoryId,
        questionCount: quizQuestions.length,
      };

      onStart(quizQuestions, config);
    } catch {
      setError('Failed to load questions. Please check your connection and try again.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 py-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">⚡ Rapid Quiz</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Timed MCQs with instant feedback. Questions rotate so you always see something new.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card space-y-5">
        {/* Scope selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Scope</label>
          <div className="grid grid-cols-2 gap-2">
            {(['mixed', 'category', 'subCategory', 'topic'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setScope(s); setCategoryId(''); setSubCategoryId(''); setTopicId(''); }}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors ${
                  scope === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}
              >
                {s === 'mixed' ? '🌐 Mixed' : s === 'category' ? '📂 Category' : s === 'subCategory' ? '📁 Sub-Category' : '📑 Topic'}
              </button>
            ))}
          </div>
        </div>

        {/* Category selector */}
        {(scope === 'category' || scope === 'subCategory' || scope === 'topic') && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); setTopicId(''); }}
              className="input-field"
            >
              <option value="">— Select Category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sub-category selector */}
        {(scope === 'subCategory' || scope === 'topic') && categoryId && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Category</label>
            <select
              value={subCategoryId}
              onChange={(e) => { setSubCategoryId(e.target.value); setTopicId(''); }}
              className="input-field"
            >
              <option value="">— Select Sub-Category —</option>
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Topic selector */}
        {scope === 'topic' && subCategoryId && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Topic</label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="input-field"
            >
              <option value="">— Select Topic —</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.questionCount} Qs)</option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-2">
          <p className="text-xs text-gray-400 mb-3">
            Up to {questionCount} questions, rotated so you see new ones each session.
          </p>
          <button
            onClick={handleStart}
            disabled={starting || (scope !== 'mixed' && !categoryId) || (scope === 'subCategory' && !subCategoryId) || (scope === 'topic' && !topicId)}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading Questions...
              </span>
            ) : (
              '⚡ Start Quiz'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
