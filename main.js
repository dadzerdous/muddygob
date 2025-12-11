// ===============================================
// main.js – glue file
// ===============================================

import { initWebSocket, sendText } from "./client.js";
import { showAuthModal } from "./ui.js";

// Elements
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const output = document.getElementById("output");

const topBar = document.getElementById("top-bar");
const hud = document.getElementById("hud-col");
const playerNameCol = document.getElementById("player-name-col");
const connectionStatus = document.getElementById("connection-status");

// -------------------------------
// In-Game Input
// -------------------------------
if (sendBtn && input) {
    sendBtn.onclick = () => {
        const text = input.value.trim();
        if (!text) return;
        sendText(text);
        input.value = "";
    };

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendBtn.click();
    });
}

export function setTheme(name) {
    const theme = document.getElementById("theme-style");
    theme.href = `themes/${name}.css`;
}

// -------------------------------
// Welcome Screen Buttons
// -------------------------------
document.getElementById("btn-new")?.addEventListener("click", () => showAuthModal("create"));
document.getElementById("btn-login")?.addEventListener("click", () => showAuthModal("login"));

// -------------------------------
// TEXT FORMATTERS FROM SERVER
// -------------------------------
export function handleServerMessage(data) {

    // ------------------------------------
    // SYSTEM MESSAGES
    // ------------------------------------
    if (data.type === "system") {
        appendToOutput(`<span class="system-msg">${data.msg}</span>`);
        return;
    }

    // ------------------------------------
    // ROOM DISPLAY
    // ------------------------------------
    if (data.type === "room") {
        renderRoom(data);
        return;
    }

    // ------------------------------------
    // PLAYERS IN ROOM
    // ------------------------------------
    if (data.type === "room_players") {
        appendToOutput(`<span class="system-msg">Beings here: ${data.players.join(", ")}</span>`);
        return;
    }

    // ------------------------------------
    // CHAT
    // ------------------------------------
    if (data.type === "chat") {
        if (data.from === "you") {
            appendToOutput(
                `<span class="chat-you">You say:</span> <span class="chat-text">"${data.msg}"</span>`
            );
        } else {
            appendToOutput(
                `<span class="chat-name">${data.name} says:</span> <span class="chat-text">"${data.msg}"</span>`
            );
        }
        return;
    }
}

// -------------------------------
// APPEND TEXT TO OUTPUT
// -------------------------------
function appendToOutput(html) {
    output.innerHTML += `<div class="line">${html}</div>`;
    output.scrollTop = output.scrollHeight;
}

// -------------------------------
// RENDER ROOM
// -------------------------------
function renderRoom(room) {

    let descHtml = room.desc.map(line => `<div>${line}</div>`).join("");

    appendToOutput(`
        <div class="room-title">${room.title}</div>
        <div class="room-desc">${descHtml}</div>
        <div class="exits-block">
            Exits: ${room.exits.join(", ")}
        </div>
    `);
}

// -------------------------------
// HANDLE PLAYER LOGIN (name + HUD)
// Called from client.js when login success lines appear
// -------------------------------
export function setLoggedInPlayerName(name) {
    topBar.classList.remove("hidden");
    hud.classList.remove("hidden");
    playerNameCol.textContent = name;
}

// -------------------------------
// WebSocket Connect
// -------------------------------
initWebSocket("wss://muddygob-server-1.onrender.com");
