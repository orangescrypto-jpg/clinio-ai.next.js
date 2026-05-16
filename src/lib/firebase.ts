/**
 * Central Firebase / Firestore configuration.
 *
 * The Firestore REST base URL is built from the env variable
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID so you never need to touch this
 * file when switching projects.
 *
 * Add to .env.local:
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID=clinio-ai
 */

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'clinio-ai';

export const FIRESTORE_BASE_URL =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Collections covered by your Firebase security rules.
 *
 * Public READ  → all collections (allow read: if true at top level)
 * Public WRITE → comments only (allow create: if true)
 * Auth  WRITE  → posts, questions, categories, subCategories, topics
 */
export const COLLECTIONS = {
  posts:          `${FIRESTORE_BASE_URL}/posts`,
  questions:      `${FIRESTORE_BASE_URL}/questions`,
  categories:     `${FIRESTORE_BASE_URL}/categories`,
  subCategories:  `${FIRESTORE_BASE_URL}/subCategories`,
  topics:         `${FIRESTORE_BASE_URL}/topics`,
  comments:       `${FIRESTORE_BASE_URL}/comments`,
} as const;
