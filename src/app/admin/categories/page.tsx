'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { COLLECTIONS } from '@/lib/firebase';
import { createDocument, updateDocument, deleteDocument } from '@/lib/firestoreAdmin';
import { useAdminAuth } from '@/lib/adminAuthContext';
import {
  AdminGuard, AdminHeader, Modal, Confirm, Field, Toast, inputCls, selectCls,
} from '../AdminUI';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category { id: string; name: string; icon: string; description: string; targetAudience: string; }
interface SubCategory { id: string; categoryId: string; name: string; description: string; icon: string; }
interface Topic { id: string; subCategoryId: string; name: string; description: string; questionCount: number; }

type Tab = 'categories' | 'subcategories' | 'topics';

// ── Forms ─────────────────────────────────────────────────────────────────────

function CategoryForm({ initial, onSave, onClose, saving }: { initial: Omit<Category,'id'>; onSave: (d: Omit<Category,'id'>) => Promise<void>; onClose: () => void; saving: boolean }) {
  const [f, setF] = useState(initial);
  const set = (k: keyof typeof f, v: string) => setF(x => ({ ...x, [k]: v }));
  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave(f); }} className="space-y-4">
      <Field label="Name" required><input className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} required placeholder="Pharmacology" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Icon (emoji)" required><input className={inputCls} value={f.icon} onChange={e => set('icon', e.target.value)} required placeholder="💊" /></Field>
        <Field label="Target audience"><input className={inputCls} value={f.targetAudience} onChange={e => set('targetAudience', e.target.value)} placeholder="Nursing students" /></Field>
      </div>
      <Field label="Description"><textarea className={inputCls} rows={2} value={f.description} onChange={e => set('description', e.target.value)} placeholder="Brief description…" /></Field>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

function SubCategoryForm({ initial, categories, onSave, onClose, saving }: { initial: Omit<SubCategory,'id'>; categories: Category[]; onSave: (d: Omit<SubCategory,'id'>) => Promise<void>; onClose: () => void; saving: boolean }) {
  const [f, setF] = useState(initial);
  const set = (k: keyof typeof f, v: string) => setF(x => ({ ...x, [k]: v }));
  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave(f); }} className="space-y-4">
      <Field label="Parent category" required>
        <select className={selectCls} value={f.categoryId} onChange={e => set('categoryId', e.target.value)} required>
          <option value="">Select category…</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </Field>
      <Field label="Name" required><input className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} required placeholder="Sub-category name" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Icon (emoji)"><input className={inputCls} value={f.icon} onChange={e => set('icon', e.target.value)} placeholder="🏥" /></Field>
        <Field label="Description"><input className={inputCls} value={f.description} onChange={e => set('description', e.target.value)} placeholder="Brief description" /></Field>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

