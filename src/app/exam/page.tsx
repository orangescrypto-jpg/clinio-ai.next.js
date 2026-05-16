import type { Metadata } from 'next';
import { ExamSetupContainer } from '@/features/exam-mode/ExamSetupContainer';

export const metadata: Metadata = {
  title: 'Exam Mode – Full Nursing Exam Simulation',
  description:
    'Simulate a real nursing or medical board exam. Timed questions, question flagging, and detailed performance analytics. Perfect NCLEX and NMCN preparation.',
  alternates: { canonical: '/exam' },
  openGraph: {
    title: 'Exam Mode – Full Nursing Exam Simulation | Clinio AI',
    description:
      'Full timed nursing board exam simulation with analytics. NCLEX and NMCN preparation.',
    url: '/exam',
  },
};

export default function Page() {
  return <ExamSetupContainer />;
}
