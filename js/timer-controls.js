import { updateFirestoreState, getLocalState } from './timer-manager.js';
import { parseTimeInputs, setTimeInputs, formatTime } from './utils.js';

// DOM elements for timer inputs
const hoursInput = document.getElementById('hours-input');
const minutesInput = document.getElementById('minutes-input');
const secondsInput = document.getElementById('seconds-input');

const alarmHoursInput = document.getElementById('alarm-hours-input');
const alarmMinutesInput = document.getElementById('alarm-minutes-input');
const alarmSecondsInput = document.getElementById('alarm-seconds-input');

export function handleStartPause() {
    const localState = getLocalState();
    const stateToUpdate = {
        running: !localState.running
    };
    
    // If the timer is currently running, we are pausing it.
    // We must persist the current client-side time to Firestore.
    if (localState.running) {
        stateToUpdate.time = localState.time;
    }
    
    updateFirestoreState(stateToUpdate);
}

export function handleSetTime() {
    const seconds = parseTimeInputs(hoursInput, minutesInput, secondsInput);
    
    if (seconds === 0 && !hoursInput.value && !minutesInput.value && !secondsInput.value) {
        return; // No input provided
    }
    
    updateFirestoreState({
        time: seconds,
        initialTime: seconds,
        running: false
    });
    
    // Clear the inputs after setting
    hoursInput.value = '';
    minutesInput.value = '';
    secondsInput.value = '';
}

export function handleLapReset() {
    const localState = getLocalState();
    
    if (localState.running) { 
        // Lap
        const newLaps = [...(localState.laps || []), { 
            text: `Lap ${(localState.laps || []).length + 1}`, 
            time: formatTime(localState.time) 
        }];
        updateFirestoreState({ laps: newLaps });
    } else { 
        // Reset
        updateFirestoreState({
            time: localState.initialTime || 0,
            laps: [],
            alarmTriggered: false
        });
        document.body.classList.remove('alarm-active');
    }
}

export function handleReverse() {
    const localState = getLocalState();
    const stateToUpdate = {
        direction: localState.direction * -1
    };
    
    // If running, persist the current time before changing direction.
    if (localState.running) {
        stateToUpdate.time = localState.time;
    }
    
    updateFirestoreState(stateToUpdate);
}

export function handleSetAlarm() {
    const alarmSeconds = parseTimeInputs(alarmHoursInput, alarmMinutesInput, alarmSecondsInput);
    
    if (alarmSeconds === 0 && !alarmHoursInput.value && !alarmMinutesInput.value && !alarmSecondsInput.value) {
        return; // No input provided
    }
    
    updateFirestoreState({
        alarmTime: alarmSeconds,
        alarmTriggered: false
    });
    document.body.classList.remove('alarm-active');
    
    // Clear the inputs after setting
    alarmHoursInput.value = '';
    alarmMinutesInput.value = '';
    alarmSecondsInput.value = '';
}

export function handleClearAlarm() {
    updateFirestoreState({
        alarmTime: null,
        alarmTriggered: false
    });
    document.body.classList.remove('alarm-active');
    
    // Clear the inputs
    alarmHoursInput.value = '';
    alarmMinutesInput.value = '';
    alarmSecondsInput.value = '';
}

export function handleSetSpeed(speed) {
    const localState = getLocalState();
    const stateToUpdate = {
        speed: speed
    };
    
    // If running, persist the current time before changing speed.
    if (localState.running) {
        stateToUpdate.time = localState.time;
    }
    
    updateFirestoreState(stateToUpdate);
}

// Update alarm inputs when timer state changes
export function updateAlarmInputs(alarmTime) {
    if (alarmTime !== null && alarmTime !== undefined) {
        setTimeInputs(alarmTime, alarmHoursInput, alarmMinutesInput, alarmSecondsInput);
    } else {
        setTimeInputs(null, alarmHoursInput, alarmMinutesInput, alarmSecondsInput);
    }
}

// Keyboard handler for Enter key
function handleEnterKey(event, handler) {
    if (event.key === 'Enter') {
        handler();
    }
}

// Add Enter key support for inputs
hoursInput.addEventListener('keydown', (e) => handleEnterKey(e, handleSetTime));
minutesInput.addEventListener('keydown', (e) => handleEnterKey(e, handleSetTime));
secondsInput.addEventListener('keydown', (e) => handleEnterKey(e, handleSetTime));

alarmHoursInput.addEventListener('keydown', (e) => handleEnterKey(e, handleSetAlarm));
alarmMinutesInput.addEventListener('keydown', (e) => handleEnterKey(e, handleSetAlarm));
alarmSecondsInput.addEventListener('keydown', (e) => handleEnterKey(e, handleSetAlarm));

// Auto-tab functionality for time inputs
function setupAutoTab(input, nextInput, maxValue) {
    input.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value > maxValue) {
            e.target.value = maxValue;
        }
        if (e.target.value.length >= 2 && nextInput) {
            nextInput.focus();
        }
    });
}

// Setup auto-tab for timer inputs
setupAutoTab(hoursInput, minutesInput, 99);
setupAutoTab(minutesInput, secondsInput, 59);
setupAutoTab(secondsInput, null, 59);

// Setup auto-tab for alarm inputs
setupAutoTab(alarmHoursInput, alarmMinutesInput, 99);
setupAutoTab(alarmMinutesInput, alarmSecondsInput, 59);
setupAutoTab(alarmSecondsInput, null, 59); 