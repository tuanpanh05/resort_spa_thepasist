import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAY5n15AiNfV96C3gSuTJLETPI56WAOhJo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ngusonresort.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ngusonresort",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ngusonresort.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "82237656884",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:82237656884:web:fd37de867fc02ae0e4df61",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FNBFGQ682B",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();