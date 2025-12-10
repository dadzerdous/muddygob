
// ===============================================
// main.js – tiny glue file
// Hooks up buttons + connects WebSocket
// ===============================================

import { initWebSocket, sendText } from "./client.js";
import { showAuthModal } from "./ui.js";

// --- Hook up the welcome screen buttons ---
const btnNew = document.getElementById("btn-new");
const btnLogin = document.getElementById("btn-login");

btnNew.onclick = () => showAuthModal("create");
btnLogin.onclick = () => showAuthModal("login");

// --- Hook up the input + Send button for in-game commands ---
const input = document.getElementById("input");
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

// --- Connect to your Render server ---
initWebSocket("wss://muddygob-server-1.onrender.com");
