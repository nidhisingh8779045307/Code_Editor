// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmoE1_sXVU2Mrzzje_suXcXCtnstPlFCI",
  authDomain: "professional-code-editor.firebaseapp.com",
  projectId: "professional-code-editor",
  storageBucket: "professional-code-editor.firebasestorage.app",
  messagingSenderId: "1059591693747",
  appId: "1:1059591693747:web:14e93fc972b11136e517c6",
  measurementId: "G-7HXLD92K5X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
              