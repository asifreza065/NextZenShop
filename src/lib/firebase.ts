import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBP8lmJm3nkmXxWEQ2956H0WwA-eNHDDJw",
  authDomain: "gen-lang-client-07072231-38356.firebaseapp.com",
  projectId: "gen-lang-client-07072231-38356",
  storageBucket: "gen-lang-client-07072231-38356.firebasestorage.app",
  messagingSenderId: "456430020016",
  appId: "1:456430020016:web:821d1288290371f0a6e275",
  measurementId: "G-2GGBR68GD2"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
