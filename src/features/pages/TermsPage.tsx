'use client';

import React from 'react';
import Link from 'next/link';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-400">Last updated: January 2026</p>
      </div>

      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Clinio AI, you agree to be bound by these Terms of Service. 
            If you do not agree, please do not use our platform.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Educational Purpose</h2>
          <p>
            Clinio AI is an educational tool designed to support learning. The content provided 
            is for informational purposes only and should not be considered medical advice. 
            Always consult qualified healthcare professionals for clinical decisions.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. User Conduct</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Do not misuse or attempt to manipulate quiz/exam results</li>
            <li>Do not post inappropriate content in comments</li>
            <li>Respect other users in discussions</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Intellectual Property</h2>
          <p>
            All content, questions, and materials on Clinio AI are protected by copyright. 
            You may not reproduce, distribute, or sell our content without permission.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Limitation of Liability</h2>
          <p>
            Clinio AI is provided "as is" without warranties. We strive for accuracy but 
            cannot guarantee all content is error-free. We are not liable for any damages 
            arising from the use of our platform.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Continued use of the 
            platform after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
};
