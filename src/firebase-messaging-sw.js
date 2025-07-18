importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBtCD7AiBx18mDe4P3Pnb_pJrP9YdmE2N4",
  authDomain: "talkvera-ae907.firebaseapp.com",
  projectId: "talkvera-ae907",
  storageBucket: "talkvera-ae907.firebasestorage.app",
  messagingSenderId: "400690975329",
  appId: "1:400690975329:web:d39b8174e8ae76a6a79020",
  measurementId: "G-LJJLZRY273"
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();