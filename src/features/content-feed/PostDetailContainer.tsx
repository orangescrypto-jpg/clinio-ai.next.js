'use client';

import { COLLECTIONS } from '@/lib/firebase';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShareButtons } from '@/components/ui/ShareButtons';

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
  relatedQuiz: string;
  likes: number;
  comments: number;
  createdAt: string;
}

interface Comment {
  id: string;
  postId: string;
  name: string;
  message: string;
  timestamp: string;
}


export const PostDetailContainer: React.FC = () => {
  const params = useParams<{ postId: string }>();
  const postId = params?.postId;
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${COLLECTIONS.posts}/${postId}`);
      if (!response.ok) { setPost(null); setLoading(false); return; }
      const data = await response.json();
      const f = data.fields;
      setPost({
        id: postId!,
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
        relatedQuiz: f.relatedQuiz?.stringValue || '',
        likes: f.likes?.integerValue || 0,
        comments: f.comments?.integerValue || 0,
        createdAt: f.createdAt?.stringValue || '',
      });
    } catch (err) { console.error('Failed to load post:', err); setPost(null); }
    finally { setLoading(false); }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${COLLECTIONS.comments}`);
      const data = await response.json();
      if (data.documents) {
        const allComments = data.documents.map((doc: any) => {
          const f = doc.fields;
          return {
            id: doc.name.split('/').pop(),
            postId: f.postId?.stringValue || '',
            name: f.name?.stringValue || '',
            message: f.message?.stringValue || '',
            timestamp: f.timestamp?.stringValue || '',
          };
        });
        setComments(allComments.filter((c: Comment) => c.postId === postId));
      }
    } catch (err) { console.error('Failed to load comments:', err); }
    finally { setLoadingComments(false); }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    setSubmittingComment(true);
    setCommentError('');
    e.preventDefault();
    if (!newName.trim() || !newMessage.trim()) return;
    try {
      await fetch(`${COLLECTIONS.comments}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            postId: { stringValue: postId || '' },
            name: { stringValue: newName.trim() },
            message: { stringValue: newMessage.trim() },
            timestamp: { stringValue: new Date().toISOString() },
          },
        }),
      });
      setNewName('');
      setNewMessage('');
      fetchComments();
    } catch (err) { console.error('Failed to save comment:', err); setCommentError('Failed to post comment. Please try again.'); } finally { setSubmittingComment(false); }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent mx-auto"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 px-4">
        <p className="text-5xl mb-4">📝</p>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Post Not Found</h3>
        <p className="text-gray-500 text-sm mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => router.push('/feed')} className="btn-secondary text-sm">← Back to Clinio Room</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 px-0 sm:px-4">
      <button onClick={() => router.push('/feed')} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 py-2 -ml-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Clinio Room
      </button>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-medium border border-primary-100">{post.topic}</span>
          <span className="inline-block text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full font-medium border border-gray-100">{post.category}</span>
          {post.hasVideo && <span className="inline-block text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium border border-red-100">🎬 Video</span>}
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-400">
          <span>{post.author}</span><span className="hidden sm:inline">·</span><span>{post.readTime}</span><span className="hidden sm:inline">·</span><span>{post.createdAt}</span>
          {post.subCategory && (<><span className="hidden sm:inline">·</span><span>{post.subCategory}</span></>)}
        </div>
      </div>

      {post.imageUrl && (
        <div className="-mx-4 sm:mx-0">
          <img src={post.imageUrl} alt={post.title} className="w-full h-48 sm:h-64 md:h-80 object-cover sm:rounded-xl" loading="lazy" />
        </div>
      )}

      {post.hasVideo && post.videoUrl && (
        <div className="-mx-4 sm:mx-0">
          <div className="aspect-video bg-black sm:rounded-xl overflow-hidden">
            <iframe src={post.videoUrl} title="Video lesson" className="w-full h-full" allowFullScreen loading="lazy" />
          </div>
        </div>
      )}

      <div className="bg-white sm:rounded-xl sm:border sm:border-gray-100 -mx-4 sm:mx-0 px-4 sm:px-6 py-5 sm:py-8">
        <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base sm:prose-h3:text-lg prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed prose-li:text-sm sm:prose-li:text-base prose-strong:text-gray-900 [&_h2]:border-b [&_h2]:border-gray-100 [&_h2]:pb-2"
          dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {post.relatedQuiz && (
        <Link href={`/rapid-quiz?topic=${encodeURIComponent(post.relatedQuiz)}`} className="flex items-center justify-between p-4 sm:p-5 bg-primary-50 border-2 border-primary-200 rounded-xl hover:bg-primary-100 transition-colors -mx-4 sm:mx-0">
          <div><p className="font-semibold text-primary-700 text-sm sm:text-base">📝 Try Related Quiz</p><p className="text-xs sm:text-sm text-primary-500 mt-0.5">Test your knowledge on {post.relatedQuiz}</p></div>
          <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      )}

      {/* Share Buttons */}
      <div className="py-3 -mx-4 sm:mx-0">
        <ShareButtons 
          title={post.title}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          summary={post.preview}
        />
      </div>

      <div className="border-t border-gray-200 pt-2" />

      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">💬 Comments <span className="text-sm font-normal text-gray-400">({comments.length})</span></h3>

        <form onSubmit={handleAddComment} className="space-y-3 bg-white rounded-xl border border-gray-100 p-4 sm:p-5 -mx-4 sm:mx-0">
          <input type="text" placeholder="Your name" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required />
          <textarea placeholder="Write a comment..." value={newMessage} onChange={e => setNewMessage(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" rows={3} required />
          {commentError && <p className="text-sm text-red-600">{commentError}</p>}
          <button type="submit" disabled={submittingComment} className="w-full sm:w-auto bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50">{submittingComment ? 'Posting2026' : 'Post Comment'}</button>
        </form>

        {loadingComments ? (
          <p className="text-sm text-gray-400 text-center py-4">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 -mx-4 sm:mx-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{comment.name}</span>
                  <span className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pb-20 sm:pb-8" />
    </div>
  );
};
