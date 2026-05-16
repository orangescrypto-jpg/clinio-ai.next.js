'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { COLLECTIONS } from '@/lib/firebase';
import { createDocument, updateDocument, deleteDocument } from '@/lib/firestoreAdmin';
import { useAdminAuth } from '@/lib/adminAuthContext';
import {
  AdminGuard, AdminHeader, Modal, Confirm, Field, Toast, inputCls, selectCls,
} from '../AdminUI';

interface Choice { id: string; text: string; }
interface Question {
  id: string;
  topicId: string;
  stem: string;
  choices: Choice[];
  correctAnswerId: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
interface Topic { id: string; name: string; subCategoryId: string; }

const CHOICE_IDS = ['a', 'b', 'c', 'd'];

const EMPTY_Q: Omit<Question, 'id'> = {
  topicId: '',
  stem: '',
  choices: CHOICE_IDS.map(id => ({ id, text: '' })),
  correctAnswerId: 'a',
  explanation: '',
  difficulty: 'medium',
};

function QuestionForm({
  initial, topics, onSave, onClose, saving,
}: {
  initial: Omit<Question, 'id'>;
  topics: Topic[];
  onSave: (d: Omit<Question, 'id'>) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const setChoice = (idx: number, text: string) =>
    setForm(f => ({ ...f, choices: f.choices.map((c, i) => i === idx ? { ...c, text } : c) }));

  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave(form); }} className="space-y-4">
      <Field label="Topic" required>
        <select className={selectCls} value={form.topicId} onChange={e => setForm(f => ({ ...f, topicId: e.target.value }))} required>
          <option value="">Select a topic…</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Field>
      <Field label="Question stem" required>
        <textarea className={inputCls} rows={4} value={form.stem} onChange={e => setForm(f => ({ ...f, stem: e.target.value }))} required placeholder="A 35-year-old patient presents with…" />
      </Field>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Answer choices <span className="text-red-400">*</span></label>
        <div className="space-y-2">
          {form.choices.map((choice, i) => (
            <div key={choice.id} className="flex items-center gap-3">
              <input
                type="radio"
                name="correct"
                value={choice.id}
                checked={form.correctAnswerId === choice.id}
                onChange={() => setForm(f => ({ ...f, correctAnswerId: choice.id }))}
                className="accent-green-500 w-4 h-4 flex-shrink-0"
                title="Mark as correct"
              />
              <span className="text-gray-400 font-mono text-sm w-4">{choice.id.toUpperCase()}.</span>
              <input
                className={inputCls}
                value={choice.text}
                onChange={e => setChoice(i, e.target.value)}
                required
                placeholder={`Choice ${choice.id.toUpperCase()}`}
              />
            </div>
          ))}
          <p className="text-xs text-gray-500 pl-7">Select the radio button next to the correct answer.</p>
        </div>
      </div>
      <Field label="Explanation" required>
        <textarea className={inputCls} rows={4} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} required placeholder="Why this answer is correct…" />
      </Field>
      <Field label="Difficulty">
        <select className={selectCls} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Question['difficulty'] }))}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </Field>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
          {saving ? 'Saving…' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  hard: 'bg-red-900 text-red-300',
};

function QuestionsContent() {
  const { getToken } = useAdminAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const parseChoices = (f: any): Choice[] => {
    try {
      const raw = f.choices?.arrayValue?.values || [];
      return raw.map((v: any) => {
        try { return JSON.parse(v.stringValue); } catch { return { id: '', text: v.stringValue }; }
      });
    } catch { return CHOICE_IDS.map(id => ({ id, text: '' })); }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, tRes] = await Promise.all([
        fetch(COLLECTIONS.questions),
        fetch(COLLECTIONS.topics),
      ]);
      const [qData, tData] = await Promise.all([qRes.json(), tRes.json()]);

      const mappedTopics: Topic[] = (tData.documents || []).map((doc: any) => ({
        id: doc.name.split('/').pop(),
        name: doc.fields.name?.stringValue || '',
        subCategoryId: doc.fields.subCategoryId?.stringValue || '',
      }));
      setTopics(mappedTopics);

      const mappedQs: Question[] = (qData.documents || []).map((doc: any) => {
        const f = doc.fields;
        return {
          id: doc.name.split('/').pop(),
          topicId: f.topicId?.stringValue || '',
          stem: f.stem?.stringValue || '',
          choices: parseChoices(f),
          correctAnswerId: f.correctAnswerId?.stringValue || 'a',
          explanation: f.explanation?.stringValue || '',
          difficulty: (f.difficulty?.stringValue as Question['difficulty']) || 'medium',
        };
      });
      setQuestions(mappedQs);
    } catch {
      showToast('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toFirestoreData = (data: Omit<Question, 'id'>) => ({
    ...data,
    choices: data.choices.map(c => JSON.stringify(c)),
  });

  const handleCreate = async (data: Omit<Question, 'id'>) => {
    setSaving(true);
    try {
      const token = await getToken();
      await createDocument('questions', toFirestoreData(data), token);
      showToast('Question created!', 'success');
      setModal(null);
      fetchAll();
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (data: Omit<Question, 'id'>) => {
    if (!editing) return;
    setSaving(true);
    try {
      const token = await getToken();
      await updateDocument('questions', editing.id, toFirestoreData(data), token);
      showToast('Question updated!', 'success');
      setModal(null); setEditing(null);
      fetchAll();
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getToken();
      await deleteDocument('questions', deleteTarget.id, token);
      showToast('Question deleted', 'success');
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const topicName = (id: string) => topics.find(t => t.id === id)?.name || id;

  const filtered = questions.filter(q => {
    const matchSearch = q.stem.toLowerCase().includes(search.toLowerCase());
    const matchTopic = filterTopic ? q.topicId === filterTopic : true;
    return matchSearch && matchTopic;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminHeader title="Questions" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">MCQ Questions</h1>
            <p className="text-gray-400 text-sm mt-0.5">{questions.length} questions</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…"
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-44" />
            <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">All topics</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={() => { setEditing(null); setModal('create'); }}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
              + New Question
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-900 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No questions found.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(q => (
              <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm line-clamp-2">{q.stem}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-gray-500">{topicName(q.topicId)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setEditing(q); setModal('edit'); }}
                    className="text-xs text-purple-400 hover:text-white bg-purple-900/30 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => setDeleteTarget(q)}
                    className="text-xs text-red-400 hover:text-white bg-red-900/30 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modal === 'create' && (
        <Modal title="New Question" onClose={() => setModal(null)} wide>
          <QuestionForm initial={EMPTY_Q} topics={topics} onSave={handleCreate} onClose={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Edit Question" onClose={() => { setModal(null); setEditing(null); }} wide>
          <QuestionForm initial={editing} topics={topics} onSave={handleEdit} onClose={() => { setModal(null); setEditing(null); }} saving={saving} />
        </Modal>
      )}
      {deleteTarget && (
        <Confirm message="Delete this question? This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default function QuestionsPage() {
  return <AdminGuard><QuestionsContent /></AdminGuard>;
}
