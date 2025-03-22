import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your main Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD9XU1VjOauFZx2Pow8H6USzFKDRIkelNg",
  authDomain: "result-processing-system-ed1a5.firebaseapp.com",
  projectId: "result-processing-system-ed1a5",
  storageBucket: "result-processing-system-ed1a5.firebasestorage.app",
  messagingSenderId: "501404526097",
  appId: "1:501404526097:web:dbe4115e3d052654dfb3b0"
};

// Initialize main app
const app = initializeApp(firebaseConfig);

// Initialize second app for student operations with the same config
const studentApp = initializeApp(firebaseConfig, 'studentApp');

export const auth = getAuth(app);
export const studentAuth = getAuth(studentApp);
export const db = getFirestore(app); 