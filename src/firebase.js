// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDPx_dFNn4-99tCAeSY9ZyusKUP1lmtvUs",
    authDomain: "furever-steffie.firebaseapp.com",
    projectId: "furever-steffie",
    storageBucket: "furever-steffie.firebasestorage.app",
    messagingSenderId: "589323009936",
    appId: "1:589323009936:web:def7b87847e0049618bd15",
    measurementId: "G-TJT3Y79V9Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);