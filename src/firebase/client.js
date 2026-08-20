import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { firebaseConfig } from './config'

const app = initializeApp(firebaseConfig)

// Offline cache keeps the arcade usable on a flaky connection and syncs later.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

export const auth = getAuth(app)

let signInPromise = null

/** Anonymous sign-in, once per session. Firestore rules require an auth uid. */
export function ensureSignedIn() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser)
  if (!signInPromise) {
    signInPromise = signInAnonymously(auth)
      .then((cred) => cred.user)
      .catch((err) => {
        signInPromise = null
        throw err
      })
  }
  return signInPromise
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb)
}
