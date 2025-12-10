// ===============================================
// render.js (Room + System Output Rendering)
// ===============================================

export function renderSystem(msg) {
    const output = document.getElementById("output");
    if (output) {
        output.innerHTML += `<div class="system-msg">${msg}</div><br>`;
        output.scrollTop = output.scrollHeight;
    }

    // Mirror server errors while in modal
    const modalOverlay = document.getElementById("modal-overlay");
    const authError = document.getElementById("auth-error");

    if (
        modalOverlay &&
        !modalOverlay.classList.contains("hidden") &&
        authError
    ) {
        authError.textContent = msg;
    }
}

export function renderRoom(room) {
    const output = document.getElementById("output");
    if (!output) return;

    // Scroll input bar into view (mobile)
    const inputBar = document.getElementById("input-bar");
    if (inputBar) inputBar.scrollIntoView({ behavior: "smooth" });

    let html = `
        <div class="room-title">${room.title}</div>
        <div class="room-desc">
            ${(room.desc || []).map(l => `<p>${l}</p>`).join("")}
        </div>
        <div class="room-exits">
            <b>Exits:</b>
            ${(room.exits || []).map(e => `<span class="exit">${e}</span>`).join(", ")}
        </div>
    `;

    output.innerHTML += html + "<br>";
    output.scrollTop = output.scrollHeight;

    // Background image (if room has one)
    if (room.background) {
        document.body.style.backgroundImage = `url('images/${room.background}.jpg')`;
    }
}
