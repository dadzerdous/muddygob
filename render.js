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
    out.innerHTML = "";

    // Title
    out.innerHTML += `<h2>${data.title}</h2>`;

    // --- Build description with inline objects ---
    let descHtml = "";
    const objects = data.objects || [];

    function inlineObject(word) {
        const obj = objects.find(o => o.name.toLowerCase() === word.toLowerCase());
        if (!obj) return word;

        const emoji = obj.emoji || "";
        return `${emoji} <span class="obj" data-name="${obj.name}" data-actions='${JSON.stringify(obj.actions)}'>${obj.name}</span>`;
    }

    (Array.isArray(data.desc) ? data.desc : [data.desc])
        .forEach(line => {
            // Replace each object name with clickable markup
            let processed = line;
            objects.forEach(o => {
                const regex = new RegExp(`\\b${o.name}\\b`, "gi");
                processed = processed.replace(regex, match => inlineObject(match));
            });

            descHtml += `<p>${processed}</p>`;
        });

    out.innerHTML += descHtml;

    // EXITS
    out.innerHTML += `<div class="exits"><strong>Exits:</strong> ${data.exits.join(", ")}</div>`;

    // PLAYERS
    if (data.players?.length)
        out.innerHTML += `<div class="players"><strong>Players here:</strong><br>${data.players.map(n => `• ${n}`).join("<br>")}</div>`;

    // Clear old action boxes
    hideAllObjectActionMenus();

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


// ===============================================
// Inline Object Action Menu
// ===============================================

import { sendText } from "./client.js";

function hideAllObjectActionMenus() {
    document.querySelectorAll(".obj-actions").forEach(el => el.remove());
}

document.addEventListener("click", e => {
    // Clicked outside → close all
    if (!e.target.classList.contains("obj")) {
        hideAllObjectActionMenus();
        return;
    }

    // Clicked an object
    const span = e.target;
    const name = span.getAttribute("data-name");
    const actions = JSON.parse(span.getAttribute("data-actions"));

    // Remove any other open menus
    hideAllObjectActionMenus();

    // Build menu
    const menu = document.createElement("div");
    menu.classList.add("obj-actions");
    menu.innerHTML = actions
        .map(a => `<button data-action="${a}" data-name="${name}">${a}</button>`)
        .join(" ");

    // Insert *right after* the object’s parent paragraph
    span.insertAdjacentElement("afterend", menu);
});

// Handle clicking an action button
document.addEventListener("click", e => {
    if (!e.target.matches(".obj-actions button")) return;

    const action = e.target.getAttribute("data-action");
    const name   = e.target.getAttribute("data-name");

    sendText(`${action} ${name}`);

    hideAllObjectActionMenus();
});
