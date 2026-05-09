// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOwWdp8EZ048soNLYGPqsmePyGl2QEVuo",
  authDomain: "maruthi-divine-touch.firebaseapp.com",
  projectId: "maruthi-divine-touch",
  storageBucket: "maruthi-divine-touch.firebasestorage.app",
  messagingSenderId: "418066641278",
  appId: "1:418066641278:web:a6990e3649efa8a579432f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);