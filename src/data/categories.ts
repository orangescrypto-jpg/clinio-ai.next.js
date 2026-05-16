import { COLLECTIONS } from '@/lib/firebase';
import type { Category, SubCategory, Topic } from '@/types';

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(COLLECTIONS.categories);
  if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);
  const data = await response.json();
  if (!data.documents) return [];
  return data.documents.map((doc: Record<string, any>) => {
    const f = doc.fields;
    return {
      id: doc.name.split('/').pop() as string,
      name: f.name?.stringValue || '',
      icon: f.icon?.stringValue || '',
      description: f.description?.stringValue || '',
      targetAudience: f.targetAudience?.stringValue || '',
    } as Category;
  });
}

export async function fetchSubCategories(categoryId?: string): Promise<SubCategory[]> {
  const response = await fetch(COLLECTIONS.subCategories);
  if (!response.ok) throw new Error(`Failed to fetch sub-categories: ${response.status}`);
  const data = await response.json();
  if (!data.documents) return [];
  let results: SubCategory[] = data.documents.map((doc: Record<string, any>) => {
    const f = doc.fields;
    return {
      id: doc.name.split('/').pop() as string,
      categoryId: f.categoryId?.stringValue || '',
      name: f.name?.stringValue || '',
      description: f.description?.stringValue || '',
      icon: f.icon?.stringValue || '',
    };
  });
  if (categoryId) {
    results = results.filter((s) => s.categoryId === categoryId);
  }
  return results;
}

export async function fetchTopics(subCategoryId?: string): Promise<Topic[]> {
  const response = await fetch(COLLECTIONS.topics);
  if (!response.ok) throw new Error(`Failed to fetch topics: ${response.status}`);
  const data = await response.json();
  if (!data.documents) return [];
  let results: Topic[] = data.documents.map((doc: Record<string, any>) => {
    const f = doc.fields;
    return {
      id: doc.name.split('/').pop() as string,
      subCategoryId: f.subCategoryId?.stringValue || '',
      name: f.name?.stringValue || '',
      description: f.description?.stringValue || '',
      questionCount: f.questionCount?.integerValue
        ? Number(f.questionCount.integerValue)
        : 0,
    };
  });
  if (subCategoryId) {
    results = results.filter((t) => t.subCategoryId === subCategoryId);
  }
  return results;
}
