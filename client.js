// ===============================================
// client.js – Networking + Message Routing
// ===============================================

import { hideAuthUI } from "./ui.js";
import { renderRoom, renderSystem } from "./render.js";

// -------------------------------------------------
// CONNECT WEBSOCKET
// -------------------------------------------------
// ===============================================
// WebSocket with Auto-Reconnect + Heartbeat
// ===============================================

let ws = null;
let reconnectDelay = 2000;   // 2 seconds
let heartbeatInterval = null;

export function initWebSocket(url) {
    ws = new WebSocket(url);

    const statusEl = document.getElementById("connection-status");
    const playersOnlineEl = document.getElementById("players-online");

    statusEl.textContent = "Connecting...";

    ws.onopen = () => {
        statusEl.textContent = "✓ Connected";

        // Start heartbeat (send ping every 20 sec)
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "ping" }));
            }
        }, 20000);
    };

    ws.onerror = () => {
        statusEl.textContent = "⚠ Connection Error";
    };

    ws.onclose = () => {
        statusEl.textContent = "✖ Disconnected";
        if (playersOnlineEl) playersOnlineEl.textContent = "";

        // Auto-reconnect
        setTimeout(() => initWebSocket(url), reconnectDelay);
    };

    ws.onmessage = (event) => {
        const raw = event.data;

        // PONG response
        if (raw === "pong") return;

        try {
            const data = JSON.parse(raw);

            if (data.type === "players_online") {
                if (playersOnlineEl)
                    playersOnlineEl.textContent = `Players Online: ${data.count}`;
                return;
            }

            routeMessage(data);
        } catch {
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


