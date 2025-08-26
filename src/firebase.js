import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';


const firebaseConfig = {
    apiKey: "AIzaSyCmQ2wTSMBTv6l6mYH9vWNaYYfDbSWX2kc",
    authDomain: "rume-admintest.firebaseapp.com",
    projectId: "rume-admintest",
    storageBucket: "rume-admintest.firebasestorage.app",
    messagingSenderId: "989128591470",
    appId: "1:989128591470:web:e9a610dd6904ca5a717e7f",
    measurementId: "G-5M3CGGP5T3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;