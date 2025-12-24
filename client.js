// ===============================================
// client.js – Networking + Message Routing (FIXED)
// ===============================================

console.log("🌐 client.js loaded");

import { renderRoom, renderSystem } from "./render.js";
import {
    updatePlayerHUD,
    updateHUD,
    setClientHeldItem,
    updateHandsDisplay
} from "./hudUI.js";

import {
    hideAuthUI,
    applyThemeForRace,
    bindAuthActions
} from "./ui.js";
let lastEnergy = null;
let lastStamina = null;
let selfName = null;


// -------------------------------------------------
// WEBSOCKET
// -------------------------------------------------
let ws = null;
let reconnectDelay = 2000;
let manualExit = false;

document.addEventListener("click", e => {
    const el = e.target;
    if (el.classList.contains("cmd-help")) {
        const cmd = el.dataset.cmd;
        sendText(`help ${cmd}`);
    }
});

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
            // If resuming, we tell the server we are back
            ws.send(JSON.stringify({ type: "resume", token }));
        }
    };

    ws.onclose = () => {
        console.warn("❌ WS disconnected");
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

        if (raw === "manual_exit") {
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
// Expose for render.js (break circular dependency)
window.sendText = sendText;

// -------------------------------------------------
// ROUTER
// -------------------------------------------------
function routeMessage(data) {
    switch (data.type) {

        case "system":
            renderSystem(data.msg);
            break;

        case "session_token":
            localStorage.setItem("mg_token", data.token);
            break;

        case "player_state":
            // Critical: Ensure UI elements are revealed
            hideAuthUI();
            if (data.player?.race) applyThemeForRace(data.player.race);
                selfName = data.player.name;
            updatePlayerHUD(data.player);
            updateHandsDisplay(); 
            break;

case "held":
    setClientHeldItem(data.item);
    document.getElementById("hands-bar")?.classList.remove("hidden");
    break;


case "stats": {
    updateHUD(data);

    if (lastEnergy !== null && data.energy > lastEnergy) {
        flashRegen("energy");
    }

    if (lastStamina !== null && data.stamina > lastStamina) {
        flashRegen("stamina");
    }

    lastEnergy = data.energy;
    lastStamina = data.stamina;
    break;
}


        case "players_online": {
            const el = document.getElementById("players-online");
            if (el) el.textContent = data.count;
            break;
        }

        case "room":
            // If we receive a room, the user is definitely "in game" 
            // We force the Auth UI away and ensure the hands container is shown
            hideAuthUI(); 
            document.getElementById("hands-bar")?.classList.remove("hidden");
            renderRoom(data, selfName);

            break;

        default:
            console.warn("❓ unknown packet", data);
    }
}

// -------------------------------------------------
// AUTH API
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

bindAuthActions(beginCreateAccount, attemptLogin);

function flashRegen(type) {
    if (type !== "energy") return;

    const el = document.getElementById("hud-energy");
    if (!el) return;

    el.classList.remove("regen-flash");
    void el.offsetWidth; // force reflow
    el.classList.add("regen-flash");
}


// -------------------------------------------------
// MOVEMENT KEYS
// -------------------------------------------------
document.addEventListener("keydown", e => {
    // Prevent movement if user is typing in the input box
    if (document.activeElement.tagName === "INPUT") return;

    if (e.key === "ArrowUp") sendText("move north");
    if (e.key === "ArrowDown") sendText("move south");
    if (e.key === "ArrowLeft") sendText("move west");
    if (e.key === "ArrowRight") sendText("move east");
});







