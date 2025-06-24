import { db, getUserId } from './firebase-config.js';
import { doc, setDoc, getDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { showView } from './utils.js';

// Session state
export let currentSessionId = null;
let unsubscribeFromTimersList = null;

// DOM elements
const sessionIdInput = document.getElementById('session-id-input');
const sessionIdDisplay = document.getElementById('session-id-display');
const copySessionIdBtn = document.getElementById('copy-session-id');
const sessionError = document.getElementById('session-error');
const timersListContainer = document.getElementById('timers-list-container');

export async function createSession() {
    const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userId = getUserId();
    
    try {
        // Create a session document to mark it as existing
        await setDoc(doc(db, "sessions", newSessionId), { 
            createdAt: Date.now(), 
            owner: userId 
        });
        await joinSession(newSessionId);
    } catch (error) {
        console.error("Error creating session:", error);
        sessionError.textContent = "Failed to create session.";
    }
}

export async function joinSession(sessionId) {
    if (!sessionId || !db) return;
    sessionError.textContent = '';
    
    try {
        const sessionRef = doc(db, "sessions", sessionId);
        const docSnap = await getDoc(sessionRef);

        if (!docSnap.exists()) {
            sessionError.textContent = "Session not found.";
            localStorage.removeItem('syncTimerSessionId');
            return;
        }

        currentSessionId = sessionId;
        localStorage.setItem('syncTimerSessionId', currentSessionId);
        sessionIdDisplay.textContent = currentSessionId;
        showView('list');
        listenToTimersList(sessionId);
    } catch (error) {
        console.error("Error joining session:", error);
        sessionError.textContent = "Failed to join session.";
    }
}

export function leaveSession() {
    if (unsubscribeFromTimersList) {
        unsubscribeFromTimersList();
        unsubscribeFromTimersList = null;
    }
    localStorage.removeItem('syncTimerSessionId');
    currentSessionId = null;
    document.body.classList.remove('alarm-active');
    showView('session');
}

export function checkRememberedSession() {
    const rememberedSessionId = localStorage.getItem('syncTimerSessionId');
    if (rememberedSessionId) {
        joinSession(rememberedSessionId);
    }
}

function listenToTimersList(sessionId) {
    if (unsubscribeFromTimersList) unsubscribeFromTimersList();
    const timersCollectionRef = collection(db, "sessions", sessionId, "timers");
    
    unsubscribeFromTimersList = onSnapshot(timersCollectionRef, (snapshot) => {
        timersListContainer.innerHTML = '';
        if (snapshot.empty) {
            timersListContainer.innerHTML = '<p class="text-center text-gray-500">No timers yet. Create one!</p>';
        }
        snapshot.forEach(doc => {
            const timerData = doc.data();
            const timerElement = document.createElement('button');
            timerElement.className = 'w-full text-left bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors';
            timerElement.textContent = timerData.name || 'Untitled Timer';
            timerElement.onclick = () => window.timerManager?.selectTimer(doc.id);
            timersListContainer.appendChild(timerElement);
        });
    }, (error) => {
        console.error("Error listening to timers list:", error);
    });
}

// Copy session ID functionality
copySessionIdBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(currentSessionId);
        // Visual feedback
        const originalText = copySessionIdBtn.innerHTML;
        copySessionIdBtn.innerHTML = '✓';
        setTimeout(() => {
            copySessionIdBtn.innerHTML = originalText;
        }, 1000);
    } catch (error) {
        console.error("Failed to copy session ID:", error);
        alert('Session ID copied!'); // Fallback
    }
});

export function getCurrentSessionId() {
    return currentSessionId;
} 