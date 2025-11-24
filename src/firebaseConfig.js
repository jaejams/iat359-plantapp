import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBTOYIXZN0k6xh0mmEesvGS67fgsodUzhI",
    authDomain: "plantproject-b9c83.firebaseapp.com",
    projectId: "plantproject-b9c83",
    storageBucket: "plantproject-b9c83.firebasestorage.app",
    messagingSenderId: "544937792220",
    appId: "1:544937792220:web:b6f84bfe40d0a273fd1a19",
    isTesting: true,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db };
