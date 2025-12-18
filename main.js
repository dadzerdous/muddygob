// ===============================================
// main.js – glue file
// ===============================================

import { initWebSocket, sendText } from "./client.js";
import { showAuthModal, hideAuthUI } from "./ui.js";
import { setClientHeldItem } from "./hudUI.js";

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
// THEME LOADER (optional external call)
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
// -----------------------------
// HAND UI BUTTON EVENTS
// -----------------------------
document.getElementById("inv-btn").onclick = () => {
    // for now, just perform the text command
    sendText("inv");
};

document.getElementById("hand-left").onclick = () => {
    if (!clientHeldItem) {
        sendText("hands");
    } else {
        // clicking the item itself shows actions via .obj click handler
    }
};


document.getElementById("hand-right").onclick = () => {
    sendText("hands"); // temporary behavior
};


// -----------------------------------------
// ARROW NAVIGATION BUTTONS
// -----------------------------------------
document.querySelectorAll(".arrow-btn")?.forEach(btn => {
    btn.onclick = () => {
        const dir = btn.dataset.dir;
        sendText(dir);  // ← FIXED
    };
});


// -----------------------------------------
// CONNECT TO SERVER
// -----------------------------------------
initWebSocket("wss://muddygob-server-1.onrender.com");


