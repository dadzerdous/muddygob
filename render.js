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

    // -----------------------------------------------
    // Build description with inline clickable objects
    // -----------------------------------------------
    let descHtml = "";
    const objects = data.objects || [];

    function inlineObject(word) {
        const obj = objects.find(o => o.name.toLowerCase() === word.toLowerCase());
        if (!obj) return word;

        const emoji = obj.emoji || "";
        return `${emoji} <span class="obj" data-name="${obj.name}" data-actions='${JSON.stringify(obj.actions)}'>${obj.name}</span>`;
    }

    const lines = Array.isArray(data.desc) ? data.desc : [data.desc];

    lines.forEach(line => {
        let processed = line;

        objects.forEach(o => {
            const regex = new RegExp(`\\b${o.name}\\b`, "gi");
            processed = processed.replace(regex, match => inlineObject(match));
        });

        descHtml += `<p>${processed}</p>`;
    });

    out.innerHTML += descHtml;

    // -----------------------------------------------
    // EXITS
    // -----------------------------------------------
    out.innerHTML += `<div class="exits"><strong>Exits:</strong> ${data.exits.join(", ")}</div>`;

    // -----------------------------------------------
    // PLAYERS
    // -----------------------------------------------
    if (data.players?.length) {
        out.innerHTML += `<div class="players"><strong>Players here:</strong><br>${data.players
            .map(n => `• ${n}`).join("<br>")}</div>`;
    }

    // -----------------------------------------------
    // DIM MOVEMENT BUTTONS
    // -----------------------------------------------
    updateMovementButtons(data.exits);

    // Close old menus
    hideAllObjectActionMenus();

    out.scrollTop = out.scrollHeight;
}

// ===============================================
// Dim movement buttons
// ===============================================
function updateMovementButtons(exits) {
    const dirs = ["north", "south", "east", "west"];

    dirs.forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        if (!btn) return;

        if (exits.includes(d)) btn.classList.remove("disabled");
        else btn.classList.add("disabled");
    });
}

// ===============================================
// Object inline action menus
// ===============================================

function hideAllObjectActionMenus() {
    document.querySelectorAll(".obj-actions").forEach(el => el.remove());
}

// Clicking on object names
document.addEventListener("click", e => {
    if (!e.target.classList.contains("obj")) {
        hideAllObjectActionMenus();
        return;
    }

    const span = e.target;
    const name = span.getAttribute("data-name");
    const actions = JSON.parse(span.getAttribute("data-actions"));

    hideAllObjectActionMenus();

    const menu = document.createElement("div");
    menu.classList.add("obj-actions");
    menu.innerHTML = actions
        .map(a => `<button data-action="${a}" data-name="${name}">${a}</button>`)
        .join(" ");

    span.insertAdjacentElement("afterend", menu);
});

// Clicking an action inside the menu
document.addEventListener("click", e => {
    if (!e.target.matches(".obj-actions button")) return;

    const action = e.target.getAttribute("data-action");
    const name   = e.target.getAttribute("data-name");

    sendText(`${action} ${name}`);
    hideAllObjectActionMenus();
});
