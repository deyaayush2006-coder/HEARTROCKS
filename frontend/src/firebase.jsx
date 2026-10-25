import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyC6I4qkqFakVFgEFKnY94Qiqg_dyHa2Gz0",
  authDomain: "heartrock-5baf0.firebaseapp.com",
  databaseURL: "https://heartrock-5baf0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "heartrock-5baf0",
  storageBucket: "heartrock-5baf0.firebasestorage.app",
  messagingSenderId: "785030552784",
  appId: "1:785030552784:web:fc39d046dcabb2b74c92d5",
  measurementId: "G-MJKY3BEM0M"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);