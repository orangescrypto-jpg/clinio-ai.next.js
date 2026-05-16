import type { Metadata } from 'next';
import { DisclaimerPage } from '@/features/pages/DisclaimerPage';

export const metadata: Metadata = {
  title: 'Medical Disclaimer – Clinio AI',
  description:
    'Important medical disclaimer for Clinio AI. Content is for educational purposes only and does not constitute medical or clinical advice.',
  alternates: { canonical: '/disclaimer' },
};

export default function Page() { return <DisclaimerPage />; }
