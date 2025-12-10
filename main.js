// ===============================================
// main.js – glue file
// ===============================================

import { initWebSocket, sendText } from "./client.js";
import { showAuthModal, hideAuthUI } from "./ui.js";

// Input
const input   = document.getElementById("input");
const sendBtn = document.getElementById("send");

sendBtn.onclick = () => {
    const text = input.value.trim();
    if (!text) return;
    sendText(text);
    input.value = "";
};

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
});

// Show auth modal
document.getElementById("btn-new").onclick   = () => showAuthModal("create");
document.getElementById("btn-login").onclick = () => showAuthModal("login");

// Expose HUD hook
export function showHUD() {
    const hud = document.getElementById("hud");
    const conn = document.getElementById("connection-status");

    if (hud) hud.classList.remove("hidden");
    if (conn) conn.style.display = "none";
}

document.addEventListener("muddygob-auth-complete", () => {
    const hud = document.getElementById("hud");
    const conn = document.getElementById("connection-status");

    if (hud) hud.classList.remove("hidden");
    if (conn) conn.style.display = "none";
});

// Connect to server
initWebSocket("wss://muddygob-server-1.onrender.com");
