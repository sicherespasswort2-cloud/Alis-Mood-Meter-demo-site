const moods = [
    { name: "horrible", color: "#ef4056" },
    { name: "bad", color: "#ff8a45" },
    { name: "okaish", color: "#d9a928" },
    { name: "good", color: "#65b956" },
    { name: "great", color: "#20b978" }
];

const meter = document.getElementById("mood-meter");
const message = document.getElementById("mood-message");
const countdown = document.getElementById("mood-countdown");
const toggles = [...document.querySelectorAll(".mood-toggle")];

let baseMoodIndex = 4;
let nextUpdate = Date.now() + 180_000;

function updateMood() {
    const checkedCount = toggles.filter(toggle => toggle.checked).length;
    const moodIndex = Math.max(0, baseMoodIndex - checkedCount);
    const mood = moods[moodIndex];

    meter.style.setProperty("--mood-progress", `${moodIndex * 25}%`);
    meter.style.setProperty("--mood-color", mood.color);
    meter.setAttribute("aria-valuenow", moodIndex);
    meter.setAttribute("aria-valuetext", mood.name);
    message.textContent = `Ali feels ${mood.name}.`;
}

function updateCountdown() {
    const secondsLeft = Math.max(0, Math.ceil((nextUpdate - Date.now()) / 1000));
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = String(secondsLeft % 60).padStart(2, "0");
    countdown.textContent = `${minutes}:${seconds}`;
}

toggles.forEach(toggle => toggle.addEventListener("change", updateMood));

setInterval(() => {
    baseMoodIndex = Math.floor(Math.random() * moods.length);
    nextUpdate = Date.now() + 180_000;
    updateMood();
}, 180_000);

updateMood();
updateCountdown();
setInterval(updateCountdown, 1000);