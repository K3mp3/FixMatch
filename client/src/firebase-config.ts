import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { firebaseApp } from './main'

export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
