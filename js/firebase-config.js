import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAqzofYQQKO8IOzOuZxHhT8cerf4JcH5TU",
    authDomain: "thefinalcountdown-b6dfc.firebaseapp.com",
    projectId: "thefinalcountdown-b6dfc",
    storageBucket: "thefinalcountdown-b6dfc.firebasestorage.app",
    messagingSenderId: "694566387672",
    appId: "1:694566387672:web:7aa5b12bcf21c8117f3cad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Global state for user
export let userId = null;

export function initializeAuth(onUserReady) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
            console.log("Authenticated with UID:", userId);
            onUserReady(userId);
        } else {
            signInAnonymously(auth).catch(error => {
                console.error("Anonymous sign-in failed:", error);
            });
        }
    });
}

export function getUserId() {
    return userId;
} 