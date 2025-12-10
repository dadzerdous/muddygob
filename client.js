//---------------------------------------------------------
// CONNECT + INITIAL UI SETUP
//---------------------------------------------------------
const output = document.getElementById("output");
const input = document.getElementById("input");
const statusEl = document.getElementById("connection-status");

const welcomeScreen = document.getElementById("welcome-screen");
const gameUI = document.getElementById("game-ui");

const raceSelect = document.getElementById("race-select");
const raceButtons = document.querySelectorAll(".race-btn");

const pronounSelect = document.getElementById("pronoun-select");
const pronounButtons = document.querySelectorAll(".pronoun-btn");

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

let authMode = null;  // create or login
let ws;

//---------------------------------------------------------
// CONNECT TO SERVER
//---------------------------------------------------------
initWebSocket("wss://muddygob-server-1.onrender.com");

function initWebSocket(url) {
    ws = new WebSocket(url);

    statusEl.textContent = "Connecting...";

    ws.onopen = () => {
        statusEl.textContent = "✓ Connected!";
    };

    ws.onerror = (err) => {
        statusEl.textContent = "⚠ Unable to connect";
        console.error(err);
    };

    ws.onclose = () => {
        statusEl.textContent = "✖ Connection closed";
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
    if (!modalOverlay.classList.contains("hidden")) {
        authError.textContent = msg;
    }
}

function setBackground(name) {
    if (name)
        document.body.style.backgroundImage = `url('images/${name}.jpg')`;
}

//---------------------------------------------------------
// MESSAGE DISPATCHER
//---------------------------------------------------------
function handleMessage(raw) {
    let data;
    try { data = JSON.parse(raw); }
    catch { return addMessage(raw); }

    switch (data.type) {

        case "system":
            renderSystem(data.msg);
            break;

        case "room":
            hideWelcomeAndModal();
            renderRoom(data);
            break;

        case "choose_race":
            showRaceSelection();
            break;

        case "choose_pronouns":
            showPronounSelection(data.allowed);
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
        </div>
    `;

    if (room.background) setBackground(room.background);

    const order = ["up","down","left","right"];
    const arrows = { up:"↑", down:"↓", left:"←", right:"→" };

    html += `<div class="exits-block"><b>Exits</b><br>`;
    order.forEach(dir => {
        const active = room.exits.includes(dir);
        html += `
            <div class="exit-option ${active ? "active-exit" : "inactive-exit"}">
                ${arrows[dir]} <span>${dir}</span>
            </div>`;
    });
    html += `</div>`;

    room.desc.forEach(line => {
        html += `<p style="color:#eae6ff;margin:3px 0;">${line}</p>`;
    });

    html += `<div style="margin-top:10px;color:#aaffcc;">
        <b>Players here:</b><br>
        ${(room.players || []).length > 0
            ? room.players.map(p => "• " + p).join("<br>")
            : "• (just you)"}
    </div>`;

    addMessage(html);
}

//---------------------------------------------------------
// INPUT BAR SEND
//---------------------------------------------------------
function sendToServer() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const text = input.value.trim();
    if (text === "") return;

    ws.send(text);
    input.value = "";
}

btnSend.onclick = sendToServer;
input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendToServer();
});

//---------------------------------------------------------
// MOVEMENT (ARROW KEYS)
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
// AUTH UI
//---------------------------------------------------------
function hideWelcomeAndModal() {
    welcomeScreen.classList.add("hidden");
    modalOverlay.classList.add("hidden");
    gameUI.classList.remove("hidden");
}

function showAuthModal(mode) {
    authMode = mode;

    authError.textContent = "";
    authUsername.value = "";
    authPassword.value = "";

    authTitle.textContent = mode === "create" ? "Create Account" : "Login";
    btnAuthConfirm.textContent = mode === "create" ? "Create" : "Join";

    modalOverlay.classList.remove("hidden");
    authUsername.focus();
}

btnNew.onclick = () => showAuthModal("create");
btnLogin.onclick = () => showAuthModal("login");
btnAuthCancel.onclick = () => modalOverlay.classList.add("hidden");

//---------------------------------------------------------
// CREATE or LOGIN SUBMIT
//---------------------------------------------------------
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

        ws.send(JSON.stringify({ type: "start_create" }));
        ws.send(JSON.stringify({ type: "try_create", name }));
        ws.send(JSON.stringify({ type: "try_create_pass", password: pass }));

        // Username/password hidden → race screen appears automatically
        authError.textContent = "Choose your race...";
    }

    else if (authMode === "login") {
        ws.send(JSON.stringify({
            type: "try_login",
            name,
            password: pass
        }));
    }
};

//---------------------------------------------------------
// RACE SELECTION
//---------------------------------------------------------
function showRaceSelection() {
    // Hide username/password
    authUsername.parentElement.style.display = "none";
    authPassword.parentElement.style.display = "none";
    btnAuthConfirm.style.display = "none";
    btnAuthCancel.style.display = "none";
    authError.textContent = "";

    raceSelect.classList.remove("hidden");
}

raceButtons.forEach(btn => {
    btn.onclick = () => {
        const race = btn.dataset.race;

        ws.send(JSON.stringify({
            type: "choose_race",
            race
        }));

        raceSelect.classList.add("hidden");
        authError.textContent = "Choose your pronouns...";
    };
});

//---------------------------------------------------------
// PRONOUN SELECTION
//---------------------------------------------------------
function showPronounSelection(allowedList) {
    pronounButtons.forEach(btn => {
        const p = btn.dataset.pronoun;
        btn.style.display = allowedList.includes(p) ? "block" : "none";
    });

    pronounSelect.classList.remove("hidden");
}

pronounButtons.forEach(btn => {
    btn.onclick = () => {
        const chosen = btn.dataset.pronoun;

        ws.send(JSON.stringify({
            type: "choose_pronoun",
            pronoun: chosen
        }));

        pronounSelect.classList.add("hidden");
    };
});
