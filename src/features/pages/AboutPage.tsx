'use client';

import React from 'react';
import Link from 'next/link';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Clinio AI</h1>
        <p className="text-lg text-gray-500">Empowering the next generation of healthcare professionals.</p>
      </div>

      <div className="space-y-6 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h2>
          <p>
            Clinio AI is an AI-powered learning platform designed specifically for nursing and medical students. 
            Our mission is to make clinical education accessible, effective, and engaging through technology.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">What We Offer</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Rapid Quiz Mode</strong> — Timed MCQs with instant clinical explanations</li>
            <li><strong>Exam Mode</strong> — Full NCLEX, NMCN, and medical exam simulations</li>
            <li><strong>Clinical OSCE Scenarios</strong> — Step-by-step patient case simulations</li>
            <li><strong>Clinio Room</strong> — Educational content, video lessons, and peer discussions</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Who We Serve</h2>
          <p>
            Clinio AI serves nursing students, medical students, and healthcare trainees preparing for 
            licensing examinations including NCLEX-RN, NMCN, USMLE, and other professional certifications.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Why Clinio AI?</h2>
          <p>
            Traditional study methods are time-consuming and lack personalization. Clinio AI uses 
            intelligent question selection, instant feedback, and performance analytics to help you 
            study smarter — not just harder.
          </p>
        </div>
      </div>
    </div>
  );
};
