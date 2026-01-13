/**
 * timer.js - Metal Karaoke Countdown
 */

var START_TIME = 30; // Set your default time
let timeLeft = START_TIME;
let timerCallback = null;
let timerInterval = null;
let isPaused = false;

document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('countdown-display');
    if (timerDisplay) {
        startTimer();
    }
});

// --- PUBLIC CONTROLS ---

/**
 * Assign a function to run when timer hits 0
 * @param {Function} fn 
 */
function setTimerCallback(fn) {
    timerCallback = fn;
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;
        document.getElementById('countdown-display').style.opacity = "0.4";
    }
}

function resumeTimer() {
    if (isPaused) {
        startTimer();
        isPaused = false;
        document.getElementById('countdown-display').style.opacity = "1";
    }
}

function resetTimer() {
    timeLeft = START_TIME;
    updateDisplay();
}

// --- INTERNAL ENGINE ---

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            if (timerCallback) timerCallback();
            timeLeft = START_TIME; // Auto-reset
        }
    }, 1000);
}

function updateDisplay() {
    const displayElement = document.getElementById('countdown-display');
    if (!displayElement) return;

    // Formatting
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    displayElement.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    // Erratic "Panic" Mode (Last 5 seconds)
    if (timeLeft <= 5 && timeLeft > 0) {
        displayElement.classList.add('timer-danger');
        
        // Randomly "glitch" the size between 4rem and 5.5rem
        const glitchSize = 4 + (Math.random() * 1.5);
        displayElement.style.fontSize = `${glitchSize}rem`;
    } else {
        displayElement.classList.remove('timer-danger');
        displayElement.style.fontSize = "4rem";
    }
}