// ===============================================
// client.js – Networking + Message Routing
// ===============================================

import { hideAuthUI } from "./ui.js";
import { renderRoom, renderSystem } from "./render.js";

let ws = null;

// -------------------------------------------------
// CONNECT WEBSOCKET
// -------------------------------------------------
export function initWebSocket(url) {
    ws = new WebSocket(url);

    const statusEl = document.getElementById("connection-status");
    statusEl.textContent = "Connecting...";

    ws.onopen = () => {
        statusEl.textContent = "✓ Connected!";
    };

    ws.onerror = () => {
        statusEl.textContent = "⚠ Connection error";
    };

    ws.onclose = () => {
        statusEl.textContent = "✖ Disconnected";
    };

    ws.onmessage = (event) => {
        const raw = event.data;

        // Try JSON
        try {
            const data = JSON.parse(raw);
            routeMessage(data);
            return;
        } catch (_) {
            // Not JSON → treat as plain text
            renderSystem(raw);
        }
    };
}

// -------------------------------------------------
// SEND JSON + TEXT
// -------------------------------------------------
export function sendJSON(obj) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(obj));
    }
}

export function sendText(text) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(text);
    }
}

// -------------------------------------------------
// ROUTE SERVER PACKETS
// -------------------------------------------------
function routeMessage(data) {
    switch (data.type) {
        case "system":
            renderSystem(data.msg);
            break;

        case "room":
            hideAuthUI();
            renderRoom(data);
            break;

        default:
            console.warn("Unknown server packet:", data);
    }
}

// -------------------------------------------------
// EXPORTED FOR UI
// -------------------------------------------------
export function beginCreateAccount(name, pass, race, pronoun) {
    sendJSON({
        type: "create_account",
        name,
        password: pass,
        race,
        pronoun
    });
}

export function attemptLogin(loginId, password) {
    sendJSON({
        type: "try_login",
        login: loginId,
        password
    });
}

// -------------------------------------------------
// MOVEMENT CONTROLS
// -------------------------------------------------
document.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp":    sendText("move up"); break;
        case "ArrowDown":  sendText("move down"); break;
        case "ArrowLeft":  sendText("move left"); break;
        case "ArrowRight": sendText("move right"); break;
    }
});
