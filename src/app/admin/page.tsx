'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/adminAuthContext';

// ── Login screen ──────────────────────────────────────────────────────────────

function LoginScreen() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Clinio AI Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage content</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl border border-gray-800 p-8 space-y-5">
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@clinio-ai.com"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          <Link href="/" className="hover:text-gray-400 transition-colors">← Back to Clinio AI</Link>
        </p>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    href: '/admin/posts',
    icon: '📝',
    label: 'Posts',
    description: 'Create, edit, and delete feed posts & articles',
    color: 'from-blue-600 to-blue-700',
    badge: 'Feed',
  },
  {
    href: '/admin/scenarios',
    icon: '🏥',
    label: 'Clinical Scenarios',
    description: 'Manage OSCE cases and clinical scenario content',
    color: 'from-green-600 to-green-700',
    badge: 'OSCE',
  },
  {
    href: '/admin/questions',
    icon: '❓',
    label: 'Questions',
    description: 'Add and edit MCQ questions for quizzes and exams',
    color: 'from-purple-600 to-purple-700',
    badge: 'MCQ',
  },
  {
    href: '/admin/categories',
    icon: '📂',
    label: 'Categories',
    description: 'Manage categories, sub-categories, and topics',
    color: 'from-orange-600 to-orange-700',
    badge: 'Taxonomy',
  },
];

function Dashboard() {
  const { user, logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏥</span>
          <span className="font-bold text-white">Clinio AI Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage all Clinio AI content from here.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {item.label}
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
                <span className="text-gray-600 group-hover:text-gray-300 transition-colors mt-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-3">🔐 Security reminder</h2>
          <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
            <li>Firebase security rules enforce auth on all write operations.</li>
            <li>Your session auto-refreshes; it expires after 1 hour of inactivity.</li>
            <li>Always sign out when done on shared devices.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

// ── Root export: shows login or dashboard ─────────────────────────────────────

export default function AdminPage() {
  const { user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginScreen />;
}
