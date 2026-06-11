import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAY5n15AiNfV96C3gSuTJLETPI56WAOhJo",
  authDomain: "ngusonresort.firebaseapp.com",
  projectId: "ngusonresort",
  storageBucket: "ngusonresort.firebasestorage.app",
  messagingSenderId: "82237656884",
  appId: "1:82237656884:web:fd37de867fc02ae0e4df61",
  measurementId: "G-FNBFGQ682B",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();