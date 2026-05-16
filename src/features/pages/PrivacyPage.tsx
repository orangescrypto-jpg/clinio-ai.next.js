'use client';

import React from 'react';
import Link from 'next/link';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-400">Last updated: January 2026</p>
      </div>

      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
          <p>
            Clinio AI is designed to work without requiring user accounts. We may collect anonymous 
            usage data including quiz performance, pages visited, and time spent on the platform to 
            improve our services. No personally identifiable information is collected without your consent.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To improve question recommendations and adaptive learning</li>
            <li>To analyze platform performance and fix bugs</li>
            <li>To develop new features based on usage patterns</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Data Storage</h2>
          <p>
            Session data is stored locally on your device using localStorage. You can clear this 
            data at any time through your browser settings. Anonymous analytics data is stored 
            securely on our servers.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
          <p>
            We may use third-party services for analytics and content delivery (such as YouTube 
            for embedded videos). These services have their own privacy policies.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Contact</h2>
          <p>
            For privacy-related inquiries, contact us at <Link href="/contact" className="text-primary-600 hover:underline">our contact page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};
