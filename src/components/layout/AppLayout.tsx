'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

const sidebarLinks = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/rapid-quiz', icon: '⚡', label: 'Rapid Quiz' },
  { to: '/scenarios', icon: '🏥', label: 'Clinical OSCE' },
  { to: '/feed', icon: '📚', label: 'Clinio Room' },
  { to: '/exam', icon: '📝', label: 'Exam Mode' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🩺</span>
          <h1 className="text-lg font-bold text-primary-600">Clinio AI</h1>
        </Link>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-200 z-40">
          <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-200">
            <span className="text-2xl">🩺</span>
            <div>
              <h1 className="text-xl font-bold text-primary-600">Clinio AI</h1>
              <p className="text-xs text-gray-400">Clinical Learning &amp; Exam Training</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.to
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">For Nursing &amp; Medical Students</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="md:ml-64 flex flex-col flex-1 min-h-screen">
          <main
            className={`flex-1 pb-20 md:pb-8 ${
              isHome ? '' : 'max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6'
            }`}
          >
            {children}
          </main>
          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
