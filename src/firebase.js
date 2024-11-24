// Import the necessary functions from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Import Firebase Authentication
import { getFirestore } from "firebase/firestore";  // Import Firestore
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCASUlxeyi23d3EtbW0H7p2kHMPJJKkjic",
  authDomain: "fir-rbac.firebaseapp.com",
  projectId: "fir-rbac",
  storageBucket: "fir-rbac.firebasestorage.app",
  messagingSenderId: "1089683569744",
  appId: "1:1089683569744:web:2d4a8ed5cbdd0d54b06555",
  measurementId: "G-70P0EZHY7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (optional)
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db, analytics };  // Export these for use in other files