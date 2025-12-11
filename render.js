// ===============================================
// render.js – Room + System Rendering
// ===============================================

export function renderSystem(msg) {
    const output = document.getElementById("output");
    if (output) {
        output.innerHTML += `<div class="system-msg">${msg}</div><br>`;
        output.scrollTop = output.scrollHeight;
    }

    // Also pipe system messages into the auth modal if open
    const modalOverlay = document.getElementById("modal-overlay");
    const authError = document.getElementById("auth-error");
    if (modalOverlay && !modalOverlay.classList.contains("hidden") && authError) {
        authError.textContent = msg;
    }
}

export function renderRoom(room) {
    const output = document.getElementById("output");
    if (!output) return;

    const paragraphs = (room.desc || [])
        .map(line => `<p>${line}</p>`)
        .join("");

    // players list
    let playersHtml = "";
    if (room.players && room.players.length > 0) {
        playersHtml = `
            <div class="room-players">
                <b>Players:</b> 
                ${room.players.map(name => `<span class="room-player">${name}</span>`).join(", ")}
            </div>
        `;
    } else {
        playersHtml = `<div class="room-players"><b>Players:</b> just you</div>`;
    }

    const html = `
        <div class="room-title">${room.title}</div>
        <div class="room-desc">${paragraphs}</div>
        ${playersHtml}
        <div class="room-exits">
            <b>Exits:</b> 
            ${(room.exits || []).map(e => `<span class="exit">${e}</span>`).join(", ")}
        </div>
    `;

    output.innerHTML += html + "<br>";
    output.scrollTop = output.scrollHeight;

    // background 
    if (room.background) {
        document.body.style.backgroundImage = `url('images/${room.background}')`;
    }
}
