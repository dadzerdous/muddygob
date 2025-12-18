// ===============================================
// client.js – Networking + Message Routing (CLEAN)
// ===============================================

console.log("🌐 client.js loaded");

import { renderRoom, renderSystem } from "./render.js";
import { updatePlayerHUD } from "./hudUI.js";
import {
    hideAuthUI,
    applyThemeForRace,
    bindAuthActions
} from "./ui.js";

// -------------------------------------------------
// WEBSOCKET
// -------------------------------------------------
let ws = null;
let reconnectDelay = 2000;
let manualExit = false;

// -------------------------------------------------
// INIT
// -------------------------------------------------
export function initWebSocket(url) {
    console.log("🔌 initWebSocket:", url);

    ws = new WebSocket(url);
    const statusEl = document.getElementById("connection-status");

    ws.onopen = () => {
        console.log("✅ WS connected");
        if (statusEl) statusEl.textContent = "✓ Connected";

        const token = localStorage.getItem("mg_token");
        if (token) {
            console.log("🔁 resume with token");
            ws.send(JSON.stringify({ type: "resume", token }));
        }
    };

    ws.onclose = () => {
        console.warn("❌ WS disconnected");

        // if this was NOT manual exit, try reconnect later
        if (!manualExit) {
            if (statusEl) statusEl.textContent = "✖ Disconnected";
            setTimeout(() => initWebSocket(url), reconnectDelay);
        }
    };

    ws.onerror = err => {
        console.error("⚠ WS error:", err);
    };

    ws.onmessage = e => {
        const raw = e.data;

        // -------------------------------
        // handle exit command
        // -------------------------------
        if (raw === "manual_exit") {
            console.log("👋 manual exit received");
            manualExit = true;
            localStorage.removeItem("mg_token");
            setTimeout(() => location.reload(), 500);
            return;
        }

        if (raw === "pong") return;

        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            // Not JSON — treat as plain system text
            renderSystem(raw);
            return;
        }

        console.log("📥 packet:", data);
        routeMessage(data);
    };
}

// -------------------------------------------------
// SENDERS
// -------------------------------------------------
export function sendJSON(obj) {
    if (ws?.readyState === WebSocket.OPEN) {
        console.log("📤 sendJSON:", obj);
        ws.send(JSON.stringify(obj));
    }
}

export function sendText(text) {
    if (ws?.readyState === WebSocket.OPEN) {
        console.log("📤 sendText:", text);
        ws.send(text);
    }
}

// -------------------------------------------------
// ROUTER
// -------------------------------------------------
function routeMessage(data) {
    switch (data.type) {

        case "system":
            renderSystem(data.msg);
            break;

        case "session_token":
            console.log("💾 token stored");
            localStorage.setItem("mg_token", data.token);
            break;

        case "player_state":
            console.log("🎭 player_state received");
            hideAuthUI();
            applyThemeForRace(data.player.race);
            updatePlayerHUD(data.player);
            break;

        case "players_online": {
            const el = document.getElementById("players-online");
            if (el) el.textContent = data.count;
            break;
        }

        case "room":
            renderRoom(data);
            break;

        default:
            console.warn("❓ unknown packet", data);
    }
}

// -------------------------------------------------
// AUTH API (called by ui.js)
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
// BIND UI CALLBACKS
// -------------------------------------------------
bindAuthActions(beginCreateAccount, attemptLogin);

// -------------------------------------------------
// MOVEMENT KEYS
// -------------------------------------------------
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") sendText("move north");
    if (e.key === "ArrowDown") sendText("move south");
    if (e.key === "ArrowLeft") sendText("move west");
    if (e.key === "ArrowRight") sendText("move east");
});
