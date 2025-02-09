// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9XU1VjOauFZx2Pow8H6USzFKDRIkelNg",
  authDomain: "result-processing-system-ed1a5.firebaseapp.com",
  projectId: "result-processing-system-ed1a5",
  storageBucket: "result-processing-system-ed1a5.firebasestorage.app",
  messagingSenderId: "501404526097",
  appId: "1:501404526097:web:dbe4115e3d052654dfb3b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);