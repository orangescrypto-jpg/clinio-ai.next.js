'use client';

import { COLLECTIONS } from '@/lib/firebase';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

interface Topic {
  id: string;
  subCategoryId: string;
  name: string;
  description: string;
  questionCount: number;
}

interface LiveStats {
  questions: number;
  categories: number;
}

const features = [
  {
    title: 'Rapid Quiz',
    icon: '⚡',
    description: 'Timed questions with instant feedback and detailed explanations',
    link: '/rapid-quiz',
    accent: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
    hoverBorder: '#fb923c',
  },
  {
    title: 'Clinical OSCE',
    icon: '🏥',
    description: 'Step-by-step patient case simulations with clinical reasoning',
    link: '/scenarios',
    accent: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    hoverBorder: '#4ade80',
  },
  {
    title: 'Clinio Room',
    icon: '📚',
    description: 'Educational content, videos, and peer discussions',
    link: '/feed',
    accent: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    hoverBorder: '#60a5fa',
  },
  {
    title: 'Exam Mode',
    icon: '📝',
    description: 'Full exam simulation with performance breakdown and analytics',
    link: '/exam',
    accent: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    hoverBorder: '#f87171',
  },
];

const categoryLinks = [
  { icon: '🏥', label: 'Clinical Medicine', desc: 'Core clinical knowledge', category: 'Clinical Medicine' },
  { icon: '🩺', label: 'NCLEX Practice', desc: 'US/Canada exam prep', category: 'NCLEX' },
  { icon: '🇳🇬', label: 'NMCN Exam Prep', desc: 'Nigeria council exam', category: 'NMCN' },
  { icon: '📋', label: 'Nursing Care Plans', desc: 'Comprehensive guides', category: 'Clinical Medicine' },
  { icon: '💊', label: 'Pharmacology', desc: 'Drug study guides', category: 'NCLEX' },
  { icon: '🧠', label: 'Study Guides', desc: 'Nursing fundamentals', category: 'NMCN' },
];


const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse shadow-sm">
    <div className="h-44 bg-gradient-to-r from-gray-100 to-gray-200" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 bg-gray-100 rounded-full w-16" />
        <div className="h-5 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-5 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

const EmptyState = ({
  icon, title, subtitle, linkTo, linkLabel,
}: {
  icon: string; title: string; subtitle: string; linkTo: string; linkLabel: string;
}) => (
  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
    <span className="text-5xl block mb-4">{icon}</span>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">{subtitle}</p>
    <Link href={linkTo} className="btn-primary inline-flex">{linkLabel} →</Link>
  </div>
);

const ErrorBanner = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 gap-4">
    <div className="flex items-center gap-2">
      <span className="text-xl">⚠️</span>
      <div>
        <p className="font-medium text-amber-800 text-sm">Could not load latest content</p>
        <p className="text-amber-600 text-xs mt-0.5">Please check your connection and try again</p>
      </div>
    </div>
    <button
      onClick={onRetry}
      className="text-sm font-semibold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
    >
      Retry
    </button>
  </div>
);

const SectionHeader = ({
  title, subtitle, linkTo, linkLabel,
  linkColor = 'text-primary-600 hover:text-primary-700',
}: {
  title: string; subtitle: string; linkTo: string; linkLabel: string; linkColor?: string;
}) => (
  <div className="flex items-start justify-between mb-6 gap-4">
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-500 mt-1 text-sm md:text-base">{subtitle}</p>
    </div>
    <Link
      href={linkTo}
      className={`hidden sm:inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 mt-1 transition-colors ${linkColor}`}
    >
      {linkLabel} <span>→</span>
    </Link>
  </div>
);

