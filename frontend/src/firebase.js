// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ✅ ADD THIS

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6rWTx4aaSQXekiOQBqZAPaSZgkcAqdXk",
  authDomain: "ss-socioserve.firebaseapp.com",
  projectId: "ss-socioserve",
  storageBucket: "ss-socioserve.firebasestorage.app",
  messagingSenderId: "620196084620",
  appId: "1:620196084620:web:cc24e8de5006b5269cf4a9",
  measurementId: "G-FVFZNKTLRJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app); // ✅ EXPORT AUTH
export const analytics = getAnalytics(app);
