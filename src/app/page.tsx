import type { Metadata } from 'next';
import { HomePage } from '@/features/home/HomePage';

export const metadata: Metadata = {
  title: 'Free Nursing & Medical Exam Practice – Clinio AI',
  description:
    'Practice NCLEX, NMCN, and clinical nursing exams for free. Rapid quizzes, full exam simulations, OSCE scenarios, and expert study guides. No account needed.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Free Nursing & Medical Exam Practice – Clinio AI',
    description:
      'Practice NCLEX, NMCN, and clinical nursing exams for free. Rapid quizzes, full exam simulations, OSCE scenarios.',
    url: '/',
  },
};

export default function Page() {
  return <HomePage />;
}
