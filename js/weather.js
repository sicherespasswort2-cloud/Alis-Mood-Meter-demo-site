const weatherWidget = document.getElementById("weather-widget");
const weatherIcon = document.getElementById("weather-icon");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherDescription = document.getElementById("weather-description");
const weatherApiUrl = "https://api.open-meteo.com/v1/forecast?latitude=53.5511&longitude=9.9937&current=temperature_2m,weather_code,is_day&timezone=Europe%2FBerlin";
const weatherClasses = [
    "weather-clear",
    "weather-cloudy",
    "weather-fog",
    "weather-rain",
    "weather-snow",
    "weather-storm",
    "weather-night",
    "weather-unavailable"
];

if (!document.querySelector(".background-slideshow")) {
    document.body.classList.add("weather-journal");
}

function describeWeather(code, isDay) {
    if (code === 0) return { state: "clear", description: isDay ? "Clear skies" : "Clear night", icon: isDay ? "☀️" : "🌙" };
    if (code === 1) return { state: "clear", description: "Mostly clear", icon: isDay ? "🌤️" : "🌙" };
    if (code === 2) return { state: "cloudy", description: "Partly cloudy", icon: "⛅" };
    if (code === 3) return { state: "cloudy", description: "Overcast", icon: "☁️" };
    if (code === 45 || code === 48) return { state: "fog", description: "Foggy", icon: "🌫️" };
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { state: "rain", description: "Rainy", icon: "🌧️" };
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { state: "snow", description: "Snowy", icon: "❄️" };
    }
    if ([95, 96, 99].includes(code)) return { state: "storm", description: "Thunderstorm", icon: "⛈️" };

    throw new Error(`Unknown weather code: ${code}`);
}

function showWeatherUnavailable(error) {
    document.body.classList.remove(...weatherClasses);
    document.body.classList.add("weather-unavailable");
    weatherWidget?.setAttribute("aria-label", "Live weather for Hamburg is unavailable.");
    weatherIcon.textContent = "⚠️";
    weatherTemperature.textContent = "—";
    weatherDescription.textContent = "Weather unavailable";
    console.error("Could not load live Hamburg weather:", error);
}

async function updateWeather() {
    if (document.visibilityState === "hidden") return;

    try {
        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
            throw new Error(`Weather service returned HTTP ${response.status}.`);
        }

        const data = await response.json();
        const current = data.current;
        if (
            !current ||
            typeof current.temperature_2m !== "number" ||
            !Number.isInteger(current.weather_code) ||
            (current.is_day !== 0 && current.is_day !== 1)
        ) {
            throw new Error("Weather service returned incomplete current conditions.");
        }

        const weather = describeWeather(current.weather_code, current.is_day === 1);
        document.body.classList.remove(...weatherClasses);
        document.body.classList.add(`weather-${weather.state}`);
        if (current.is_day === 0) document.body.classList.add("weather-night");

        weatherIcon.textContent = weather.icon;
        weatherTemperature.textContent = `${Math.round(current.temperature_2m)}°C`;
        weatherDescription.textContent = weather.description;
        weatherWidget?.setAttribute(
            "aria-label",
            `Hamburg weather: ${weather.description}, ${Math.round(current.temperature_2m)} degrees Celsius.`
        );
    } catch (error) {
        showWeatherUnavailable(error);
    }
}

updateWeather();
setInterval(updateWeather, 15 * 60 * 1000);
document.addEventListener("visibilitychange", updateWeather);
