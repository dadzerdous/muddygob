// ===============================================
// client.js – WebSocket handling for MuddyGob
// ===============================================

// IMPORTANT: Must NOT redeclare ws anywhere else.
let ws = null;


// ------------------------------------------------
// INIT WEBSOCKET
// ------------------------------------------------
export function initWebSocket(url) {
    ws = new WebSocket(url);

    ws.onopen = () => {
        const status = document.getElementById("connection-status");
        if (status) status.textContent = "✓ Connected!";
    };

    ws.onmessage = (event) => {
        const data = event.data;
        appendOutput(data);
    };

    ws.onclose = () => {
        const status = document.getElementById("connection-status");
        if (status) status.textContent = "✗ Disconnected.";
    };
}


// ------------------------------------------------
// SEND TEXT TO SERVER
// ------------------------------------------------
export function sendText(text) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(text);
    }
}


// ------------------------------------------------
// BASIC OUTPUT HANDLER
// ------------------------------------------------
function appendOutput(msg) {
    const out = document.getElementById("output");
    if (!out) return;

    const div = document.createElement("div");
    div.textContent = msg;
    out.appendChild(div);

    out.scrollTop = out.scrollHeight;
}
