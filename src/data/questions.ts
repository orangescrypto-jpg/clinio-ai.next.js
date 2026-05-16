import { COLLECTIONS } from '@/lib/firebase';
import type { Question } from '@/types';

function mapDocToQuestion(doc: Record<string, any>): Question {
  const f = doc.fields;
  return {
    id: doc.name.split('/').pop() as string,
    topicId: f.topicId?.stringValue || '',
    stem: f.stem?.stringValue || '',
    choices:
      f.choices?.arrayValue?.values?.map((v: Record<string, any>) => ({
        id: v.mapValue?.fields?.id?.stringValue || '',
        text: v.mapValue?.fields?.text?.stringValue || '',
      })) || [],
    correctAnswerId: f.correctAnswerId?.stringValue || '',
    explanation: f.explanation?.stringValue || '',
    difficulty: (f.difficulty?.stringValue as Question['difficulty']) || 'medium',
  };
}

async function fetchAllQuestions(): Promise<Question[]> {
  const response = await fetch(COLLECTIONS.questions);
  if (!response.ok) throw new Error(`Failed to fetch questions: ${response.status}`);
  const data = await response.json();
  if (!data.documents) return [];
  return data.documents.map(mapDocToQuestion);
}

export async function fetchQuestionsByTopic(topicId: string): Promise<Question[]> {
  const all = await fetchAllQuestions();
  return all.filter((q) => q.topicId === topicId);
}

export async function fetchQuestionsByTopics(topicIds: string[]): Promise<Question[]> {
  if (topicIds.length === 0) return [];
  const set = new Set(topicIds);
  const all = await fetchAllQuestions();
  return all.filter((q) => set.has(q.topicId));
}

export async function fetchAllQuestionsForQuiz(): Promise<Question[]> {
  return fetchAllQuestions();
}