function TopicForm({ initial, subcategories, onSave, onClose, saving }: { initial: Omit<Topic,'id'>; subcategories: SubCategory[]; onSave: (d: Omit<Topic,'id'>) => Promise<void>; onClose: () => void; saving: boolean }) {
  const [f, setF] = useState(initial);
  const set = (k: keyof typeof f, v: any) => setF(x => ({ ...x, [k]: v }));
  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave(f); }} className="space-y-4">
      <Field label="Sub-category" required>
        <select className={selectCls} value={f.subCategoryId} onChange={e => set('subCategoryId', e.target.value)} required>
          <option value="">Select sub-category…</option>
          {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Topic name" required><input className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} required placeholder="Topic name" /></Field>
      <Field label="Description"><textarea className={inputCls} rows={2} value={f.description} onChange={e => set('description', e.target.value)} placeholder="Brief description…" /></Field>
      <Field label="Question count" hint="This is a display counter; update it manually when adding/removing questions.">
        <input className={inputCls} type="number" min={0} value={f.questionCount} onChange={e => set('questionCount', Number(e.target.value))} />
      </Field>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────

function CategoriesContent() {
  const { getToken } = useAdminAuth();
  const [tab, setTab] = useState<Tab>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editSub, setEditSub] = useState<SubCategory | null>(null);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string; collection: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes, tRes] = await Promise.all([
        fetch(COLLECTIONS.categories),
        fetch(COLLECTIONS.subCategories),
        fetch(COLLECTIONS.topics),
      ]);
      const [cData, sData, tData] = await Promise.all([cRes.json(), sRes.json(), tRes.json()]);

      setCategories((cData.documents || []).map((doc: any) => ({
        id: doc.name.split('/').pop(), ...Object.fromEntries(Object.entries(doc.fields).map(([k, v]: [string, any]) => [k, v.stringValue ?? v.integerValue ?? v.booleanValue ?? ''])),
      })));
      setSubcategories((sData.documents || []).map((doc: any) => ({
        id: doc.name.split('/').pop(), ...Object.fromEntries(Object.entries(doc.fields).map(([k, v]: [string, any]) => [k, v.stringValue ?? v.integerValue ?? v.booleanValue ?? ''])),
      })));
      setTopics((tData.documents || []).map((doc: any) => {
        const f = doc.fields;
        return {
          id: doc.name.split('/').pop(),
          subCategoryId: f.subCategoryId?.stringValue || '',
          name: f.name?.stringValue || '',
          description: f.description?.stringValue || '',
          questionCount: Number(f.questionCount?.integerValue) || 0,
        };
      }));
    } catch {
      showToast('Failed to load taxonomy data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const catName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const subName = (id: string) => subcategories.find(s => s.id === id)?.name || id;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getToken();
      await deleteDocument(deleteTarget.collection, deleteTarget.id, token);
      showToast('Deleted successfully', 'success');
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'categories', label: 'Categories', count: categories.length },
    { key: 'subcategories', label: 'Sub-categories', count: subcategories.length },
    { key: 'topics', label: 'Topics', count: topics.length },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminHeader title="Categories" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold text-white">Taxonomy Management</h1>
          <button onClick={() => { setEditCat(null); setEditSub(null); setEditTopic(null); setModal('create'); }}
            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
            + New {tab === 'categories' ? 'Category' : tab === 'subcategories' ? 'Sub-category' : 'Topic'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-6 border border-gray-800">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${tab === t.key ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-orange-500/50' : 'bg-gray-800'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-900 rounded-xl animate-pulse" />)}</div>
        ) : (
          <>
            {/* Categories */}
            {tab === 'categories' && (
              <div className="space-y-2">
                {categories.length === 0 && <p className="text-center py-10 text-gray-500">No categories yet.</p>}
                {categories.map(c => (
                  <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3.5 flex items-center gap-4">
                    <span className="text-2xl">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white">{c.name}</span>
                      {c.targetAudience && <span className="ml-2 text-xs text-gray-500">{c.targetAudience}</span>}
                      {c.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{c.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditCat(c); setModal('edit'); }}
                        className="text-xs text-orange-400 hover:text-white bg-orange-900/30 hover:bg-orange-700 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => setDeleteTarget({ id: c.id, label: c.name, collection: 'categories' })}
                        className="text-xs text-red-400 hover:text-white bg-red-900/30 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-categories */}
            {tab === 'subcategories' && (
              <div className="space-y-2">
                {subcategories.length === 0 && <p className="text-center py-10 text-gray-500">No sub-categories yet.</p>}
                {subcategories.map(s => (
                  <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3.5 flex items-center gap-4">
                    <span className="text-xl">{s.icon || '📁'}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white">{s.name}</span>
                      <span className="ml-2 text-xs text-gray-500">in {catName(s.categoryId)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditSub(s); setModal('edit'); }}
                        className="text-xs text-orange-400 hover:text-white bg-orange-900/30 hover:bg-orange-700 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => setDeleteTarget({ id: s.id, label: s.name, collection: 'subCategories' })}
                        className="text-xs text-red-400 hover:text-white bg-red-900/30 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Topics */}
            {tab === 'topics' && (
              <div className="space-y-2">
                {topics.length === 0 && <p className="text-center py-10 text-gray-500">No topics yet.</p>}
                {topics.map(t => (
                  <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3.5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white">{t.name}</span>
                      <span className="ml-2 text-xs text-gray-500">in {subName(t.subCategoryId)}</span>
                      <span className="ml-2 text-xs text-gray-600">{t.questionCount} questions</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditTopic(t); setModal('edit'); }}
                        className="text-xs text-orange-400 hover:text-white bg-orange-900/30 hover:bg-orange-700 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => setDeleteTarget({ id: t.id, label: t.name, collection: 'topics' })}
                        className="text-xs text-red-400 hover:text-white bg-red-900/30 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create modals */}
      {modal === 'create' && tab === 'categories' && (
        <Modal title="New Category" onClose={() => setModal(null)}>
          <CategoryForm
            initial={{ name: '', icon: '', description: '', targetAudience: '' }}
            onSave={async d => { setSaving(true); try { const token = await getToken(); await createDocument('categories', d, token); showToast('Category created!', 'success'); setModal(null); fetchAll(); } catch (err: any) { showToast(err.message, 'error'); } finally { setSaving(false); } }}
            onClose={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {modal === 'create' && tab === 'subcategories' && (
        <Modal title="New Sub-category" onClose={() => setModal(null)}>
          <SubCategoryForm
            initial={{ categoryId: '', name: '', description: '', icon: '' }}
            categories={categories}
            onSave={async d => { setSaving(true); try { const token = await getToken(); await createDocument('subCategories', d, token); showToast('Sub-category created!', 'success'); setModal(null); fetchAll(); } catch (err: any) { showToast(err.message, 'error'); } finally { setSaving(false); } }}
            onClose={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {modal === 'create' && tab === 'topics' && (
        <Modal title="New Topic" onClose={() => setModal(null)}>
          <TopicForm
            initial={{ subCategoryId: '', name: '', description: '', questionCount: 0 }}
            subcategories={subcategories}
            onSave={async d => { setSaving(true); try { const token = await getToken(); await createDocument('topics', d, token); showToast('Topic created!', 'success'); setModal(null); fetchAll(); } catch (err: any) { showToast(err.message, 'error'); } finally { setSaving(false); } }}
            onClose={() => setModal(null)} saving={saving} />
        </Modal>
      )}

      {/* Edit modals */}
      {modal === 'edit' && editCat && (
        <Modal title="Edit Category" onClose={() => { setModal(null); setEditCat(null); }}>
          <CategoryForm initial={editCat} onSave={async d => { setSaving(true); try { const token = await getToken(); await updateDocument('categories', editCat.id, d, token); showToast('Updated!', 'success'); setModal(null); setEditCat(null); fetchAll(); } catch (err: any) { showToast(err.message, 'error'); } finally { setSaving(false); } }} onClose={() => { setModal(null); setEditCat(null); }} saving={saving} />
        </Modal>
      )}
      {modal === 'edit' && editSub && (
        <Modal title="Edit Sub-category" onClose={() => { setModal(null); setEditSub(null); }}>
          <SubCategoryForm initial={editSub} categories={categories} onSave={async d => { setSaving(true); try { const token = await getToken(); await updateDocument('subCategories', editSub.id, d, token); showToast('Updated!', 'success'); setModal(null); setEditSub(null); fetchAll(); } catch (err: any) { showToast(err.message, 'error'); } finally { setSaving(false); } }} onClose={() => { setModal(null); setEditSub(null); }} saving={saving} />
        </Modal>
      )}
      {modal === 'edit' && editTopic && (
        <Modal title="Edit Topic" onClose={() => { setModal(null); setEditTopic(null); }}>
          <TopicForm initial={editTopic} subcategories={subcategories} onSave={async d => { setSaving(true); try { const token = await getToken(); await updateDocument('topics', editTopic.id, d, token); showToast('Updated!', 'success'); setModal(null); setEditTopic(null); fetchAll(); } catch (err: any) { showToast(err.message, 'error'); } finally { setSaving(false); } }} onClose={() => { setModal(null); setEditTopic(null); }} saving={saving} />
        </Modal>
      )}

      {deleteTarget && (
        <Confirm message={`Delete "${deleteTarget.label}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default function CategoriesPage() {
  return <AdminGuard><CategoriesContent /></AdminGuard>;
}
