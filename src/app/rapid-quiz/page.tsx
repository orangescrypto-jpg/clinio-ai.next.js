import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RapidQuizContainer } from '@/features/rapid-quiz/RapidQuizContainer';

export const metadata: Metadata = {
  title: 'Rapid Quiz – Timed Nursing MCQ Practice',
  description:
    'Practice nursing and medical MCQs with timed rapid quizzes. Choose by topic, category, or mixed mode. Instant feedback and detailed explanations after every question.',
  alternates: { canonical: '/rapid-quiz' },
  openGraph: {
    title: 'Rapid Quiz – Timed Nursing MCQ Practice | Clinio AI',
    description:
      'Timed nursing MCQ practice with instant feedback. Choose NCLEX, NMCN, pharmacology, anatomy, and more.',
    url: '/rapid-quiz',
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading...</div>}>
      <RapidQuizContainer />
    </Suspense>
  );
}
