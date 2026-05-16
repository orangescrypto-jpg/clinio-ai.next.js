'use client';

import { COLLECTIONS } from '@/lib/firebase';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Post {
  id: string;
  title: string;
  preview: string;
  content: string;
  imageUrl: string;
  topic: string;
  category: string;
  subCategory: string;
  author: string;
  readTime: string;
  hasVideo: boolean;
  videoUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
}


export const FeedContainer: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Read search + category from URL params
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${COLLECTIONS.posts}`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data.documents) {
        const mapped: Post[] = data.documents.map((doc: any) => {
          const f = doc.fields;
          return {
            id: doc.name.split('/').pop() as string,
            title: f.title?.stringValue || '',
            preview: f.preview?.stringValue || '',
            content: f.content?.stringValue || '',
            imageUrl: f.imageUrl?.stringValue || '',
            topic: f.topic?.stringValue || '',
            category: f.category?.stringValue || '',
            subCategory: f.subCategory?.stringValue || '',
            author: f.author?.stringValue || 'Clinio AI',
            readTime: f.readTime?.stringValue || '',
            hasVideo: f.hasVideo?.booleanValue || false,
            videoUrl: f.videoUrl?.stringValue || '',
            likes: Number(f.likes?.integerValue) || 0,
            comments: Number(f.comments?.integerValue) || 0,
            createdAt: f.createdAt?.stringValue || '',
          };
        });

        // Exclude scenario/practice posts (those belong to other sections)
        const generalPosts = mapped
          .filter(
            (p) =>
              p.topic !== 'Practice Mode' &&
              p.topic !== 'Practice Exam' &&
              p.subCategory !== 'OSCE' &&
              p.subCategory !== 'Clinical Scenario' &&
              p.topic !== 'Clinical Scenario',
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setAllPosts(generalPosts);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Failed to load posts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply search + category filters client-side (no extra network calls)
  const filteredPosts = useMemo(() => {
    let result = allPosts;

    if (categoryFilter) {
      result = result.filter(
        (p) =>
          p.category.toLowerCase() === categoryFilter.toLowerCase() ||
          p.topic.toLowerCase() === categoryFilter.toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.preview.toLowerCase().includes(q) ||
          p.topic.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allPosts, searchQuery, categoryFilter]);

  const clearFilters = () => router.push('/feed');

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return dateStr;
  };

  const isFiltered = !!searchQuery || !!categoryFilter;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl text-sm flex flex-col items-center gap-3 text-center">
          <span className="text-3xl">⚠️</span>
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">📚 Clinio Room</h2>
        <p className="text-gray-500 mt-1">Educational content for nursing and medical students</p>
      </div>

      {/* Active filter pills */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded-full text-sm font-medium">
              🔍 "{searchQuery}"
            </span>
          )}
          {categoryFilter && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              📂 {categoryFilter}
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 underline hover:text-gray-700 transition-colors"
          >
            Clear filters
          </button>
          <span className="text-xs text-gray-400">
            {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Posts list */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-4xl mb-4">{isFiltered ? '🔍' : '📝'}</p>
          <p className="text-gray-700 font-semibold mb-1">
            {isFiltered ? 'No posts match your search' : 'No posts yet'}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            {isFiltered
              ? 'Try different keywords or browse all posts'
              : 'Check back soon — new content is added regularly'}
          </p>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
            >
              Browse All Posts
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/feed/${post.id}`}
              className="card p-5 block hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                  {post.topic}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {post.category}
                </span>
                {post.hasVideo && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    🎬 Video
                  </span>
                )}
              </div>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                  loading="lazy"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{post.preview}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{post.readTime} · {formatDate(post.createdAt)}</span>
                <div className="flex items-center gap-3">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
