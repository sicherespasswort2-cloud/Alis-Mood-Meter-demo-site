const STORAGE_KEY = "mood-meter-journal";
const moodOptions = [
    { name: "rough", color: "#f2767f", value: 0 },
    { name: "low", color: "#ec9a71", value: 1 },
    { name: "okay", color: "#e6c46e", value: 2 },
    { name: "good", color: "#8bc896", value: 3 },
    { name: "great", color: "#65cfad", value: 4 }
];
const form = document.getElementById("mood-form");
const formStatus = document.getElementById("form-status");
const historyList = document.getElementById("history-list");
const emptyState = document.getElementById("empty-state");
const clearHistoryButton = document.getElementById("clear-history");
const weeklyAverage = document.getElementById("weekly-average");
const weeklyCount = document.getElementById("weekly-count");
const weeklyChart = document.getElementById("weekly-chart");

function readEntries() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === null) return [];

        const entries = JSON.parse(stored);
        if (!Array.isArray(entries)) throw new Error("Saved journal data is not a list.");
        return entries.filter(entry =>
            entry &&
            typeof entry.id === "string" &&
            Number.isInteger(entry.mood) &&
            entry.mood >= 0 &&
            entry.mood < moodOptions.length &&
            typeof entry.createdAt === "string" &&
            Array.isArray(entry.context) &&
            typeof entry.note === "string"
        );
    } catch (error) {
        formStatus.textContent = "Could not read saved check-ins. Try clearing site data if this continues.";
        console.error("Could not load mood journal entries:", error);
        return [];
    }
}

let entries = readEntries();

function saveEntries() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return true;
    } catch (error) {
        formStatus.textContent = "Your browser couldn't save this check-in. Check storage permissions and try again.";
        console.error("Could not save mood journal entries:", error);
        return false;
    }
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function makeHistoryEntry(entry) {
    const mood = moodOptions[entry.mood];
    const item = document.createElement("li");
    const dot = document.createElement("span");
    const moodName = document.createElement("strong");
    const meta = document.createElement("div");
    const note = document.createElement("span");
    const context = document.createElement("span");
    const removeButton = document.createElement("button");

    item.className = "history-entry";
    item.style.setProperty("--entry-color", mood.color);
    dot.className = "entry-dot";
    dot.setAttribute("aria-hidden", "true");
    moodName.className = "entry-mood";
    moodName.textContent = mood.name;
    meta.className = "entry-meta";
    note.className = "entry-note";
    note.textContent = entry.note || formatDate(entry.createdAt);
    context.className = "entry-context";
    context.textContent = entry.context.length
        ? `${entry.context.join(" · ")} · ${formatDate(entry.createdAt)}`
        : formatDate(entry.createdAt);
    removeButton.className = "history-delete";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${mood.name} check-in from ${formatDate(entry.createdAt)}`);
    removeButton.addEventListener("click", () => removeEntry(entry.id));

    meta.append(note, context);
    item.append(dot, moodName, meta, removeButton);
    return item;
}

function updateWeeklySummary() {
    const now = Date.now();
    const weekMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const weekEntries = entries.filter(entry => {
        const timestamp = new Date(entry.createdAt).getTime();
        return Number.isFinite(timestamp) && timestamp >= now - weekMilliseconds && timestamp <= now;
    });

    weeklyChart.replaceChildren();
    for (let day = 6; day >= 0; day -= 1) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - day);

        const dayEntries = weekEntries.filter(entry => {
            const entryDate = new Date(entry.createdAt);
            return entryDate.getFullYear() === date.getFullYear() &&
                entryDate.getMonth() === date.getMonth() &&
                entryDate.getDate() === date.getDate();
        });
        const average = dayEntries.length
            ? dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length
            : null;
        const bar = document.createElement("span");
        const label = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);

        bar.className = `chart-bar${average === null ? " is-empty" : ""}`;
        bar.setAttribute("aria-label", average === null
            ? `${label}: no check-in`
            : `${label}: average mood ${moodOptions[Math.round(average)].name}`);
        if (average !== null) {
            bar.style.height = `${Math.max(12, 12 + average * 20)}%`;
        }
        weeklyChart.append(bar);
    }

    if (weekEntries.length) {
        const average = weekEntries.reduce((sum, entry) => sum + entry.mood, 0) / weekEntries.length;
        weeklyAverage.textContent = (average + 1).toFixed(1);
        weeklyCount.textContent = `${weekEntries.length} check-in${weekEntries.length === 1 ? "" : "s"} in the last seven days.`;
    } else {
        weeklyAverage.textContent = "—";
        weeklyCount.textContent = "No check-ins yet. Your first one starts the picture.";
    }
}

function renderHistory() {
    historyList.replaceChildren(...entries.map(makeHistoryEntry));
    const hasEntries = entries.length > 0;
    emptyState.hidden = hasEntries;
    clearHistoryButton.hidden = !hasEntries;
    updateWeeklySummary();
}

function removeEntry(id) {
    const previousEntries = entries;
    entries = entries.filter(entry => entry.id !== id);
    if (!saveEntries()) {
        entries = previousEntries;
        return;
    }
    renderHistory();
    formStatus.textContent = "Check-in removed.";
}

form.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(form);
    const moodValue = Number(formData.get("mood"));
    if (!Number.isInteger(moodValue) || moodValue < 0 || moodValue >= moodOptions.length) {
        formStatus.textContent = "Choose a mood before saving your check-in.";
        return;
    }

    const entry = {
        id: crypto.randomUUID(),
        mood: moodValue,
        context: formData.getAll("context").map(String),
        note: String(formData.get("note")).trim(),
        createdAt: new Date().toISOString()
    };

    entries = [entry, ...entries];
    if (!saveEntries()) {
        entries = entries.filter(savedEntry => savedEntry.id !== entry.id);
        return;
    }

    form.reset();
    renderHistory();
    formStatus.textContent = "Check-in saved in this browser.";
});

clearHistoryButton.addEventListener("click", () => {
    const previousEntries = entries;
    entries = [];
    if (!saveEntries()) {
        entries = previousEntries;
        return;
    }
    renderHistory();
    formStatus.textContent = "Your check-in history has been cleared.";
});

renderHistory();
