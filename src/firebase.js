import { initializeApp } from 'firebase/app'

const firebaseApp = (firebaseConfig) => initializeApp(firebaseConfig);
const db = (firebaseApp) => firebaseApp.firestore();

export { firebaseApp, db }