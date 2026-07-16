import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyApL_VqIdpvYVpmUsNtLIVD6rC_fNr5zFY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ntr-study-hub-4df5f.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ntr-study-hub-4df5f",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ntr-study-hub-4df5f.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "252600020571",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:252600020571:web:7b49c6b7ea7941fdf6597e",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("ACTIVE FIREBASE PROJECT ID:", app.options.projectId);
  console.log("ACTIVE AUTH DOMAIN:", app.options.authDomain);
}

export { app, auth, db };
