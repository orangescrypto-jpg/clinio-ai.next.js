import type { Metadata } from 'next';
import { AboutPage } from '@/features/pages/AboutPage';

export const metadata: Metadata = {
  title: 'About Clinio AI – Our Mission',
  description:
    'Learn about Clinio AI, a free clinical learning platform built for nursing and medical students. Our mission is to make high-quality exam preparation accessible to everyone.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About Clinio AI – Our Mission', url: '/about' },
};

export default function Page() { return <AboutPage />; }
