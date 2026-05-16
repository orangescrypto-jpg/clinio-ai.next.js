'use client';

import { COLLECTIONS } from '@/lib/firebase';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  preview: string;
  topic: string;
  category: string;
  subCategory: string;
  readTime: string;
  createdAt: string;
  hasVideo: boolean;
  imageUrl: string;
}


const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-44 bg-gradient-to-r from-gray-100 to-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-100 rounded-full w-20" />
      <div className="h-5 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
    </div>
  </div>
);

export const PracticeExamsContainer: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPracticeExams();
  }, []);

  const fetchPracticeExams = async () => {
    setError(false);
    setLoading(true);
    try {
      const response = await fetch(`${COLLECTIONS.posts}`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      if (data.documents) {
        const allPosts = data.documents.map((doc: any) => {
          const f = doc.fields;
          return {
            id: doc.name.split('/').pop(),
            title: f.title?.stringValue || '',
            preview: f.preview?.stringValue || '',
            topic: f.topic?.stringValue || '',
            category: f.category?.stringValue || '',
            subCategory: f.subCategory?.stringValue || '',
            readTime: f.readTime?.stringValue || '',
            createdAt: f.createdAt?.stringValue || '',
            hasVideo: f.hasVideo?.booleanValue || false,
            imageUrl: f.imageUrl?.stringValue || '',
          };
        });

        const practicePosts = allPosts
          .filter((p: any) =>
            p.topic === 'Practice Mode' ||
            p.topic === 'Practice Exam' ||
            p.subCategory === 'Practice Mode' ||
            (p.title && (
              p.title.toLowerCase().includes('practice exam') ||
              p.title.toLowerCase().includes('practice mode')
            ))
          )
          .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));

        setPosts(practicePosts);
      }
    } catch (err) {
      console.error('Failed to load practice exams:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Recently added';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently added';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">📝 Practice Exams</h2>
        <p className="text-gray-500 mt-1">Self-paced practice with instant feedback and detailed rationales</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-amber-50 rounded-2xl border border-amber-200">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-amber-800 font-semibold">Could not load practice exams</p>
          <p className="text-amber-600 text-sm mt-1 mb-4">Please check your connection and try again</p>
          <button
            onClick={fetchPracticeExams}
            className="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-lg font-semibold text-gray-700">Practice exams coming soon</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Full practice exam sets with rationales are being added regularly</p>
          <Link href="/exam" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm">
            Try Exam Mode Instead →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/feed/${post.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 border-l-4 border-l-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
            >
              {post.imageUrl ? (
                <img src={post.imageUrl} alt={post.title} className="w-full h-44 object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <span className="text-5xl opacity-70">📝</span>
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold border border-blue-100">Practice Mode</span>
                  {post.category && (
                    <span className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full font-medium border border-gray-100">{post.category}</span>
                  )}
                  {post.hasVideo && (
                    <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium border border-red-100">🎬 Video</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors flex-1">
                  {post.title}
                </h3>
                {post.preview && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{post.preview}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
                  <span>{post.readTime || '5 min'} · {formatDate(post.createdAt)}</span>
                  <span className="text-blue-600 font-semibold group-hover:underline">Start Practice →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
