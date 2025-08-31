import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';


const firebaseConfig = {
    apiKey: "AIzaSyBMmRD9INkH1cgqbiXgeDQHbut5dP2zDDM",
    authDomain: "rume-612e1.firebaseapp.com",
    projectId: "rume-612e1",
    storageBucket: "rume-612e1.firebasestorage.app",
    messagingSenderId: "257294933262",
    appId: "1:257294933262:web:0dadd91f75e84b4a658b5f",
    measurementId: "G-T3GWN0RKZY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;