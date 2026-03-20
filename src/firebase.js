import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ──────────────────────────────────────────────
//  PASTE YOUR FIREBASE CONFIG HERE
//  (Firebase Console → Project Settings → Your apps → Config)
// ──────────────────────────────────────────────
const firebaseConfig =  {
  apiKey: "AIzaSyCZqlwESrHdsSik4uqNRxqJ9jooOACpg-A",
  authDomain: "movie-836c8.firebaseapp.com",
  projectId: "movie-836c8",
  storageBucket: "movie-836c8.firebasestorage.app",
  messagingSenderId: "1078703168049",
  appId: "1:1078703168049:web:4b3426e36d7f85f2401310"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
