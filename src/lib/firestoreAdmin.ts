/**
 * Firestore REST write helpers for admin operations.
 * All mutations require a valid Firebase ID token.
 */

import { FIRESTORE_BASE_URL } from './firebase';

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { arrayValue: { values: FirestoreValue[] } };

type FirestoreFields = Record<string, FirestoreValue>;

// ── Convert plain JS object → Firestore fields ────────────────────────────────

export function toFirestoreFields(obj: Record<string, unknown>): FirestoreFields {
  const fields: FirestoreFields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue;
    if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (typeof val === 'number') {
      fields[key] = { integerValue: String(Math.round(val)) };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((item) =>
            typeof item === 'object' && item !== null
              ? // nested objects not deeply supported here; stringify
                { stringValue: JSON.stringify(item) }
              : { stringValue: String(item) },
          ),
        },
      };
    } else {
      fields[key] = { stringValue: String(val) };
    }
  }
  return fields;
}

// ── Generic document create (POST → auto-ID) ─────────────────────────────────

export async function createDocument(
  collection: string,
  data: Record<string, unknown>,
  idToken: string,
): Promise<string> {
  const url = `${FIRESTORE_BASE_URL}/${collection}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Create failed');
  // Extract document ID from name: projects/.../documents/collection/ID
  return json.name.split('/').pop() as string;
}

// ── Generic document update (PATCH) ──────────────────────────────────────────

export async function updateDocument(
  collection: string,
  docId: string,
  data: Record<string, unknown>,
  idToken: string,
): Promise<void> {
  const fields = toFirestoreFields(data);
  const updateMask = Object.keys(fields)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join('&');

  const url = `${FIRESTORE_BASE_URL}/${collection}/${docId}?${updateMask}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Update failed');
}

// ── Generic document delete ───────────────────────────────────────────────────

export async function deleteDocument(
  collection: string,
  docId: string,
  idToken: string,
): Promise<void> {
  const url = `${FIRESTORE_BASE_URL}/${collection}/${docId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error?.message || 'Delete failed');
  }
}
