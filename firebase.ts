
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// REPLACE THESE WITH YOUR FIREBASE CONFIG KEYS
const firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "PLACEHOLDER_PROJECT_ID.firebaseapp.com",
  projectId: "PLACEHOLDER_PROJECT_ID",
  storageBucket: "PLACEHOLDER_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PLACEHOLDER_SENDER_ID",
  appId: "PLACEHOLDER_APP_ID"
};

// Check if the user has replaced the placeholders
export const isFirebaseConfigured = !firebaseConfig.apiKey.includes("PLACEHOLDER");

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};
