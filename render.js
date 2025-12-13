// ===============================================
// render.js – Room + System Rendering
// ===============================================

import { sendText } from "./client.js";

export function renderSystem(msg) {
    const out = document.getElementById("output");
    out.innerHTML += `<div class="system-msg">${msg}</div>`;
    out.scrollTop = out.scrollHeight;
}

export function renderRoom(data) {
    const out = document.getElementById("output");

    // Clear previous
    out.innerHTML = "";

    // Title
    out.innerHTML += `<h2>${data.title}</h2>`;

    // Description
    if (Array.isArray(data.desc)) {
        data.desc.forEach(line => {
            out.innerHTML += `<p>${line}</p>`;
        });
    } else {
        out.innerHTML += `<p>${data.desc}</p>`;
    }

    // EXITS
    out.innerHTML += `<div class="exits">
        <strong>Exits:</strong> ${data.exits.join(", ")}
    </div>`;

    // PLAYERS
    if (data.players && data.players.length > 0) {
        out.innerHTML += `<div class="players">
            <strong>Players here:</strong><br>
            ${data.players.map(p => `• ${p}`).join("<br>")}
        </div>`;
    }

    // ============================================
    // NEW: OBJECTS
    // ============================================
    if (data.objects && data.objects.length > 0) {
        out.innerHTML += `<div class="objects">
            <strong>Objects:</strong><br>
            ${data.objects.map(obj => renderObjectBlock(obj)).join("")}
        </div>`;
    }

    out.scrollTop = out.scrollHeight;
}

// ===============================================
// Helper — Renders object with clickable actions
// ===============================================
function renderObjectBlock(obj) {
    const emoji = obj.emoji ? obj.emoji : "•";

    const actions = obj.actions
        .map(a => `<button class="obj-btn" data-action="${a}" data-name="${obj.name}">
            ${a}
        </button>`)
        .join(" ");

    return `
        <div class="object-entry">
            <span class="object-emoji">${emoji}</span>
            <span class="object-name">${obj.name}</span>
            <div class="object-actions">${actions}</div>
        </div>
    `;
}

// ===============================================
// CLICK EVENTS FOR OBJECT BUTTONS
// ===============================================
document.addEventListener("click", e => {
    if (e.target.classList.contains("obj-btn")) {
        const action = e.target.getAttribute("data-action");
        const name   = e.target.getAttribute("data-name");

        sendText(`${action} ${name}`);
    }
});
