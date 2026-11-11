const countdown = document.getElementById("countdown");
const nextUpdateTime = document.getElementById("next-update-time");

function getNextMoodUpdate(now) {
    const tuesday = 2; // Sunday = 0, Tuesday = 2
    const daysUntilTuesday = (tuesday - now.getDay() + 7) % 7;
    const midnight = new Date(now);
    midnight.setDate(now.getDate() + daysUntilTuesday);
    midnight.setHours(0, 0, 0, 0);

    const afternoon = new Date(midnight);
    afternoon.setHours(13, 15, 0, 0);

    if (midnight > now) return midnight;
    if (afternoon > now) return afternoon;

    midnight.setDate(midnight.getDate() + 7);
    return midnight;
}

function updateCountdown() {
    const now = new Date();
    const nextUpdate = getNextMoodUpdate(now);
    const secondsLeft = Math.ceil((nextUpdate - now) / 1000);

    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    countdown.textContent =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;

    nextUpdateTime.textContent =
        `Next update: ${nextUpdate.toLocaleString()}`;
}

updateCountdown();
setInterval(updateCountdown, 1000);