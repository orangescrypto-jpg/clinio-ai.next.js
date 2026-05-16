import type { Metadata } from 'next';
import { PrivacyPage } from '@/features/pages/PrivacyPage';

export const metadata: Metadata = {
  title: 'Privacy Policy – Clinio AI',
  description: 'Read the Clinio AI privacy policy. We take your privacy seriously and do not sell your data.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: false },
};

export default function Page() { return <PrivacyPage />; }
