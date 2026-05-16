import type { Metadata } from 'next';
import { ScenarioPlayerContainer } from '@/features/clinical-scenario/ScenarioPlayerContainer';

export const metadata: Metadata = {
  title: 'Clinical Scenario – Clinio AI',
  description: 'Work through a step-by-step patient case simulation and test your clinical reasoning.',
  alternates: { canonical: '/scenarios' },
};

export default function Page() {
  return <ScenarioPlayerContainer />;
}
