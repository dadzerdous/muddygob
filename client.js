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

    // Heartbeat
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
        }
    }, 20000);

    // 🔥 Attempt auto-resume if we have a token
    const token = localStorage.getItem("mg_token");
    if (token) {
        ws.send(JSON.stringify({ type: "resume", token }));
    }
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

    if (raw === "pong") return;

    // Try to parse JSON
    let data;
    try {
        data = JSON.parse(raw);
    } catch {
        // Raw plaintext message
        return renderSystem(raw);
    }

    // Handle JSON packets
    switch (data.type) {
        case "players_online":
            if (playersOnlineEl)
                playersOnlineEl.textContent = `Players Online: ${data.count}`;
            return;

        case "system":
        case "session_token":
        case "room":
            return routeMessage(data);

        default:
            console.warn("Unknown packet:", data);
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
            
            case "session_token":
    localStorage.setItem("mg_token", data.token);
    return;


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
        case "ArrowUp":    sendText("move north"); break;
        case "ArrowDown":  sendText("move south"); break;
        case "ArrowLeft":  sendText("move west"); break;
        case "ArrowRight": sendText("move east"); break;
    }
});






