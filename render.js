// ===============================================
// render.js – Room + System Rendering (Action Bar)
// ===============================================

import { sendText } from "./client.js";

const actionBar = document.getElementById("action-bar");

// -----------------------------------------------
// SYSTEM MESSAGES
// -----------------------------------------------
export function renderSystem(msg) {
    const out = document.getElementById("output");
    out.innerHTML += `<div class="system-msg">${msg}</div>`;
    out.scrollTop = out.scrollHeight;
}

// -----------------------------------------------
// ROOM RENDER
// -----------------------------------------------
export function renderRoom(data) {
    const out = document.getElementById("output");
    out.innerHTML = "";

    // Hide action bar on room change
    hideActionBar();

    // Title
    out.innerHTML += `<h2>${data.title}</h2>`;

    // -------------------------------------------
    // DESCRIPTION with clickable objects
    // -------------------------------------------
    const objects = data.objects || [];
    const lines = Array.isArray(data.desc) ? data.desc : [data.desc];

    lines.forEach(line => {
        let processed = line;

        objects.forEach(obj => {
            const regex = new RegExp(`\\b${obj.name}\\b`, "gi");
            processed = processed.replace(regex, () => {
                return `
                    ${obj.emoji || ""}
                    <span class="obj"
                          data-name="${obj.name}"
                          data-actions='${JSON.stringify(obj.actions || ["look"])}'>
                        ${obj.name}
                    </span>
                `;
            });
        });

        out.innerHTML += `<p>${processed}</p>`;
    });

    // -------------------------------------------
    // EXITS
    // -------------------------------------------
    out.innerHTML += `
        <div class="exits-block">
            <strong>Exits:</strong> ${data.exits.join(", ")}
        </div>
    `;

    // -------------------------------------------
    // PLAYERS
    // -------------------------------------------
    if (data.players?.length) {
        out.innerHTML += `
            <div class="room-players">
                <strong>Players here:</strong><br>
                ${data.players.map(n => `• ${n}`).join("<br>")}
            </div>
        `;
    }

    updateMovementButtons(data);
    out.scrollTop = out.scrollHeight;
}

// -----------------------------------------------
// ACTION BAR
// ---------------------------------
