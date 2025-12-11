export function renderRoom(room) {
    const output = document.getElementById("output");
    if (!output) return;

    const paragraphs = (room.desc || [])
        .map(line => `<p>${line}</p>`)
        .join("");

    // --- NEW: players in this room ---
    let playersHtml = "";
    if (room.players && room.players.length > 0) {
        const others = room.players;
        const label  = "Players:";
        const list   = others.map(name => `<span class="room-player">${name}</span>`).join(", ");
        playersHtml = `
            <div class="room-players">
                <b>${label}</b> ${list}
            </div>
        `;
    } else {
        playersHtml = `
            <div class="room-players">
                <b>Players:</b> (just you)
            </div>
        `;
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

    // BACKGROUND IMAGE
    if (room.background) {
        document.body.style.backgroundImage = `url('images/${room.background}')`;
    }
}
