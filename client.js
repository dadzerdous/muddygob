//---------------------------------------------------------
// CONNECT + INITIAL UI SETUP
//---------------------------------------------------------
const output = document.getElementById("output");
const input = document.getElementById("input");
const statusEl = document.getElementById("connection-status");

const welcomeScreen = document.getElementById("welcome-screen");
const gameUI = document.getElementById("game-ui");

const modalOverlay = document.getElementById("modal-overlay");
const authTitle = document.getElementById("auth-title");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const authError = document.getElementById("auth-error");
const btnAuthConfirm = document.getElementById("auth-confirm");
const btnAuthCancel = document.getElementById("auth-cancel");

const btnNew = document.getElementById("btn-new");
const btnLogin = document.getElementById("btn-login");
const btnSend = document.getElementById("send");

let authMode = null; // "create" or "login"
let ws;

// Use your Render URL
initWebSocket("wss://muddygob-server-1.onrender.com");

function initWebSocket(url) {
    ws = new WebSocket(url);

    statusEl.textContent = "Connecting...";

    ws.onopen = () => {
        statusEl.textContent = "✓ Connected!";
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        statusEl.textContent = "⚠ Unable to connect to server";
        addMessage(`<div style="color:red;">Error: ${err}</div>`);
    };

    ws.onclose = () => {
        statusEl.textContent = "✖ Connection closed";
        addMessage(`<div style="color:red;">Connection closed.</div>`);
    };

    ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => handleMessage(reader.result);
            reader.readAsText(event.data, "UTF-8");
        } else {
            handleMessage(event.data);
        }
    };
}

//---------------------------------------------------------
// BASIC UI HELPERS
//---------------------------------------------------------
function addMessage(html) {
    output.innerHTML += html + "<br>";
    output.scrollTop = output.scrollHeight;
}

function renderSystem(msg) {
    addMessage(`<div class="system-msg">${msg}</div>`);
    // If modal is open, also show message there
    if (!modalOverlay.classList.contains("hidden")) {
        authError.textContent = msg;
    }
}

function setBackground(name) {
    if (!name) return;
    document.body.style.backgroundImage = `url("images/${name}.jpg")`;
}

//---------------------------------------------------------
// SEND INPUT (in-game text)
//---------------------------------------------------------
function sendToServer() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const text = input.value.trim();
    if (text === "") return;
    ws.send(text);
    input.value = "";
}

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendToServer();
});

btnSend.onclick = sendToServer;

//---------------------------------------------------------
// MAIN MESSAGE DISPATCHER
//---------------------------------------------------------
function handleMessage(raw) {
    let data;
    try {
        data = JSON.parse(raw);
    } catch {
        addMessage(raw);
        return;
    }

    switch (data.type) {
        case "system":
            renderSystem(data.msg);
            break;
        case "room":
            // Successful login/create should result in room data
            hideWelcomeAndModal();
            renderRoom(data);
            break;
        case "death":
            renderDeath(data);
            break;
        default:
            console.log("Unknown packet:", data);
    }
}

//---------------------------------------------------------
// RENDER ROOM
//---------------------------------------------------------
function renderRoom(room) {
    let html = `
        <div style="color:#b29eff;font-size:24px;margin-bottom:8px;">
            <b>${room.title}</b>
        </div>`;

    if (room.background) {
        setBackground(room.background);
    }

    const order = ["up", "down", "left", "right"];
    const arrows = { up:"↑", down:"↓", left:"←", right:"→" };

    html += `<div class="exits-block"><b>Exits</b><br>`;
    order.forEach(dir => {
        const active = room.exits && room.exits.includes(dir);
        html += `
            <div class="exit-option ${active ? "active-exit" : "inactive-exit"}">
                ${arrows[dir]} <span>${dir}</span>
            </div>`;
    });
    html += `</div>`;

    (room.desc || []).forEach(line => {
        html += `<p style="color:#eae6ff;margin:3px 0;">${line}</p>`;
    });

    html += `<div style="margin-top:10px;color:#aaffcc;">
        <b>Players here:</b><br>
        ${(room.players || []).map(p => "• " + p).join("<br>") || "• (just you)"}
    </div>`;

    addMessage(html);
}

//---------------------------------------------------------
// RENDER DEATH
//---------------------------------------------------------
function renderDeath(data) {
    let html = `
        <div style="color:#ff6666; font-size:22px; margin-bottom:10px;">
            <b>${data.title}</b>
        </div>
    `;
    (data.desc || []).forEach(line => {
        html += `<p style="color:#ffc9c9;">${line}</p>`;
    });

    html += `
        <p style="margin-top:10px; color:#ffaaaa;">
            ${data.prompt || "You died."}
        </p>
    `;

    addMessage(html);
}

//---------------------------------------------------------
// ARROW KEY MOVEMENT
//---------------------------------------------------------
document.addEventListener("keydown", e => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    switch (e.key) {
        case "ArrowUp": ws.send("move up"); break;
        case "ArrowDown": ws.send("move down"); break;
        case "ArrowLeft": ws.send("move left"); break;
        case "ArrowRight": ws.send("move right"); break;
    }
});

//---------------------------------------------------------
// WELCOME + MODAL LOGIC
//---------------------------------------------------------
function hideWelcomeAndModal() {
    welcomeScreen.classList.add("hidden");
    modalOverlay.classList.add("hidden");
    gameUI.classList.remove("hidden");
    authError.textContent = "";
    authUsername.value = "";
    authPassword.value = "";
}

function showAuthModal(mode) {
    authMode = mode; // "create" or "login"
    authError.textContent = "";
    authUsername.value = "";
    authPassword.value = "";

    if (mode === "create") {
        authTitle.textContent = "Create Account";
        btnAuthConfirm.textContent = "Create";
    } else {
        authTitle.textContent = "Login";
        btnAuthConfirm.textContent = "Join";
    }

    modalOverlay.classList.remove("hidden");
    authUsername.focus();
}

// initial state: welcome visible, game UI hidden
welcomeScreen.classList.remove("hidden");
gameUI.classList.add("hidden");
modalOverlay.classList.add("hidden");

// Buttons
btnNew.onclick = () => {
    showAuthModal("create");
};

btnLogin.onclick = () => {
    showAuthModal("login");
};

btnAuthCancel.onclick = () => {
    modalOverlay.classList.add("hidden");
    authError.textContent = "";
};

btnAuthConfirm.onclick = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        authError.textContent = "Not connected to server.";
        return;
    }

    const name = authUsername.value.trim();
    const pass = authPassword.value.trim();

    if (!name || !pass) {
        authError.textContent = "Please fill in both fields.";
        return;
    }

    if (authMode === "create") {
        ws.send(JSON.stringify({
            type: "create_account",
            name,
            password: pass
        }));
    } else if (authMode === "login") {
        ws.send(JSON.stringify({
            type: "login",
            name,
            password: pass
        }));
    } else {
        authError.textContent = "Unknown auth mode.";
    }
};
