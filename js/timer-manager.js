import { db } from './firebase-config.js';
import { doc, onSnapshot, updateDoc, addDoc, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { formatTime, showView } from './utils.js';
import { getCurrentSessionId } from './session-manager.js';
import { updateAlarmInputs } from './timer-controls.js';

// Timer state
export let currentTimerId = null;
let localState = {};
let animationFrameId = null;
let lastTickTimestamp = null;
let unsubscribeFromCurrentTimer = null;
let lastAlarmCheckValue = null; // Track last value when alarm was checked

// DOM elements
const display = document.getElementById('display');
const timerNameDisplay = document.getElementById('timer-name-display');
const directionLabel = document.getElementById('direction-label');
const alarmStatus = document.getElementById('alarm-status');
const lapsContainer = document.getElementById('laps-container');

export function selectTimer(timerId) {
    currentTimerId = timerId;
    showView('timer');
    listenToCurrentTimer(getCurrentSessionId(), timerId);
}

function listenToCurrentTimer(sessionId, timerId) {
    if (unsubscribeFromCurrentTimer) unsubscribeFromCurrentTimer();
    const timerRef = doc(db, "sessions", sessionId, "timers", timerId);
    
    unsubscribeFromCurrentTimer = onSnapshot(timerRef, (docSnap) => {
        if (!docSnap.exists()) {
            console.log("Current timer was deleted.");
            backToList();
            return;
        }
        
        const serverState = docSnap.data();

        // Predict current time based on time since last update
        if (serverState.running && serverState.lastUpdatedTimestamp) {
            const timeElapsed = (Date.now() - serverState.lastUpdatedTimestamp) / 1000;
            const speed = serverState.speed || 1;
            serverState.time += serverState.direction * speed * timeElapsed;
        }

        // Reset alarm check when state changes from server
        lastAlarmCheckValue = null;
        
        localState = serverState;
        updateFullUI();

        if (localState.running) startLocalTicker();
        else stopLocalTicker();
    }, (error) => {
        console.error("Error listening to timer:", error);
    });
}

export async function updateFirestoreState(partialState) {
    if (!getCurrentSessionId() || !currentTimerId || !db) return;
    
    try {
        const timerRef = doc(db, "sessions", getCurrentSessionId(), "timers", currentTimerId);
        await updateDoc(timerRef, { 
            ...partialState, 
            lastUpdatedTimestamp: Date.now() 
        });
    } catch (error) {
        console.error("Error updating Firestore state:", error);
    }
}

function localTick(timestamp) {
    if (!localState.running) {
        stopLocalTicker();
        return;
    }
    
    if (lastTickTimestamp) {
        const delta = (timestamp - lastTickTimestamp) / 1000;
        const speed = localState.speed || 1;
        const oldTime = localState.time;
        localState.time += localState.direction * speed * delta;
        
        // Improved alarm check - only check when crossing the threshold
        if (localState.alarmTime !== null && !localState.alarmTriggered) {
            const alarmTime = localState.alarmTime;
            let shouldTrigger = false;
            
            if (localState.direction === -1) {
                // Counting down: trigger when crossing from above to below or at alarm time
                shouldTrigger = oldTime > alarmTime && localState.time <= alarmTime;
            } else {
                // Counting up: trigger when crossing from below to above or at alarm time
                shouldTrigger = oldTime < alarmTime && localState.time >= alarmTime;
            }
            
            if (shouldTrigger && lastAlarmCheckValue !== localState.time) {
                lastAlarmCheckValue = localState.time;
                localState.alarmTriggered = true;
                document.body.classList.add('alarm-active');
                updateFirestoreState({ alarmTriggered: true });
                console.log("Alarm triggered at:", formatTime(localState.time));
            }
        }
        
        updateDisplay();
    }
    lastTickTimestamp = timestamp;
    animationFrameId = requestAnimationFrame(localTick);
}

function startLocalTicker() {
    if (animationFrameId) return;
    lastTickTimestamp = null;
    animationFrameId = requestAnimationFrame(localTick);
}

function stopLocalTicker() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        lastTickTimestamp = null;
    }
}

function updateDisplay() {
    if (display) {
        display.textContent = formatTime(localState.time);
    }
}

