'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-500">Have questions or feedback? We'd love to hear from you.</p>
      </div>

      {submitted ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">✅</p>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
          <p className="text-gray-500">Thank you for reaching out. We'll get back to you within 24 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required className="input-field" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="input-field" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" required className="input-field" placeholder="How can we help?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea required rows={5} className="input-field" placeholder="Tell us more..." />
          </div>
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center p-5">
          <p className="text-2xl mb-2">📧</p>
          <p className="font-medium text-gray-900">Email</p>
          <p className="text-sm text-gray-500">hello@clinioai.com</p>
        </div>
        <div className="card text-center p-5">
          <p className="text-2xl mb-2">🐦</p>
          <p className="font-medium text-gray-900">Twitter</p>
          <p className="text-sm text-gray-500">@ClinioAI</p>
        </div>
        <div className="card text-center p-5">
          <p className="text-2xl mb-2">💬</p>
          <p className="font-medium text-gray-900">Discord</p>
          <p className="text-sm text-gray-500">Join our community</p>
        </div>
      </div>
    </div>
  );
};
