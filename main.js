// ===============================================
// main.js – glue file
// ===============================================

import { initWebSocket, sendText } from "./client.js";
import { showAuthModal, enterGameUI, updateHUD } from "./ui.js";

// -----------------------------------------
// SEND BUTTON + INPUT BOX
// -----------------------------------------
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

// -----------------------------------------
// THEME LOADER
// -----------------------------------------
export function setTheme(name) {
    const theme = document.getElementById("theme-css");
    theme.href = `themes/${name}.css`;
}

// -----------------------------------------
// WELCOME BUTTONS
// -----------------------------------------
document.getElementById("btn-new").onclick = () => showAuthModal("create");
document.getElementById("btn-login").onclick = () => showAuthModal("login");

// -----------------------------------------
// ARROW NAVIGATION (if arrows exist)
// -----------------------------------------
document.querySelectorAll(".arrow-btn")?.forEach(btn => {
    btn.onclick = () => {
        const dir = btn.dataset.dir;
        sendText("go " + dir);
    };
});

// -----------------------------------------
// CONNECT TO SERVER
// -----------------------------------------
initWebSocket("wss://muddygob-server-1.onrender.com");
