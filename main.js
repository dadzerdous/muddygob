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
        const raw = input.value.trim();
        if (!raw) return;

        // Pull current chat mode (default say)
        const modeSel = document.getElementById("chat-mode");
        const mode = modeSel ? modeSel.value : "say";

        // -------------------------------------------------
        // HELD ITEM TEMP SIM
        // -------------------------------------------------
        if (raw.startsWith("take ")) {
            const item = raw.split(" ")[1].toLowerCase();
            setClientHeldItem(item);
        }
        if (raw.startsWith("drop") || raw.startsWith("store")) {
            setClientHeldItem(null);
        }
        if (raw.startsWith("retrieve ")) {
            const item = raw.split(" ")[1].toLowerCase();
            setClientHeldItem(item);
        }

        // -------------------------------------------------
        // SEND CHAT WITH MODE PREFIX
        // -------------------------------------------------
        const final = `${mode} ${raw}`;
        sendText(final);

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
