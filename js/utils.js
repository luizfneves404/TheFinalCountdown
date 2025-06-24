export function formatTime(totalSeconds) {
    totalSeconds = typeof totalSeconds === 'number' ? totalSeconds : 0;
    const isNegative = totalSeconds < 0;
    if (isNegative) totalSeconds = Math.abs(totalSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${isNegative ? '-' : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function parseTimeInputs(hoursInput, minutesInput, secondsInput) {
    const hours = parseInt(hoursInput.value || '0', 10);
    const minutes = parseInt(minutesInput.value || '0', 10);
    const seconds = parseInt(secondsInput.value || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
}

export function setTimeInputs(totalSeconds, hoursInput, minutesInput, secondsInput) {
    if (totalSeconds === null || totalSeconds === undefined) {
        hoursInput.value = '';
        minutesInput.value = '';
        secondsInput.value = '';
        return;
    }
    
    const hours = Math.floor(Math.abs(totalSeconds) / 3600);
    const minutes = Math.floor((Math.abs(totalSeconds) % 3600) / 60);
    const seconds = Math.floor(Math.abs(totalSeconds) % 60);
    
    hoursInput.value = hours > 0 ? hours : '';
    minutesInput.value = minutes > 0 ? minutes : '';
    secondsInput.value = seconds > 0 ? seconds : '';
}

export function showView(view) {
    const sessionUI = document.getElementById('session-ui');
    const timersListUI = document.getElementById('timers-list-ui');
    const timerUI = document.getElementById('timer-ui');
    
    sessionUI.classList.add('hidden');
    timersListUI.classList.add('hidden');
    timerUI.classList.add('hidden');
    
    if (view === 'session') sessionUI.classList.remove('hidden');
    else if (view === 'list') timersListUI.classList.remove('hidden');
    else if (view === 'timer') timerUI.classList.remove('hidden');
} 