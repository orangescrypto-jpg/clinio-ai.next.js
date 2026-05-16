import type { Metadata } from 'next';
import { ContactPage } from '@/features/pages/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us – Clinio AI',
  description: 'Get in touch with the Clinio AI team. We welcome feedback, bug reports, and partnership enquiries.',
  alternates: { canonical: '/contact' },
};

export default function Page() { return <ContactPage />; }
