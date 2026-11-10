function updateTimeTheme() {
    const hour = new Date().getHours();
    document.body.classList.toggle("dark-mode", hour >= 19 || hour < 6);
}

updateTimeTheme();
setInterval(updateTimeTheme, 60_000);
document.addEventListener("visibilitychange", updateTimeTheme);
