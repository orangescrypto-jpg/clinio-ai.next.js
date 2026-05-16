import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Providers } from './providers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://clinio-ai.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Clinio AI – Free Nursing & Medical Exam Practice',
    template: '%s | Clinio AI',
  },
  description:
    'Free nursing and medical exam practice platform. Rapid Quiz, NCLEX prep, NMCN exam practice, Clinical OSCE scenarios, Exam Mode, and study guides — no account needed.',
  keywords: [
    'nursing exam practice',
    'NCLEX practice questions',
    'NMCN exam prep',
    'medical MCQ',
    'clinical OSCE',
    'nursing quiz',
    'free nursing study',
    'medical student quiz',
    'rapid quiz nursing',
    'clinio ai',
  ],
  authors: [{ name: 'Clinio AI' }],
  creator: 'Clinio AI',
  publisher: 'Clinio AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Clinio AI',
    title: 'Clinio AI – Free Nursing & Medical Exam Practice',
    description:
      'Practice NCLEX, NMCN, and clinical scenarios for free. Timed quizzes, exam simulation, and OSCE case studies — all in one platform.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clinio AI – Clinical Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clinio AI – Free Nursing & Medical Exam Practice',
    description:
      'Practice NCLEX, NMCN, and clinical scenarios for free. Timed quizzes, exam simulation, OSCE case studies.',
    images: ['/og-image.png'],
    creator: '@clinioai',
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Clinio AI',
  url: BASE_URL,
  description:
    'Free nursing and medical exam practice platform with Rapid Quiz, NCLEX prep, NMCN exam practice, Clinical OSCE scenarios, and study guides.',
  applicationCategory: 'EducationApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  audience: { '@type': 'Audience', audienceType: 'Nursing and Medical Students' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
