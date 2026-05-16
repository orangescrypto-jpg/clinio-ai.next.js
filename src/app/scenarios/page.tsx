import type { Metadata } from 'next';
import { ScenarioContainer } from '@/features/clinical-scenario/ScenarioContainer';

export const metadata: Metadata = {
  title: 'Clinical OSCE Scenarios – Patient Case Simulations',
  description:
    'Step-through patient case simulations for OSCE preparation. Practice clinical decision-making, patient assessment, and nursing interventions with real-world scenarios.',
  alternates: { canonical: '/scenarios' },
  openGraph: {
    title: 'Clinical OSCE Scenarios – Patient Case Simulations | Clinio AI',
    description:
      'Interactive OSCE patient case simulations. Practice clinical reasoning and nursing decision-making.',
    url: '/scenarios',
  },
};

export default function Page() {
  return <ScenarioContainer />;
}
