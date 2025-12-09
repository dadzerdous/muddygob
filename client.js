//---------------------------------------------------------
// CONNECT TO SERVER
//---------------------------------------------------------
const output = document.getElementById("output");
const ws = new WebSocket("ws://192.168.0.186:9000");

//---------------------------------------------------------
// BASIC UI HELPERS
//---------------------------------------------------------
function addMessage(html) {
    output.innerHTML += html + "<br>";
    output.scrollTop = output.scrollHeight;
}

function renderSystemMessage(msg) {
    addMessage(`<div class="system-msg">${msg}</div>`);
}

function setBackground(imageName) {
    document.body.style.backgroundImage = `url("images/${imageName}.jpg")`;
}

//---------------------------------------------------------
// SEND INPUT TO SERVER
//---------------------------------------------------------
function sendToServer() {
    const box = document.getElementById("input");
    const text = box.value.trim();
    if (text === "") return;

    ws.send(text);
    box.value = "";
}

// Hit Enter to send
document.getElementById("input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendToServer();
    }
});

//---------------------------------------------------------
// WEBSOCKET EVENTS
//---------------------------------------------------------
ws.onopen = () => {
    renderSystemMessage("Connecting...");
};

ws.onerror = (err) => {
    addMessage(`<div style="color:red;">WebSocket Error: ${err}</div>`);
};

ws.onclose = () => {
    addMessage(`<div style="color:red;">Connection closed.</div>`);
};

//---------------------------------------------------------
// MESSAGE HANDLING
//---------------------------------------------------------
ws.onmessage = (event) => {
    if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => handleServerMessage(reader.result);
        reader.readAsText(event.data, "UTF-8");
    } else {
        handleServerMessage(event.data);
    }
};

//---------------------------------------------------------
// PARSE SERVER JSON
//---------------------------------------------------------
function handleServerMessage(raw) {
    let data;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        // Raw text fallback
        addMessage(raw);
        return;
    }

    switch (data.type) {
        case "system":
            renderSystemMessage(data.msg);
            break;

        case "title":
            renderTitle(data);
            break;

        case "room":
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
// RENDER: TITLE SCREEN
//---------------------------------------------------------
function renderTitle(data) {
    let html = `
        <div class="title-screen">${data.text}</div>
    `;
    addMessage(html);
}

//---------------------------------------------------------
// RENDER: ROOM
//---------------------------------------------------------
//---------------------------------------------------------
// RENDER: ROOM
//---------------------------------------------------------
function renderRoom(room) {
    let html = `
        <div style="color:#b29eff; font-size:24px; margin-bottom:8px;">
            <b>${room.title}</b>
        </div>
    `;

    if (room.background) setBackground(room.background);

    // ---------- FIXED ARROW EXIT LAYOUT ----------
//---------------------------------------------------------
// RENDER: ROOM
//---------------------------------------------------------
function renderRoom(room) {
    let html = `
        <div style="color:#b29eff; font-size:24px; margin-bottom:8px;">
            <b>${room.title}</b>
        </div>
    `;

    if (room.background) setBackground(room.background);

    // ---------- FIXED ARROW EXIT LAYOUT ----------
    const fixedOrder = ["up", "down", "left", "right"];

    function dirToArrow(dir) {
        switch (dir) {
            case "up": return "↑";
            case "down": return "↓";
            case "left": return "←";
            case "right": return "→";
        }
        return "?";
    }

    html += `<div class="exits-block"><b>Exits</b><br>`;

    fixedOrder.forEach(dir => {
        if (room.exits.includes(dir)) {
            html += `
                <div class="exit-option active-exit">
                    ${dirToArrow(dir)} <span>${dir}</span>
                </div>
            `;
        } else {
            html += `
                <div class="exit-option inactive-exit">
                    ${dirToArrow(dir)} <span style="opacity:0.3">${dir}</span>
                </div>
            `;
        }
    });

    html += `</div>`;
    // ----------------------------------------------

    // ROOM DESCRIPTION
    room.desc.forEach(line => {
        html += `<p style="color:#eae6ff; margin:3px 0;">${line}</p>`;
    });

    // PLAYERS
    html += `
        <div style="margin-top:10px; color:#aaffcc;">
            <b>Players here:</b><br>
            ${room.players.map(p => "• " + p).join("<br>")}
        </div>
    `;

    addMessage(html);
}

    // ----------------------------------------------

    // ROOM DESCRIPTION
    room.desc.forEach(line => {
        html += `<p style="color:#eae6ff; margin:3px 0;">${line}</p>`;
    });

    // PLAYERS
    html += `
        <div style="margin-top:10px; color:#aaffcc;">
            <b>Players here:</b><br>
            ${room.players.map(p => "• " + p).join("<br>")}
        </div>
    `;

    addMessage(html);
}

//---------------------------------------------------------
// RENDER: DEATH SCREEN
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
document.addEventListener("keydown", (e) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    switch (e.key) {
        case "ArrowUp":
            ws.send("move up");
            break;

        case "ArrowDown":
            ws.send("move down");
            break;

        case "ArrowLeft":
            ws.send("move left");
            break;

        case "ArrowRight":
            ws.send("move right");
            break;
    }
});

