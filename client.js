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

const raceSelect = document.getElementById("race-select");
const raceButtons = document.querySelectorAll(".race-btn");

const pronounSelect = document.getElementById("pronoun-select");
const pronounButtons = document.querySelectorAll(".pronoun-btn");

let selectedRace = null;


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
// MESSAGE DISPATCHER
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
            hideWelcomeAndModal();
            renderRoom(data);
            break;

case "choose_race":
    showRaceSelection();
    break;

            case "choose_pronouns":
    showPronounSelection(data.allowed);
    break;


        case "choose_pronouns":
            renderSystem("Choose pronouns: he, she, they, it");
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

    if (room.background) setBackground(room.background);

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
// WELCOME + AUTH MODAL LOGIC
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
    authMode = mode;
    authError.textContent = "";
    authUsername.value = "";
    authPassword.value = "";

    authTitle.textContent = mode === "create" ? "Create Account" : "Login";
    btnAuthConfirm.textContent = mode === "create" ? "Create" : "Join";

    modalOverlay.classList.remove("hidden");
    authUsername.focus();
}

// Initial UI state
welcomeScreen.classList.remove("hidden");
gameUI.classList.add("hidden");
modalOverlay.classList.add("hidden");

// Button hookups
btnNew.onclick = () => showAuthModal("create");
btnLogin.onclick = () => showAuthModal("login");
btnAuthCancel.onclick = () => modalOverlay.classList.add("hidden");

//---------------------------------------------------------
// CONFIRM (CREATE or LOGIN)
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
        // Step 1: start creation
        ws.send(JSON.stringify({ type: "start_create" }));
        ws.send(JSON.stringify({ type: "try_create", name }));
        ws.send(JSON.stringify({ type: "try_create_pass", password: pass }));

        // Ask race
        let race = prompt("Race (goblin, human, elf):", "goblin");
        if (!race) return authError.textContent = "No race chosen.";
        race = race.toLowerCase().trim();
        ws.send(JSON.stringify({ type: "choose_race", race }));

        // Ask pronouns
        let pronoun = prompt("Pronouns (he, she, they, it):", "they");
        if (!pronoun) return authError.textContent = "No pronouns chosen.";
        pronoun = pronoun.toLowerCase().trim();
        ws.send(JSON.stringify({ type: "choose_pronoun", pronoun }));

    } else if (authMode === "login") {
        ws.send(JSON.stringify({
            type: "try_login",
            name,
            password: pass
        }));
    }
};

function showRaceSelection() {
    // Hide username/password area
    authUsername.parentElement.style.display = "none";
    authPassword.parentElement.style.display = "none";
    btnAuthConfirm.style.display = "none";
    btnAuthCancel.style.display = "none";
    authError.textContent = "";

    // Show race buttons
    raceSelect.classList.remove("hidden");
}

function showRaceSelection() {
    // Hide fields
    authUsername.parentElement.style.display = "none";
    authPassword.parentElement.style.display = "none";
    btnAuthConfirm.style.display = "none";
    btnAuthCancel.style.display = "none";
    authError.textContent = "";

    // Show race buttons
    raceSelect.classList.remove("hidden");
}


raceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        selectedRace = btn.dataset.race;

        // Tell server which race was chosen
        ws.send(JSON.stringify({
            type: "choose_race",
            race: selectedRace
        }));

        raceSelect.classList.add("hidden");
    });
});

function showPronounSelection(allowedList) {
    pronounSelect.classList.remove("hidden");

    pronounButtons.forEach(btn => {
        const p = btn.dataset.pronoun;
        btn.style.display = allowedList.includes(p) ? "block" : "none";
    });
}

pronounButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const chosen = btn.dataset.pronoun;

        ws.send(JSON.stringify({
            type: "choose_pronoun",
            pronoun: chosen
        }));

        pronounSelect.classList.add("hidden");
    });
});

