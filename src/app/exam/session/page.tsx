import type { Metadata } from 'next';
import { ExamSessionContainer } from '@/features/exam-mode/ExamSessionContainer';

export const metadata: Metadata = {
  title: 'Exam in Progress – Clinio AI',
  description: 'Your timed nursing exam is in progress. Stay focused!',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ExamSessionContainer />;
}
