// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxDMlgui638g5ezbKB4AERFND_MTqN3kg",
  authDomain: "ostrogram-e94f5.firebaseapp.com",
  projectId: "ostrogram-e94f5",
  storageBucket: "ostrogram-e94f5.firebasestorage.app",
  messagingSenderId: "893008245846",
  appId: "1:893008245846:web:23cbf394a92e2c304bb7f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);