'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/rapid-quiz', icon: '⚡', label: 'Quiz' },
  { to: '/feed', icon: '📚', label: 'Clinico' },
  { to: '/exam', icon: '📝', label: 'Exam' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
