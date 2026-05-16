'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { COLLECTIONS } from '@/lib/firebase';
import { createDocument, updateDocument, deleteDocument } from '@/lib/firestoreAdmin';
import { useAdminAuth } from '@/lib/adminAuthContext';
import {
  AdminGuard, AdminHeader, Modal, Confirm, Field, Toast, inputCls,
} from '../AdminUI';

interface Scenario {
  id: string;
  title: string;
  preview: string;
  content: string;
  imageUrl: string;
  topic: string;
  category: string;
  subCategory: string;
  author: string;
  readTime: string;
  hasVideo: boolean;
  videoUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
}

const EMPTY: Omit<Scenario, 'id'> = {
  title: '', preview: '', content: '', imageUrl: '',
  topic: 'Clinical Scenario', category: 'Clinical', subCategory: 'OSCE',
  author: 'Clinio AI', readTime: '10 min read',
  hasVideo: false, videoUrl: '',
  likes: 0, comments: 0, createdAt: new Date().toISOString().split('T')[0],
};

function ScenarioForm({
  initial, onSave, onClose, saving,
}: {
  initial: Omit<Scenario, 'id'>;
  onSave: (d: Omit<Scenario, 'id'>) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave(form); }} className="space-y-4">
      <Field label="Title" required>
        <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Clinical scenario title" />
      </Field>
      <Field label="Preview" required hint="Short summary shown on the scenarios list">
        <textarea className={inputCls} rows={2} value={form.preview} onChange={e => set('preview', e.target.value)} required placeholder="Brief case overview…" />
      </Field>
      <Field label="Content (Markdown / HTML)" required hint="Full OSCE case with stations, prompts, and expected findings">
        <textarea className={inputCls} rows={10} value={form.content} onChange={e => set('content', e.target.value)} required placeholder="## Station 1 — History Taking&#10;&#10;**Patient:** …" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Topic">
          <input className={inputCls} value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="Clinical Scenario" />
        </Field>
        <Field label="Sub-category">
          <input className={inputCls} value={form.subCategory} onChange={e => set('subCategory', e.target.value)} placeholder="OSCE" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <input className={inputCls} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Clinical" />
        </Field>
        <Field label="Read time">
          <input className={inputCls} value={form.readTime} onChange={e => set('readTime', e.target.value)} placeholder="10 min read" />
        </Field>
      </div>
      <Field label="Image URL">
        <input className={inputCls} value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Author">
          <input className={inputCls} value={form.author} onChange={e => set('author', e.target.value)} />
        </Field>
        <Field label="Date (YYYY-MM-DD)">
          <input className={inputCls} type="date" value={form.createdAt.split('T')[0]} onChange={e => set('createdAt', e.target.value)} />
        </Field>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
          {saving ? 'Saving…' : 'Save Scenario'}
        </button>
      </div>
    </form>
  );
}

function ScenariosContent() {
  const { getToken } = useAdminAuth();
  const [items, setItems] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Scenario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Scenario | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(COLLECTIONS.posts);
      const data = await res.json();
      if (data.documents) {
        const all: Scenario[] = data.documents.map((doc: any) => {
          const f = doc.fields;
          return {
            id: doc.name.split('/').pop(),
            title: f.title?.stringValue || '',
            preview: f.preview?.stringValue || '',
            content: f.content?.stringValue || '',
            imageUrl: f.imageUrl?.stringValue || '',
            topic: f.topic?.stringValue || '',
            category: f.category?.stringValue || '',
            subCategory: f.subCategory?.stringValue || '',
            author: f.author?.stringValue || 'Clinio AI',
            readTime: f.readTime?.stringValue || '',
            hasVideo: f.hasVideo?.booleanValue || false,
            videoUrl: f.videoUrl?.stringValue || '',
            likes: Number(f.likes?.integerValue) || 0,
            comments: Number(f.comments?.integerValue) || 0,
            createdAt: f.createdAt?.stringValue || '',
          };
        }).filter((p: Scenario) =>
          p.subCategory === 'OSCE' ||
          p.subCategory === 'Clinical Scenario' ||
          p.topic === 'Clinical Scenario'
        ).sort((a: Scenario, b: Scenario) => b.createdAt.localeCompare(a.createdAt));
        setItems(all);
      } else {
        setItems([]);
      }
    } catch {
      showToast('Failed to load scenarios', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (data: Omit<Scenario, 'id'>) => {
    setSaving(true);
    try {
      const token = await getToken();
      await createDocument('posts', data, token);
      showToast('Scenario created!', 'success');
      setModal(null);
      fetchAll();
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (data: Omit<Scenario, 'id'>) => {
    if (!editing) return;
    setSaving(true);
    try {
      const token = await getToken();
      await updateDocument('posts', editing.id, data, token);
      showToast('Scenario updated!', 'success');
      setModal(null); setEditing(null);
      fetchAll();
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getToken();
      await deleteDocument('posts', deleteTarget.id, token);
      showToast('Scenario deleted', 'success');
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const filtered = items.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminHeader title="Clinical Scenarios" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Clinical Scenarios (OSCE)</h1>
            <p className="text-gray-400 text-sm mt-0.5">{items.length} scenarios</p>
          </div>
          <div className="flex gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48" />
            <button onClick={() => { setEditing(null); setModal('create'); }}
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
              + New Scenario
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-900 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">{search ? 'No scenarios match.' : 'No scenarios yet.'}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(s => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-white truncate block">{s.title}</span>
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                    <span>{s.category}</span>
                    <span>·</span><span>{s.subCategory}</span>
                    {s.createdAt && <><span>·</span><span>{s.createdAt.split('T')[0]}</span></>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/feed/${s.id}`} target="_blank" className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">View</Link>
                  <button onClick={() => { setEditing(s); setModal('edit'); }}
                    className="text-xs text-green-400 hover:text-white bg-green-900/30 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => setDeleteTarget(s)}
                    className="text-xs text-red-400 hover:text-white bg-red-900/30 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modal === 'create' && (
        <Modal title="New Clinical Scenario" onClose={() => setModal(null)} wide>
          <ScenarioForm initial={EMPTY} onSave={handleCreate} onClose={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Edit Scenario" onClose={() => { setModal(null); setEditing(null); }} wide>
          <ScenarioForm initial={editing} onSave={handleEdit} onClose={() => { setModal(null); setEditing(null); }} saving={saving} />
        </Modal>
      )}
      {deleteTarget && (
        <Confirm message={`Delete "${deleteTarget.title}"? Cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default function ScenariosPage() {
  return <AdminGuard><ScenariosContent /></AdminGuard>;
}
