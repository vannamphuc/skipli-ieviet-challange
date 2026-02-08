import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const handleCheckEnv = () => {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    throw new Error('VITE_FIREBASE_API_KEY is not defined')
  }
  if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
    throw new Error('VITE_FIREBASE_AUTH_DOMAIN is not defined')
  }
  if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    throw new Error('VITE_FIREBASE_PROJECT_ID is not defined')
  }
  if (!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
    throw new Error('VITE_FIREBASE_STORAGE_BUCKET is not defined')
  }
  if (!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) {
    throw new Error('VITE_FIREBASE_MESSAGING_SENDER_ID is not defined')
  }
  if (!import.meta.env.VITE_FIREBASE_APP_ID) {
    throw new Error('VITE_FIREBASE_APP_ID is not defined')
  }
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    throw new Error('VITE_FIREBASE_MEASUREMENT_ID is not defined')
  }
}

handleCheckEnv()

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
