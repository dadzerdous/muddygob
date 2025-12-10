// ===============================================
// main.js – tiny glue file
// Hooks up buttons + connects WebSocket
// ===============================================

import { initWebSocket, sendText } from "./client.js";
import { showAuthModal } from "./ui.js";

// Welcome screen buttons
const btnNew   = document.getElementById("btn-new");
const btnLogin = document.getElementById("btn-login");

btnNew.onclick   = () => showAuthModal("create");
btnLogin.onclick = () => showAuthModal("login");

// In-game input
const input   = document.getElementById("input");
const sendBtn = document.getElementById("send");

sendBtn.onclick = () => {
    const text = input.value.trim();
    if (!text) return;
    sendText(text);
    input.value = "";
};

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});

// 🔹 ADDED — HUD + connection status
export function showHUD() {
    const hud = document.getElementById("hud");
    const conn = document.getElementById("connection-status");

    if (hud) hud.style.display = "block";
    if (conn) conn.style.display = "none";
}

// Connect to your Render server
initWebSocket("wss://muddygob-server-1.onrender.com");
