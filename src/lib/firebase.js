import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqgBqJA3wXn4ZX2_CussPGN6aZrFq6PCE",
  authDomain: "tucasa-cbe-web.firebaseapp.com",
  projectId: "tucasa-cbe-web",
  storageBucket: "tucasa-cbe-web.firebasestorage.app",
  messagingSenderId: "595707335062",
  appId: "1:595707335062:web:f5f1b47490c587a2f78db7",
  measurementId: "G-KFHECSR6PQ"
};

const app = initializeApp(firebaseConfig);

// Export Services (Database & Auth ONLY)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);