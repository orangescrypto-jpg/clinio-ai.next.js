'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/adminAuthContext';

// ── Auth guard – redirects to login if not authenticated ──────────────────────

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-4">
        <p className="text-gray-400">You must be signed in to access this page.</p>
        <Link href="/admin" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Page header with breadcrumb & sign-out ────────────────────────────────────

interface AdminHeaderProps {
  title: string;
  breadcrumb?: string;
}

export function AdminHeader({ title, breadcrumb }: AdminHeaderProps) {
  const { user, logout } = useAdminAuth();

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
            🏥 Admin
          </Link>
          <span className="text-gray-700">/</span>
          {breadcrumb && (
            <>
              <Link href={`/admin/${breadcrumb.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors capitalize">
                {breadcrumb}
              </Link>
              <span className="text-gray-700">/</span>
            </>
          )}
          <span className="text-white font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ title, onClose, children, wide }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div
        className={`bg-gray-900 border border-gray-700 rounded-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────

interface ConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function Confirm({ message, onConfirm, onCancel, danger }: ConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
        <p className="text-white mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              danger
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form field helpers ────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

export const inputCls =
  'w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

export const selectCls = inputCls;

// ── Status badge ──────────────────────────────────────────────────────────────

export function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
        ok ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
      }`}
    >
      {label}
    </span>
  );
}

// ── Toast notification ────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export function Toast({ message, type }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-fade-in ${
        type === 'success'
          ? 'bg-green-700 text-white'
          : 'bg-red-700 text-white'
      }`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}
