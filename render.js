export function renderRoom(room) {
    const output = document.getElementById("output");
    if (!output) return;

    // Combine paragraphs into a single string so we can replace object names
    let roomText = (room.desc || []).join("\n\n");

    // INSERT OBJECT EMOJIS IF PROVIDED
    if (room.objects) {
        for (const [name, obj] of Object.entries(room.objects)) {
            if (!obj.emoji) continue;

            // whole-word replace (rock → 🪨 rock)
            const regex = new RegExp(`\\b${name}\\b`, "gi");
            roomText = roomText.replace(regex, `${obj.emoji} ${name}`);
        }
    }

    // Re-split the enhanced text back into <p> paragraphs
    const paragraphs = roomText
        .split("\n\n")
        .map(l => `<p>${l}</p>`)
        .join("");

    let html = `
        <div class="room-title">${room.title}</div>
        <div class="room-desc">${paragraphs}</div>
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
