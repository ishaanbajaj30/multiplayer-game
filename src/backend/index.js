import { isFirebaseConfigured } from '../firebase/config'
import { localBackend } from './localBackend'

// Firestore modules are only imported when config exists, so a blank .env
// never triggers Firebase init errors.
let backend = localBackend

if (isFirebaseConfigured) {
  const { firestoreBackend } = await import('./firestoreBackend')
  backend = firestoreBackend
}

export const dataBackend = backend
export const backendKind = backend.kind
