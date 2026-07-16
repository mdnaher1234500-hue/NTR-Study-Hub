import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApL_VqIdpvYVpmUsNtLIVD6rC_fNr5zFY",
  authDomain: "ntr-study-hub-4df5f.firebaseapp.com",
  projectId: "ntr-study-hub-4df5f",
  storageBucket: "ntr-study-hub-4df5f.firebasestorage.app",
  messagingSenderId: "252600020571",
  appId: "1:252600020571:web:7b49c6b7ea7941fdf6597e"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (typeof window !== "undefined") {
  console.log("ACTIVE FIREBASE PROJECT ID:", app.options.projectId);
  console.log("ACTIVE AUTH DOMAIN:", app.options.authDomain);
}

export { app, auth, db };
