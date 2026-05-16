import type { Metadata } from 'next';
import { PostDetailContainer } from '@/features/content-feed/PostDetailContainer';

export const metadata: Metadata = {
  title: 'Study Guide – Clinio AI',
  description: 'Read this nursing and medical study guide on Clinio AI.',
};

export default function Page() {
  return <PostDetailContainer />;
}