function updateFullUI() {
    if (!localState) return;
    
    // Update timer name
    if (timerNameDisplay) {
        timerNameDisplay.textContent = localState.name || 'Timer';
    }
    
    // Update time display
    updateDisplay();
    
    // Update direction and speed label
    if (directionLabel) {
        if (localState.running) {
            const direction = localState.direction === 1 ? 'Counting Up' : 'Counting Down';
            const speed = localState.speed || 1;
            directionLabel.textContent = `${direction} @ ${speed}x`;
        } else {
            directionLabel.textContent = 'Paused';
        }
    }
    
    // Update alarm status
    updateAlarmStatus();
    
    // Update alarm inputs
    updateAlarmInputs(localState.alarmTime);
    
    // Update laps
    updateLapsDisplay();
    
    // Update button states
    updateControlButtons();
    
    // Update speed buttons
    updateSpeedButtons();
    
    // Handle alarm UI
    if (localState.alarmTriggered) {
        document.body.classList.add('alarm-active');
    } else {
        document.body.classList.remove('alarm-active');
    }
}

function updateAlarmStatus() {
    if (alarmStatus) {
        if (localState.alarmTime !== null) {
            alarmStatus.textContent = `Alarm set for ${formatTime(localState.alarmTime)}`;
            alarmStatus.classList.remove('opacity-0');
            alarmStatus.classList.add('opacity-100');
        } else {
            alarmStatus.classList.remove('opacity-100');
            alarmStatus.classList.add('opacity-0');
        }
    }
}

function updateLapsDisplay() {
    if (lapsContainer) {
        lapsContainer.innerHTML = '';
        (localState.laps || []).forEach(lap => {
            const lapEl = document.createElement('div');
            lapEl.className = 'flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm';
            lapEl.innerHTML = `<span class="font-medium text-gray-300">${lap.text}</span><span class="font-mono font-semibold">${lap.time}</span>`;
            lapsContainer.prepend(lapEl);
        });
    }
}

function updateControlButtons() {
    const startPauseBtn = document.getElementById('start-pause');
    const lapResetBtn = document.getElementById('lap-reset');
    
    if (startPauseBtn) {
        startPauseBtn.textContent = localState.running ? 'Pause' : 'Start';
        startPauseBtn.className = `w-full font-bold py-3 px-4 rounded-lg text-xl ${
            localState.running 
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
        }`;
    }
    
    if (lapResetBtn) {
        lapResetBtn.textContent = localState.running ? 'Lap' : 'Reset';
    }
}

function updateSpeedButtons() {
    document.querySelectorAll('.speed-btn').forEach(btn => {
        const speed = parseInt(btn.dataset.speed, 10);
        if (speed === (localState.speed || 1)) {
            btn.classList.add('bg-cyan-500');
            btn.classList.remove('bg-gray-700');
        } else {
            btn.classList.remove('bg-cyan-500');
            btn.classList.add('bg-gray-700');
        }
    });
}

export async function createTimer(name) {
    const sessionId = getCurrentSessionId();
    if (!sessionId) return;
    
    try {
        const timersCollectionRef = collection(db, "sessions", sessionId, "timers");
        const newTimerState = {
            name: name || 'Untitled Timer',
            time: 0,
            initialTime: 0,
            direction: 1,
            speed: 1,
            running: false,
            laps: [],
            alarmTime: null,
            alarmTriggered: false,
            lastUpdatedTimestamp: Date.now()
        };
        await addDoc(timersCollectionRef, newTimerState);
    } catch (error) {
        console.error("Error creating timer:", error);
    }
}

export async function deleteCurrentTimer() {
    if (!confirm(`Are you sure you want to delete "${localState.name}"?`)) {
        return;
    }
    
    const sessionId = getCurrentSessionId();
    if (!sessionId || !currentTimerId) return;
    
    try {
        stopLocalTicker();
        const timerRef = doc(db, "sessions", sessionId, "timers", currentTimerId);
        await deleteDoc(timerRef);
        backToList();
    } catch (error) {
        console.error("Error deleting timer:", error);
    }
}

export function backToList() {
    if (unsubscribeFromCurrentTimer) {
        unsubscribeFromCurrentTimer();
        unsubscribeFromCurrentTimer = null;
    }
    currentTimerId = null;
    stopLocalTicker();
    document.body.classList.remove('alarm-active');
    lastAlarmCheckValue = null;
    showView('list');
}

export function getLocalState() {
    return localState;
}

export function getCurrentTimerId() {
    return currentTimerId;
} 