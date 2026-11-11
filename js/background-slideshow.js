const photos = [
    "images/images/images/mood-1.jpg",
    "images/images/mood-2.jpg",
    "images/images/mood-3.jpg",
    "images/images/mood-4.jpg",
    "images/images/mood-5.jpg",
    "images/images/mood-6.jpg",
    "images/images/mood-7.jpg",
    "images/images/mood-8.jpg",
    "images/images/mood-9.jpg"
];

const layers = [
    document.getElementById("background-a"),
    document.getElementById("background-b")
];
const popupContainer = document.getElementById("photo-popups");
const suckPopupsButton = document.getElementById("suck-popups");
const eaterButton = document.getElementById("eater-button");
const eaterStatus = document.getElementById("eater-status");
const popupSizes = ["small", "medium", "large"];

let activeLayer = 0;
let photoIndex = 0;
let popupPhotoIndex = 0;
let isVacuumingPopups = false;
let isEaterRunning = false;

layers[activeLayer].src = photos[photoIndex];

function showNextPhoto() {
    if (photos.length < 2) return;

    photoIndex = (photoIndex + 1) % photos.length;
    const nextLayer = 1 - activeLayer;
    const preload = new Image();

    preload.onload = () => {
        layers[nextLayer].src = preload.src;
        layers[nextLayer].classList.add("is-visible");
        layers[activeLayer].classList.remove("is-visible");
        activeLayer = nextLayer;
    };

    preload.src = photos[photoIndex];
}

// Change image every 12 seconds; the fade takes 3 seconds.
setInterval(showNextPhoto, 12_000);

function showPhotoPopup() {
    const popup = document.createElement("section");
    const titleBar = document.createElement("div");
    const title = document.createElement("span");
    const closeButton = document.createElement("button");
    const image = document.createElement("img");
    const size = popupSizes[Math.floor(Math.random() * popupSizes.length)];

    popup.className = `photo-popup photo-popup--${size}`;
    popup.setAttribute("aria-label", "Mood photo pop-up");
    titleBar.className = "photo-popup-titlebar";
    title.textContent = "Mood photo";
    closeButton.className = "photo-popup-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close photo pop-up");
    closeButton.textContent = "×";
    image.src = photos[popupPhotoIndex];
    image.alt = "A photo from the mood meter slideshow";

    const margin = 12;
    const maxLeft = Math.max(margin, window.innerWidth - 280 - margin);
    const maxTop = Math.max(margin, window.innerHeight - 210 - margin);
    popup.style.left = `${margin + Math.random() * (maxLeft - margin)}px`;
    popup.style.top = `${margin + Math.random() * (maxTop - margin)}px`;

    closeButton.addEventListener("click", () => popup.remove());
    titleBar.append(title, closeButton);
    popup.append(titleBar, image);
    popupContainer.append(popup);

    popupPhotoIndex = (popupPhotoIndex + 1) % photos.length;
}

setInterval(() => {
    if (!isVacuumingPopups && !isEaterRunning) showPhotoPopup();
}, 10_000);

function updatePopupActionButtons() {
    const disabled = isVacuumingPopups || isEaterRunning;
    suckPopupsButton.disabled = disabled;
    eaterButton.disabled = disabled;
}

suckPopupsButton.addEventListener("click", () => {
    const popups = [...popupContainer.querySelectorAll(".photo-popup")];
    if (popups.length === 0 || isVacuumingPopups || isEaterRunning) return;

    isVacuumingPopups = true;
    updatePopupActionButtons();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        popups.forEach(popup => popup.remove());
        isVacuumingPopups = false;
        updatePopupActionButtons();
        return;
    }

    const target = suckPopupsButton.getBoundingClientRect();
    const targetX = target.left + target.width / 2;
    const targetY = target.top + target.height / 2;
    let remainingPopups = popups.length;

    function removeSuckedPopup(event) {
        if (event.animationName !== "popup-suck") return;
        event.currentTarget.remove();
        remainingPopups -= 1;

        if (remainingPopups === 0) {
            isVacuumingPopups = false;
            updatePopupActionButtons();
        }
    }

    popups.forEach(popup => {
        const bounds = popup.getBoundingClientRect();
        popup.style.setProperty("--suck-x", `${targetX - (bounds.left + bounds.width / 2)}px`);
        popup.style.setProperty("--suck-y", `${targetY - (bounds.top + bounds.height / 2)}px`);
        popup.addEventListener("animationend", removeSuckedPopup);
        popup.classList.add("is-sucking");
    });
});

function createPopupEater() {
    const character = document.createElement("div");
    const face = document.createElement("span");
    const eyes = document.createElement("span");
    const mouth = document.createElement("span");
    const feet = document.createElement("span");

    character.className = "popup-eater";
    character.setAttribute("aria-hidden", "true");
    face.className = "popup-eater-face";
    eyes.className = "popup-eater-eyes";
    mouth.className = "popup-eater-mouth";
    feet.className = "popup-eater-feet";
    face.append(eyes, mouth);
    character.append(face, feet);
    return character;
}

function moveEaterTo(character, left, top) {
    character.style.left = `${left}px`;
    character.style.top = `${top}px`;
}

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

eaterButton.addEventListener("click", async () => {
    const popups = [...popupContainer.querySelectorAll(".photo-popup")];
    if (popups.length === 0 || isVacuumingPopups || isEaterRunning) return;

    isEaterRunning = true;
    updatePopupActionButtons();
    eaterStatus.textContent = `The pop-up eater is going after ${popups.length} photo pop-ups.`;

    const character = createPopupEater();
    const start = eaterButton.getBoundingClientRect();
    const characterWidth = 58;
    popupContainer.append(character);
    moveEaterTo(
        character,
        start.left + (start.width - characterWidth) / 2,
        start.top - 62
    );
    character.getBoundingClientRect();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
        for (const popup of popups) {
            if (!popup.isConnected) continue;

            const bounds = popup.getBoundingClientRect();
            character.classList.toggle(
                "is-facing-left",
                bounds.left + bounds.width / 2 < window.innerWidth / 2
            );
            moveEaterTo(
                character,
                bounds.left + (bounds.width - characterWidth) / 2,
                Math.max(8, bounds.top - 54)
            );

            if (!reducedMotion) {
                character.classList.add("is-climbing");
                await wait(720);
                character.classList.remove("is-climbing");
            }

            if (!popup.isConnected) continue;
            character.classList.add("is-eating");
            popup.classList.add("is-being-eaten");
            eaterStatus.textContent = "Nom! The pop-up eater got a photo.";
            await wait(reducedMotion ? 0 : 560);
            popup.remove();
            character.classList.remove("is-eating");
        }

        eaterStatus.textContent = "All clear! The pop-up eater ate every photo.";
    } finally {
        character.remove();
        isEaterRunning = false;
        updatePopupActionButtons();
    }
});