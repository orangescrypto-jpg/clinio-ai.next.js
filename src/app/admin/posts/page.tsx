'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { COLLECTIONS } from '@/lib/firebase';
import { createDocument, updateDocument, deleteDocument } from '@/lib/firestoreAdmin';
import { useAdminAuth } from '@/lib/adminAuthContext';
import {
  AdminGuard, AdminHeader, Modal, Confirm, Field, Toast,
  inputCls, selectCls,
} from '../AdminUI';

interface Post {
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

const EMPTY_POST: Omit<Post, 'id'> = {
  title: '', preview: '', content: '', imageUrl: '',
  topic: '', category: '', subCategory: '',
  author: 'Clinio AI', readTime: '5 min read',
  hasVideo: false, videoUrl: '',
  likes: 0, comments: 0, createdAt: new Date().toISOString().split('T')[0],
};

function PostForm({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: Omit<Post, 'id'>;
  onSave: (data: Omit<Post, 'id'>) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title" required>
        <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Post title" />
      </Field>
      <Field label="Preview" required hint="Short description shown in the feed list">
        <textarea className={inputCls} rows={2} value={form.preview} onChange={e => set('preview', e.target.value)} required placeholder="Brief summary…" />
      </Field>
      <Field label="Content (Markdown / HTML)" required>
        <textarea className={inputCls} rows={8} value={form.content} onChange={e => set('content', e.target.value)} required placeholder="Full post content…" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Topic" required>
          <input className={inputCls} value={form.topic} onChange={e => set('topic', e.target.value)} required placeholder="e.g. Pharmacology" />
        </Field>
        <Field label="Category">
          <input className={inputCls} value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Nursing" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Sub-category">
          <input className={inputCls} value={form.subCategory} onChange={e => set('subCategory', e.target.value)} placeholder="e.g. OSCE" />
        </Field>
        <Field label="Read time">
          <input className={inputCls} value={form.readTime} onChange={e => set('readTime', e.target.value)} placeholder="5 min read" />
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
      <div className="flex items-center gap-3">
        <input
          id="hasVideo"
          type="checkbox"
          checked={form.hasVideo}
          onChange={e => set('hasVideo', e.target.checked)}
          className="w-4 h-4 rounded accent-indigo-500"
        />
        <label htmlFor="hasVideo" className="text-sm text-gray-300">Has video</label>
      </div>
      {form.hasVideo && (
        <Field label="Video URL">
          <input className={inputCls} value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://youtube.com/…" />
        </Field>
      )}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
          {saving ? 'Saving…' : 'Save Post'}
        </button>
      </div>
    </form>
  );
}

function PostsContent() {
  const { getToken } = useAdminAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(COLLECTIONS.posts);
      const data = await res.json();
      if (data.documents) {
        const mapped: Post[] = data.documents.map((doc: any) => {
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
        }).sort((a: Post, b: Post) => b.createdAt.localeCompare(a.createdAt));
        setPosts(mapped);
      } else {
        setPosts([]);
      }
    } catch {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleCreate = async (data: Omit<Post, 'id'>) => {
    setSaving(true);
    try {
      const token = await getToken();
      await createDocument('posts', data, token);
      showToast('Post created!', 'success');
      setModal(null);
      fetchPosts();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data: Omit<Post, 'id'>) => {
    if (!editing) return;
    setSaving(true);
    try {
      const token = await getToken();
      await updateDocument('posts', editing.id, data, token);
      showToast('Post updated!', 'success');
      setModal(null);
      setEditing(null);
      fetchPosts();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getToken();
      await deleteDocument('posts', deleteTarget.id, token);
      showToast('Post deleted', 'success');
      setDeleteTarget(null);
      fetchPosts();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminHeader title="Posts" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Feed Posts</h1>
            <p className="text-gray-400 text-sm mt-0.5">{posts.length} total posts</p>
          </div>
          <div className="flex gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
            />
            <button
              onClick={() => { setEditing(null); setModal('create'); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              + New Post
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-900 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {search ? 'No posts match your search.' : 'No posts yet. Create your first one!'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(post => (
              <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white truncate">{post.title}</span>
                    {post.hasVideo && <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">🎬 Video</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{post.topic}</span>
                    {post.category && <><span>·</span><span>{post.category}</span></>}
                    {post.createdAt && <><span>·</span><span>{post.createdAt.split('T')[0]}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/feed/${post.id}`} target="_blank" className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                    View
                  </Link>
                  <button
                    onClick={() => { setEditing(post); setModal('edit'); }}
                    className="text-xs text-indigo-400 hover:text-white bg-indigo-900/40 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(post)}
                    className="text-xs text-red-400 hover:text-white bg-red-900/30 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modal === 'create' && (
        <Modal title="New Post" onClose={() => setModal(null)} wide>
          <PostForm initial={EMPTY_POST} onSave={handleCreate} onClose={() => setModal(null)} saving={saving} />
        </Modal>
      )}

      {modal === 'edit' && editing && (
        <Modal title="Edit Post" onClose={() => { setModal(null); setEditing(null); }} wide>
          <PostForm initial={editing} onSave={handleEdit} onClose={() => { setModal(null); setEditing(null); }} saving={saving} />
        </Modal>
      )}

      {deleteTarget && (
        <Confirm
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default function PostsPage() {
  return <AdminGuard><PostsContent /></AdminGuard>;
}
