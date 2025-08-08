import {initializeApp} from 'firebase/app';
import {getAuth, signInWithCustomToken} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoahm1Y79jkqbkmcmvvaji06281BCzx0M",
  authDomain: "yaashflow.firebaseapp.com",
  projectId: "yaashflow",
  storageBucket: "yaashflow.firebasestorage.app",
  messagingSenderId: "969240434786",
  appId: "1:969240434786:web:ab1973b2c352ca6ec5993b",
  measurementId: "G-ZP5EV0E2J4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, signInWithCustomToken };