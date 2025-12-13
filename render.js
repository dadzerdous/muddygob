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
    if (data.players?.length) {
        out.innerHTML += `<div class="players"><strong>Players here:</strong><br>${data.players.map(n => `• ${n}`).join("<br>")}</div>`;
    }

    // Remove any previously open object menus
    hideAllObjectActionMenus();

    out.scrollTop = out.scrollHeight;
}

// Dim movement buttons if exits don't allow direction
function updateMovementButtons() {
    const dirs = ["north","south","east","west"];
    dirs.forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        if (!btn) return;

        if (data.exits.includes(d)) {
            btn.classList.remove("disabled");
        } else {
            btn.classList.add("disabled");
        }
    });
}

updateMovementButtons();


// ===============================================
// CLICK EVENTS FOR OLD OBJECT BUTTONS (legacy)
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

function hideAllObjectActionMenus() {
    document.querySelectorAll(".obj-actions").forEach(el => el.remove());
}

document.addEventListener("click", e => {
    // Clicked outside any object → close menus
    if (!e.target.classList.contains("obj")) {
        hideAllObjectActionMenus();
        return;
    }

    const span = e.target;
    const name = span.getAttribute("data-name");
    const actions = JSON.parse(span.getAttribute("data-actions"));

    hideAllObjectActionMenus(); // close previous

    const menu = document.createElement("div");
    menu.classList.add("obj-actions");
    menu.innerHTML = actions
        .map(a => `<button data-action="${a}" data-name="${name}">${a}</button>`)
        .join(" ");

    span.insertAdjacentElement("afterend", menu);
});

document.addEventListener("click", e => {
    if (!e.target.matches(".obj-actions button")) return;

    const action = e.target.getAttribute("data-action");
    const name   = e.target.getAttribute("data-name");

    sendText(`${action} ${name}`);
    hideAllObjectActionMenus();
});
