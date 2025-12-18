// ===============================================
// main.js – glue file
// ===============================================

// Added sendJSON to the imports to prevent ReferenceErrors
import { initWebSocket, sendText, sendJSON } from "./client.js";
import { showAuthModal, hideAuthUI } from "./ui.js";
import { setClientHeldItem, updateHandsDisplay } from "./hudUI.js";

const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

if (sendBtn && input) {
    sendBtn.onclick = () => {
        const text = input.value.trim();
        if (!text) return;

        // Naive temporary simulation for held items
        if (text.startsWith("take ")) {
            const item = text.split(" ")[1].toLowerCase();
            setClientHeldItem(item);
        }
        if (text.startsWith("drop") || text.startsWith("store")) {
            setClientHeldItem(null);
        }
        if (text.startsWith("retrieve ")) {
            const item = text.split(" ")[1].toLowerCase();
            setClientHeldItem(item);
        }

        sendText(text);
        input.value = "";
    };

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendBtn.click();
    });
}

export function setTheme(name) {
    const theme = document.getElementById("theme-css");
    if (theme) theme.href = `themes/${name}.css`;
}

document.getElementById("btn-new").onclick = () => showAuthModal("create");
document.getElementById("btn-login").onclick = () => showAuthModal("login");

document.getElementById("inv-btn").onclick = () => sendText("inv");
document.getElementById("hand-left").onclick = () => sendText("hands");
document.getElementById("hand-right").onclick = () => sendText("hands");

document.querySelectorAll(".arrow-btn")?.forEach(btn => {
    btn.onclick = () => {
        const dir = btn.dataset.dir;
        sendText(dir);
    };
});

document.getElementById("btn-help").onclick = () => {
    sendText("help");
};

document.getElementById("btn-exit").onclick = () => {
    sendText("quit");
};


initWebSocket("wss://muddygob-server-1.onrender.com");
