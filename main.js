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
        if (btn.dataset.dir) {
            // movement
            sendText(btn.dataset.dir);
            return;
        }

        if (btn.dataset.cmd === "help") {
            sendText("help");
            return;
        }

        if (btn.dataset.cmd === "exit") {
            // mark a manual exit so reconnect doesn’t fire
            localStorage.removeItem("mg_token");
            sendText("quit");
            return;
        }
    };
});


const helpBtn = document.getElementById("btn-help");
if (helpBtn) {
    helpBtn.onclick = () => sendText("help");
}

const exitBtn = document.getElementById("btn-exit");
if (exitBtn) {
    exitBtn.onclick = () => sendText("quit");
}


initWebSocket("wss://muddygob-server-1.onrender.com");
