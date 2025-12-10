// ===============================================
// main.js – glue file
// ===============================================

import { initWebSocket, sendText } from "./client.js";
import { showAuthModal } from "./ui.js";

// -------------------------------
// In-Game Input
// -------------------------------
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

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

// -------------------------------
// Welcome Screen Buttons
// -------------------------------
const btnNew = document.getElementById("btn-new");
const btnLogin = document.getElementById("btn-login");

if (btnNew) btnNew.onclick = () => showAuthModal("create");
if (btnLogin) btnLogin.onclick = () => showAuthModal("login");

// -------------------------------
// WebSocket Connect
// -------------------------------
initWebSocket("wss://muddygob-server-1.onrender.com");
