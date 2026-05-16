import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FeedContainer } from '@/features/content-feed/FeedContainer';

export const metadata: Metadata = {
  title: 'Clinio Room – Nursing Study Guides & Medical Posts',
  description:
    'Browse expert-written nursing study guides, medical education articles, pharmacology notes, and video resources. Updated regularly for NCLEX and NMCN students.',
  alternates: { canonical: '/feed' },
  openGraph: {
    title: 'Clinio Room – Nursing Study Guides & Medical Posts | Clinio AI',
    description:
      'Expert nursing study guides, pharmacology notes, NCLEX tips, and video resources.',
    url: '/feed',
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading...</div>}>
      <FeedContainer />
    </Suspense>
  );
}
