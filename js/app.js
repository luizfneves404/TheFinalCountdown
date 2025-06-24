import { initializeAuth } from './firebase-config.js';
import { createSession, joinSession, leaveSession, checkRememberedSession } from './session-manager.js';
import { createTimer, deleteCurrentTimer, backToList, selectTimer } from './timer-manager.js';
import { 
    handleStartPause, 
    handleSetTime, 
    handleLapReset, 
    handleReverse, 
    handleSetAlarm, 
    handleClearAlarm, 
    handleSetSpeed,
    updateAlarmInputs
} from './timer-controls.js';

// DOM element references for event listeners
const createSessionBtn = document.getElementById('create-session');
const joinSessionBtn = document.getElementById('join-session');
const sessionIdInput = document.getElementById('session-id-input');
const leaveSessionBtn = document.getElementById('leave-session-btn');

const newTimerNameInput = document.getElementById('new-timer-name');
const createTimerBtn = document.getElementById('create-timer');

const backToListBtn = document.getElementById('back-to-list-btn');
const startPauseBtn = document.getElementById('start-pause');
const lapResetBtn = document.getElementById('lap-reset');
const reverseBtn = document.getElementById('reverse');
const deleteTimerBtn = document.getElementById('delete-timer');

const setTimeBtn = document.getElementById('set-time');
const setAlarmBtn = document.getElementById('set-alarm');
const clearAlarmBtn = document.getElementById('clear-alarm');
const speedControls = document.getElementById('speed-controls');

// Make timer manager available globally for session manager
window.timerManager = { selectTimer };

function initializeApp() {
    console.log("Initializing app...");
    
    // Initialize Firebase authentication
    initializeAuth((userId) => {
        console.log("User authenticated, checking for remembered session...");
        checkRememberedSession();
    });
    
    setupEventListeners();
}

function setupEventListeners() {
    // Session management
    createSessionBtn?.addEventListener('click', createSession);
    joinSessionBtn?.addEventListener('click', () => {
        const sessionId = sessionIdInput.value.trim().toUpperCase();
        if (sessionId) {
            joinSession(sessionId);
        }
    });
    sessionIdInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const sessionId = sessionIdInput.value.trim().toUpperCase();
            if (sessionId) {
                joinSession(sessionId);
            }
        }
    });
    leaveSessionBtn?.addEventListener('click', leaveSession);
    
    // Timer list management
    createTimerBtn?.addEventListener('click', handleCreateTimer);
    newTimerNameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleCreateTimer();
        }
    });
    
    // Timer controls
    backToListBtn?.addEventListener('click', backToList);
    startPauseBtn?.addEventListener('click', handleStartPause);
    lapResetBtn?.addEventListener('click', handleLapReset);
    reverseBtn?.addEventListener('click', handleReverse);
    deleteTimerBtn?.addEventListener('click', deleteCurrentTimer);
    
    // Time and alarm setting
    setTimeBtn?.addEventListener('click', handleSetTime);
    setAlarmBtn?.addEventListener('click', handleSetAlarm);
    clearAlarmBtn?.addEventListener('click', handleClearAlarm);
    
    // Speed controls
    speedControls?.addEventListener('click', (e) => {
        if (e.target.classList.contains('speed-btn')) {
            const speed = parseInt(e.target.dataset.speed, 10);
            handleSetSpeed(speed);
        }
    });
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space bar for start/pause (when not in input)
        if (e.code === 'Space' && !isInputFocused()) {
            e.preventDefault();
            handleStartPause();
        }
    });
}

function handleCreateTimer() {
    const name = newTimerNameInput.value.trim() || 'Untitled Timer';
    createTimer(name);
    newTimerNameInput.value = '';
}

function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
    );
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}