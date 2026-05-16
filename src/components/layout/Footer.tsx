import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 w-full">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Clinio AI</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Smarter learning for healthcare professionals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/rapid-quiz" className="hover:text-primary-600 transition-colors">Rapid Quiz</Link></li>
              <li><Link href="/exam" className="hover:text-primary-600 transition-colors">Exam Mode</Link></li>
              <li><Link href="/scenarios" className="hover:text-primary-600 transition-colors">Clinical OSCE</Link></li>
              <li><Link href="/feed" className="hover:text-primary-600 transition-colors">Clinio Room</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-primary-600 transition-colors">About Clinio AI</Link></li>
              <li><Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/disclaimer" className="hover:text-primary-600 transition-colors">Disclaimer</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">© 2026 Clinio AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
