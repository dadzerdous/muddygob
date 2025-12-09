//---------------------------------------------------------
// CONNECT + INITIAL UI SETUP
//---------------------------------------------------------
const output = document.getElementById("output");
const input = document.getElementById("input");
const status = document.getElementById("connection-status");

const ws = new WebSocket("wss://muddygob-server-1.onrender.com");


// Show initial message on welcome screen
status.textContent = "Connecting...";


//---------------------------------------------------------
// CLEAN CONNECTION EVENTS
//---------------------------------------------------------
ws.onopen = () => {
    status.textContent = "✓ Connected!";
};

ws.onerror = (err) => {
    status.textContent = "⚠ Unable to connect to server";
    addMessage(`<div style="color:red;">Error: ${err}</div>`);
};

ws.onclose = () => {
    status.textContent = "✖ Connection closed";
    addMessage(`<div style="color:red;">Connection closed.</div>`);
};


//---------------------------------------------------------
// BASIC UI HELPERS
//---------------------------------------------------------
function addMessage(html) {
    output.innerHTML += html + "<br>";
    output.scrollTop = output.scrollHeight;
}

function renderSystem(msg) {
    addMessage(`<div class="system-msg">${msg}</div>`);
}

function setBackground(name) {
    document.body.style.backgroundImage = `url("images/${name}.jpg")`;
}


//---------------------------------------------------------
// SEND INPUT
//---------------------------------------------------------
function sendToServer() {
    const text = input.value.trim();
    if (text === "") return;
    ws.send(text);
    input.value = "";
}

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendToServer();
});

document.getElementById("send").onclick = sendToServer;


//---------------------------------------------------------
// HANDLE MESSAGES (supports Blob + JSON)
//---------------------------------------------------------
ws.onmessage = (event) => {

    if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => handleMessage(reader.result);
        reader.readAsText(event.data, "UTF-8");
    } else {
        handleMessage(event.data);
    }
};


//---------------------------------------------------------
// MAIN DISPATCHER
//---------------------------------------------------------
function handleMessage(raw) {
    let data;

    try { data = JSON.parse(raw); }
    catch { addMessage(raw); return; }

    switch (data.type) {
        case "system": renderSystem(data.msg); break;
        case "room": renderRoom(data); break;
        case "death": renderDeath(data); break;
        default: console.log("Unknown packet:", data);
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

    const order = ["up", "down", "left", "right"];
    const arrows = { up:"↑", down:"↓", left:"←", right:"→" };

    html += `<div class="exits-block"><b>Exits</b><br>`;
    order.forEach(dir => {
        let active = room.exits.includes(dir);
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
        ${room.players.map(p => "• " + p).join("<br>")}
    </div>`;

    addMessage(html);
}


//---------------------------------------------------------
// RENDER DEATH SCREEN
//---------------------------------------------------------
function renderDeath(data) {

    let html = `
        <div style="color:#ff6666; font-size:22px; margin-bottom:10px;">
            <b>${data.title}</b>
        </div>
    `;

    data.desc.forEach(line => {
        html += `<p style="color:#ffc9c9;">${line}</p>`;
    });

    html += `
        <p style="margin-top:10px; color:#ffaaaa;">
            ${data.prompt}
        </p>
    `;

    addMessage(html);
}


//---------------------------------------------------------
// ARROW KEY MOVEMENT
//---------------------------------------------------------
document.addEventListener("keydown", e => {
    if (ws.readyState !== WebSocket.OPEN) return;

    switch (e.key) {
        case "ArrowUp": ws.send("move up"); break;
        case "ArrowDown": ws.send("move down"); break;
        case "ArrowLeft": ws.send("move left"); break;
        case "ArrowRight": ws.send("move right"); break;
    }
});


//---------------------------------------------------------
// WELCOME SCREEN LOGIC
//---------------------------------------------------------
document.getElementById("welcome-screen").classList.remove("hidden");
document.getElementById("output").style.display = "none";
document.getElementById("input-bar").style.display = "none";

function showGameUI() {
    document.getElementById("welcome-screen").classList.add("hidden");
    document.getElementById("output").style.display = "block";
    document.getElementById("input-bar").style.display = "flex";
}

document.getElementById("btn-new").onclick = () => {
    ws.send("newgame");
    showGameUI();
};

document.getElementById("btn-login").onclick = () => {
    ws.send("login");
    showGameUI();
};
