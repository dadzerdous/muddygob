// ===============================================
// main.js – glue file (clean version)
// ===============================================

// Added sendJSON to the imports to prevent ReferenceErrors
import { initWebSocket, sendText, sendJSON } from "./client.js";
import { showAuthModal, hideAuthUI } from "./ui.js";
import { setClientHeldItem } from "./hudUI.js";

const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

if (sendBtn && input) {
    sendBtn.onclick = () => {
        const raw = input.value.trim();
        if (!raw) return;

        // Pull current chat mode (default say)
        const modeSel = document.getElementById("chat-mode");
        const mode = modeSel ? modeSel.value : "say";


        // --- smart mode logic ---
        const final = (mode === "command")
            ? raw                        // send raw
            : `${mode} ${raw}`;          // send say/whisper/etc

        sendText(final);
        input.value = "";
    };

    // Only ONE keypress listener
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendBtn.click();
    });
}

// -----------------------------------------------
// BUTTON LOGIC
// -----------------------------------------------
document.getElementById("btn-new").onclick = () => showAuthModal("create");
document.getElementById("btn-login").onclick = () => showAuthModal("login");

document.getElementById("inv-btn").onclick = () => sendText("inv");
document.getElementById("hand-left").onclick = () => sendText("hands");
document.getElementById("hand-right").onclick = () => sendText("hands");

// Arrow keys, help, exit
document.querySelectorAll(".arrow-btn").forEach(btn => {
    btn.onclick = () => {
        if (btn.dataset.dir) return sendText(btn.dataset.dir);
        if (btn.dataset.cmd === "help") return sendText("help");
        if (btn.dataset.cmd === "exit") {
            localStorage.removeItem("mg_token");
            return sendText("quit");
        }
    };
});

initWebSocket("wss://muddygob-server-1.onrender.com");
