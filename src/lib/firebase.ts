import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBuJVc5VNjpdrwlIT5JhJ4IVQu6hkBIppE",
  authDomain: "nextzenshop-4701c.firebaseapp.com",
  projectId: "nextzenshop-4701c",
  storageBucket: "nextzenshop-4701c.firebasestorage.app",
  messagingSenderId: "81585574684",
  appId: "1:81585574684:web:e7876eb5f4a604ab67a0d9",
  measurementId: "G-M6YQH2JFBG"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
