// ===============================================
// render.js – Room + System Output Rendering
// ===============================================

export function renderSystem(msg) {
    const output = document.getElementById("output");

    if (output) {
        output.innerHTML += `<div class="system-msg">${msg}</div><br>`;
        output.scrollTop = output.scrollHeight;
    }

    // Mirror into auth modal (if open)
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

    let html = `
        <div class="room-title">${room.title}</div>
        <div class="room-desc">
            ${(room.desc || []).map(line => `<p>${line}</p>`).join("")}
        </div>
        <div class="room-exits">
            <b>Exits:</b>
            ${(room.exits || []).map(e => `<span class="exit">${e}</span>`).join(", ")}
        </div>
    `;

    output.innerHTML += html + "<br>";
    output.scrollTop = output.scrollHeight;

    // Background image support
    if (room.background) {
        document.body.style.backgroundImage = `url('images/${room.background}.jpg')`;
    }
}
