const sausageButton = document.getElementById("sausage-launch");
const sausageLayer = document.getElementById("sausage-layer");
const sausageStatus = document.getElementById("sausage-status");
const activeSausages = new Set();
const maxActiveSausages = 6;

function launchSausage() {
    if (activeSausages.size >= maxActiveSausages) {
        sausageStatus.textContent = "Too many sausages are bouncing already. Wait for one to roll away.";
        return;
    }

    const sausage = document.createElement("span");
    sausage.className = "flying-sausage";
    const buttonBounds = sausageButton.getBoundingClientRect();
    const startX = buttonBounds.left + buttonBounds.width / 2 - 39;
    const startY = buttonBounds.top - 22;
    const targetX = window.innerWidth / 2 - 39;
    const targetY = window.innerHeight * 0.42;
    const direction = targetX >= startX ? 1 : -1;
    const duration = 1.05 + Math.random() * 0.35;
    const velocityX = (targetX - startX) / duration;
    const velocityY = (targetY - startY - 0.5 * 800 * duration * duration) / duration;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = startX;
    let y = startY;
    let vx = velocityX;
    let vy = velocityY;
    let rotation = 0;
    let previousTime = 0;
    let elapsed = 0;

    sausageLayer.append(sausage);
    sausage.style.left = `${x}px`;
    sausage.style.top = `${y}px`;
    sausage.style.transform = `rotate(${direction * 20}deg)`;
    activeSausages.add(sausage);
    sausageStatus.textContent = "Sausage away!";

    function finish() {
        sausage.remove();
        activeSausages.delete(sausage);
    }

    if (reducedMotion) {
        x = window.innerWidth / 2 - 39;
        y = window.innerHeight * 0.42;
        sausage.style.left = `${x}px`;
        sausage.style.top = `${y}px`;
        sausage.animate(
            [{ opacity: 1 }, { opacity: 0, offset: 0.85 }, { opacity: 0 }],
            { duration: 900, easing: "ease-out" }
        ).finished.then(finish);
        return;
    }

    function animate(time) {
        if (!sausage.isConnected) {
            activeSausages.delete(sausage);
            return;
        }

        if (!previousTime) previousTime = time;
        const delta = Math.min((time - previousTime) / 1000, 0.032);
        previousTime = time;
        elapsed += delta;
        vx *= Math.pow(0.999, delta * 60);
        vy += 800 * delta;
        x += vx * delta;
        y += vy * delta;
        rotation += vx * delta * 0.48;

        const maxX = window.innerWidth - 78;
        const maxY = window.innerHeight - 28;
        if (x < 0 || x > maxX) {
            x = Math.max(0, Math.min(x, maxX));
            vx *= -0.78;
        }
        if (y < 0) {
            y = 0;
            vy = Math.abs(vy) * 0.72;
        } else if (y > maxY) {
            y = maxY;
            vy *= -0.72;
            vx *= 0.84;
        }

        sausage.style.left = `${x}px`;
        sausage.style.top = `${y}px`;
        sausage.style.transform = `rotate(${rotation}deg)`;

        if (elapsed > 7 || (elapsed > 2.5 && Math.abs(vy) < 70 && y >= maxY - 1)) {
            finish();
            return;
        }
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

sausageButton.addEventListener("click", launchSausage);
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") return;
    activeSausages.forEach(sausage => sausage.remove());
    activeSausages.clear();
});
