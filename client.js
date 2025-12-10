// ===============================================
// client.js  (Networking + Message Routing Only)
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
        const text = event.data;
        try {
            const data = JSON.parse(text);
            routeMessage(data);
        } catch {
            renderSystem(text);
        }
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
            hideAuthUI(); // we are now in-game
            renderRoom(data);
            break;

        default:
            console.warn("Unknown message from server:", data);
    }
}

// -------------------------------------------------
// EXPORT for UI
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

export function attemptLogin(loginName, pass) {
    // loginName is typically: name@race.pronoun
    sendJSON({
        type: "try_login",
        login: loginName,
        password: pass
    });
}

// Keyboard movement
document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":    sendText("move up"); break;
        case "ArrowDown":  sendText("move down"); break;
        case "ArrowLeft":  sendText("move left"); break;
        case "ArrowRight": sendText("move right"); break;
    }
});
