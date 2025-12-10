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

        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            // raw text fallback
            renderSystem(raw);
            return;
        }

        routeMessage(data);
    };
}

export function sendJSON(obj) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(obj));
}

export function sendText(txt) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(txt);
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
            hideAuthUI();    // finally enter game
            renderRoom(data);
            break;

        default:
            console.warn("Unknown server packet:", data);
    }
}

// -------------------------------------------------
// EXPORTS FOR UI
// -------------------------------------------------
export function beginCreateAccount(name, password, race, pronoun) {
    sendJSON({
        type: "create_account",
        name,
        password,
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
// MOVEMENT KEYBOARD
// -------------------------------------------------
document.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp":    sendText("move up"); break;
        case "ArrowDown":  sendText("move down"); break;
        case "ArrowLeft":  sendText("move left"); break;
        case "ArrowRight": sendText("move right"); break;
    }
});
