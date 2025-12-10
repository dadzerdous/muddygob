// ===============================================
// client.js (Networking + Routing Only)
// ===============================================

import { showAuthModal, hideAuthUI, showRaceUI, showPronounUI } from "./ui.js";
import { renderRoom, renderSystem } from "./render.js";

let ws = null;

// -------------------------------------------------
// CONNECT
// -------------------------------------------------
export function initWebSocket(url) {
    ws = new WebSocket(url);

    const statusEl = document.getElementById("connection-status");
    statusEl.textContent = "Connecting...";

    ws.onopen = () => statusEl.textContent = "✓ Connected!";
    ws.onerror = () => statusEl.textContent = "⚠ Connection error";
    ws.onclose = () => statusEl.textContent = "✖ Disconnected";

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
// PACKET ROUTING
// -------------------------------------------------
function routeMessage(data) {
    switch (data.type) {

        case "system":
            renderSystem(data.msg);
            break;

        case "room":
            hideAuthUI();                 // fully hide UI
            document.getElementById("modal-overlay").classList.add("hidden");
            renderRoom(data);
            break;

        case "choose_race":
            showRaceUI();
            break;

        case "choose_pronouns":
            showPronounUI(data.allowed);
            break;

        default:
            console.warn("Unknown message:", data);
    }
}

// -------------------------------------------------
// EXPORTED ACTIONS
// -------------------------------------------------
export function beginCreateAccount(name, pass) {
    sendJSON({ type: "start_create" });
    sendJSON({ type: "try_create", name });
    sendJSON({ type: "try_create_pass", password: pass });
}

export function chooseRace(race) {
    sendJSON({ type: "choose_race", race });
}

export function choosePronoun(pronoun) {
    sendJSON({ type: "choose_pronoun", pronoun });
}

export function attemptLogin(name, pass) {
    sendJSON({ type: "try_login", name, password: pass });
}

// -------------------------------------------------
// MOVEMENT KEYS
// -------------------------------------------------
document.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp": sendText("move up"); break;
        case "ArrowDown": sendText("move down"); break;
        case "ArrowLeft": sendText("move left"); break;
        case "ArrowRight": sendText("move right"); break;
    }
});