const PostCard = ({
  post, accentClass, tagLabel, tagColorClass, ctaLabel, formatDate,
}: {
  post: Post; accentClass: string; tagLabel: string; tagColorClass: string;
  ctaLabel: string; formatDate: (d: string) => string;
}) => (
  <Link
    href={`/feed/${post.id}`}
    className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col border-l-4 ${accentClass}`}
  >
    {post.imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={post.imageUrl} alt={post.title} className="w-full h-44 object-cover" loading="lazy" />
    ) : (
      <div className="w-full h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-5xl opacity-60">📄</span>
      </div>
    )}
    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${tagColorClass}`}>
          {tagLabel}
        </span>
        {post.category && (
          <span className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full font-medium border border-gray-100">
            {post.category}
          </span>
        )}
        {post.hasVideo && (
          <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium border border-red-100">
            🎬 Video
          </span>
        )}
      </div>
      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{post.preview}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
        <span>{formatDate(post.createdAt)}</span>
        <span className="font-semibold text-primary-600 group-hover:underline">{ctaLabel} →</span>
      </div>
    </div>
  </Link>
);

const StatCard = ({
  number, label, icon, loading,
}: {
  number: string; label: string; icon: string; loading?: boolean;
}) => (
  <div className="text-center">
    <span className="text-2xl block mb-1">{icon}</span>
    {loading ? (
      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
    ) : (
      <p className="text-2xl md:text-3xl font-extrabold text-primary-600 leading-none">{number}</p>
    )}
    <p className="text-xs md:text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

export function HomePage() {
  const router = useRouter();
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [scenarioPosts, setScenarioPosts] = useState<Post[]>([]);
  const [practicePosts, setPracticePosts] = useState<Post[]>([]);
  const [quizTopics, setQuizTopics] = useState<Topic[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [loadingPractice, setLoadingPractice] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllPosts = async (): Promise<Post[]> => {
    const response = await fetch(`${COLLECTIONS.posts}`);
    if (!response.ok) throw new Error(`Posts fetch failed: ${response.status}`);
    const data = await response.json();
    if (!data.documents) return [];
    return data.documents.map((doc: Record<string, any>) => {
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
  };

  const fetchTopicsRaw = async (): Promise<Topic[]> => {
    const response = await fetch(`${COLLECTIONS.topics}`);
    if (!response.ok) throw new Error(`Topics fetch failed: ${response.status}`);
    const data = await response.json();
    if (!data.documents) return [];
    return data.documents.map((doc: Record<string, any>) => {
      const f = doc.fields;
      return {
        id: doc.name.split('/').pop(),
        subCategoryId: f.subCategoryId?.stringValue || '',
        name: f.name?.stringValue || '',
        description: f.description?.stringValue || '',
        questionCount: Number(
          f.questionCount?.integerValue || f.questionCount?.doubleValue || 0
        ),
      };
    });
  };

  const fetchCategoriesRaw = async (): Promise<number> => {
    const response = await fetch(`${COLLECTIONS.categories}`);
    if (!response.ok) throw new Error(`Categories fetch failed: ${response.status}`);
    const data = await response.json();
    return data.documents?.length ?? 0;
  };

  const processPosts = (all: Post[]) => {
    const general = all
      .filter(
        (p) =>
          p.topic !== 'Practice Mode' &&
          p.topic !== 'Practice Exam' &&
          p.subCategory !== 'OSCE' &&
          p.subCategory !== 'Clinical Scenario' &&
          p.topic !== 'Clinical Scenario'
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 9);

    const scenarios = all
      .filter(
        (p) =>
          p.subCategory === 'OSCE' ||
          p.subCategory === 'Clinical Scenario' ||
          p.topic === 'Clinical Scenario'
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6);

    const practice = all
      .filter(
        (p) =>
          p.topic === 'Practice Mode' ||
          p.topic === 'Practice Exam' ||
          p.subCategory === 'Practice Mode' ||
          p.title?.toLowerCase().includes('practice exam')
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6);

    setLatestPosts(general);
    setScenarioPosts(scenarios);
    setPracticePosts(practice);
    setLoadingPosts(false);
    setLoadingScenarios(false);
    setLoadingPractice(false);
  };

  const fetchAllData = useCallback(async () => {
    setFetchError(false);
    setLoadingPosts(true);
    setLoadingScenarios(true);
    setLoadingPractice(true);
    setLoadingTopics(true);
    setLoadingStats(true);

    try {
      const [allPosts, allTopics, categoryCount] = await Promise.all([
        fetchAllPosts(),
        fetchTopicsRaw(),
        fetchCategoriesRaw(),
      ]);

      processPosts(allPosts);

      const topTopics = allTopics
        .filter((t) => t.questionCount > 0)
        .sort((a, b) => b.questionCount - a.questionCount)
        .slice(0, 10);
      setQuizTopics(topTopics);
      setLoadingTopics(false);

      const totalQuestions = allTopics.reduce((sum, t) => sum + t.questionCount, 0);
      setLiveStats({ questions: totalQuestions, categories: categoryCount });
      setLoadingStats(false);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
      setFetchError(true);
      setLoadingPosts(false);
      setLoadingScenarios(false);
      setLoadingPractice(false);
      setLoadingTopics(false);
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const formatDate = (dateStr: string): string => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/feed?category=${encodeURIComponent(category)}`);
  };

  const handleTopicQuizClick = (topicName: string) => {
    router.push(`/rapid-quiz?topic=${encodeURIComponent(topicName)}`);
  };

  const stats = [
    {
      number: liveStats ? (liveStats.questions > 0 ? `${liveStats.questions}+` : '—') : '…',
      label: 'Practice Questions',
      icon: '📝',
    },
    {
      number: liveStats ? (liveStats.categories > 0 ? String(liveStats.categories) : '—') : '…',
      label: 'Exam Categories',
      icon: '📂',
    },
    { number: '100%', label: 'Free Access', icon: '🎓' },
    { number: '24/7', label: 'Always Available', icon: '🌐' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block bg-white/15 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
              🩺 For Nursing &amp; Medical Students
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
              Ace Your Nursing Exams<br />
              <span className="text-blue-200">With Clinio AI</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Practice questions, clinical scenarios, and study guides — all in one place. 100% free, no login required.
            </p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8" role="search">
              <div className="flex items-center bg-white rounded-xl shadow-xl overflow-hidden ring-2 ring-white/20 focus-within:ring-white/50 transition-all">
                <label htmlFor="hero-search" className="sr-only">Search topics or questions</label>
                <input
                  id="hero-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics, questions, or study guides..."
                  className="flex-1 px-5 py-4 text-gray-900 text-base bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-4 font-semibold transition-colors shrink-0"
                >
                  🔍 Search
                </button>
              </div>
            </form>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/rapid-quiz" className="bg-white text-primary-700 px-7 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-lg text-sm md:text-base">
                ⚡ Start Practice Quiz
              </Link>
              <Link href="/exam" className="bg-white/10 border border-white/30 text-white px-7 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors text-sm md:text-base">
                📝 Take Full Exam
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                number={stat.number}
                label={stat.label}
                icon={stat.icon}
                loading={loadingStats && (stat.label === 'Practice Questions' || stat.label === 'Exam Categories')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {fetchError && <ErrorBanner onRetry={fetchAllData} />}

        {/* Feature Cards */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">How Clinio AI Works</h2>
            <p className="text-gray-500">Choose your study mode and start learning immediately</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.link}
                style={{ background: feature.bg, borderColor: feature.border }}
                className="group p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm"
                  style={{ background: feature.accent + '22' }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                <span className="mt-4 inline-block text-xs font-bold" style={{ color: feature.accent }}>
                  Get Started →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Explore by Category</h2>
            <p className="text-gray-500">Tap to browse study material in each area</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryLinks.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.category)}
                aria-label={`Browse ${cat.label}`}
                className="group text-center p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span className="text-3xl block mb-2">{cat.icon}</span>
                <p className="text-sm font-bold text-gray-800 group-hover:text-primary-600 transition-colors leading-tight">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-1">{cat.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Clinical Scenarios */}
        <section>
          <SectionHeader
            title="🏥 Clinical Scenarios (OSCE)"
            subtitle="Step-by-step patient case simulations for clinical reasoning"
            linkTo="/scenarios"
            linkLabel="View All Scenarios"
            linkColor="text-green-600 hover:text-green-700"
          />
          {loadingScenarios ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : scenarioPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarioPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    accentClass="border-l-green-500"
                    tagLabel="OSCE"
                    tagColorClass="bg-green-50 text-green-700 border-green-100"
                    ctaLabel="Start Scenario"
                    formatDate={formatDate}
                  />
                ))}
              </div>
              <div className="text-center mt-6 sm:hidden">
                <Link href="/scenarios" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                  View All Scenarios →
                </Link>
              </div>
            </>
          ) : (
            <EmptyState icon="🏥" title="Clinical scenarios coming soon" subtitle="Check back soon — new OSCE cases are being added regularly" linkTo="/rapid-quiz" linkLabel="Try Rapid Quiz Instead" />
          )}
        </section>

        {/* Practice Exams */}
        <section>
          <SectionHeader
            title="📝 Practice Exams"
            subtitle="Self-paced practice with instant feedback and detailed rationales"
            linkTo="/practice-exams"
            linkLabel="View All Exams"
            linkColor="text-blue-600 hover:text-blue-700"
          />
          {loadingPractice ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : practicePosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {practicePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    accentClass="border-l-blue-500"
                    tagLabel="Practice Mode"
                    tagColorClass="bg-blue-50 text-blue-700 border-blue-100"
                    ctaLabel="Start Practice"
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon="📝" title="Practice exams coming soon" subtitle="Full-length practice exams with rationales will be available soon" linkTo="/exam" linkLabel="Try Exam Mode" />
          )}
        </section>

        {/* Latest Posts */}
        <section>
          <SectionHeader
            title="📚 Latest Study Guides & Posts"
            subtitle="Expert-written content for nursing and medical students"
            linkTo="/feed"
            linkLabel="View All Posts"
          />
          {loadingPosts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : latestPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    accentClass="border-l-primary-400"
                    tagLabel={post.topic || 'Study Guide'}
                    tagColorClass="bg-primary-50 text-primary-700 border-primary-100"
                    ctaLabel="Read More"
                    formatDate={formatDate}
                  />
                ))}
              </div>
              {latestPosts.length >= 9 && (
                <div className="text-center mt-10">
                  <Link href="/feed" className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-md">
                    Browse All Study Guides →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <EmptyState icon="📖" title="No posts yet" subtitle="Study guides and posts will appear here — check back soon!" linkTo="/rapid-quiz" linkLabel="Start Practicing" />
          )}
        </section>

        {/* Popular Quiz Topics */}
        <section>
          <SectionHeader
            title="⚡ Popular Quiz Topics"
            subtitle="Practice with our most popular question sets"
            linkTo="/rapid-quiz"
            linkLabel="Start a Quiz"
          />
          {loadingTopics ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-2">
                  <div className="h-5 bg-gray-100 rounded-full w-16" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : quizTopics.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {quizTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicQuizClick(topic.name)}
                    aria-label={`Start quiz on ${topic.name}`}
                    className="bg-white rounded-2xl border-2 border-gray-100 p-4 text-left hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <span className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-bold">
                      {topic.questionCount} Qs
                    </span>
                    <h4 className="font-bold text-gray-900 mt-2.5 text-sm leading-snug">{topic.name}</h4>
                    {topic.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{topic.description}</p>
                    )}
                  </button>
                ))}
              </div>
              {quizTopics.length >= 10 && (
                <div className="text-center mt-8">
                  <Link href="/rapid-quiz" className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-md">
                    Explore All Quiz Topics →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <EmptyState icon="⚡" title="Quiz topics coming soon" subtitle="Question sets across all nursing topics will be available here" linkTo="/rapid-quiz" linkLabel="Go to Rapid Quiz" />
          )}
        </section>

        {/* Final CTA */}
        <section>
          <div className="bg-gradient-to-r from-primary-700 to-blue-700 rounded-3xl p-8 md:p-14 text-white text-center relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
            <div className="relative z-10">
              <span className="text-4xl block mb-4">🎓</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Ready to Ace Your Nursing Exams?</h2>
              <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
                Join thousands of nursing students using Clinio AI. Practice smarter, not harder — 100% free, no account needed.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/rapid-quiz" className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-lg">
                  ⚡ Start Practicing Now
                </Link>
                <Link href="/feed" className="bg-white/10 border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition-colors">
                  📚 Browse Study Guides
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
