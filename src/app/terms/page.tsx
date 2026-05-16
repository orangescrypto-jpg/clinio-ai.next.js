import type { Metadata } from 'next';
import { TermsPage } from '@/features/pages/TermsPage';

export const metadata: Metadata = {
  title: 'Terms of Service – Clinio AI',
  description: 'Review the Clinio AI terms of service governing your use of the platform.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: false },
};

export default function Page() { return <TermsPage />; }
