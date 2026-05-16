import type { Metadata } from 'next';
import { PracticeExamsContainer } from '@/features/practice-exams/PracticeExamsContainer';

export const metadata: Metadata = {
  title: 'Practice Exams – Self-Paced Nursing Exam Practice',
  description:
    'Self-paced nursing practice exams with instant feedback and detailed explanations. Covers NCLEX, NMCN, pharmacology, medical-surgical, paediatrics, and more.',
  alternates: { canonical: '/practice-exams' },
  openGraph: {
    title: 'Practice Exams – Self-Paced Nursing Exam Practice | Clinio AI',
    description: 'Self-paced nursing practice exams with instant feedback and detailed rationales.',
    url: '/practice-exams',
  },
};

export default function Page() {
  return <PracticeExamsContainer />;
}
