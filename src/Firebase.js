// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyA3LUQcT_o21kXsRF7Qb_qFZO6BSRRhvm0",
  authDomain: "bloombudget-e7080.firebaseapp.com",
  projectId: "bloombudget-e7080",
  storageBucket: "bloombudget-e7080.firebasestorage.app",
  messagingSenderId: "908239263298",
  appId: "1:908239263298:web:6ca9c7521649488d267fdb",
  measurementId: "G-8S1C38FGJG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app)

export default app;