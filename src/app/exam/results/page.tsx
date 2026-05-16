import type { Metadata } from 'next';
import { ExamResultsContainer } from '@/features/exam-mode/ExamResultsContainer';

export const metadata: Metadata = {
  title: 'Exam Results – Clinio AI',
  description: 'Review your exam performance, score breakdown, and explanations for every question.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ExamResultsContainer />;
}
