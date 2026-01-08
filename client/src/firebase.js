// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb70tuvaw5rDgOhcFwiWIsb1UrwU1wXEo",
  authDomain: "realtor-9d5f1.firebaseapp.com",
  projectId: "realtor-9d5f1",
  storageBucket: "realtor-9d5f1.firebasestorage.app",
  messagingSenderId: "262123635392",
  appId: "1:262123635392:web:4bfa8b33dd930fbae8a325",
  measurementId: "G-QHJTT8RCCP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);
export const db = getFirestore();
