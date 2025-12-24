// ===============================================
// render.js – Room + System Rendering (Action Bar)
// ===============================================

// NOTE: sendText is provided via window.sendText
// to avoid circular ES module imports

const actionBar = document.getElementById("action-bar");

// -----------------------------------------------
// SYSTEM MESSAGES
// -----------------------------------------------
export function renderSystem(msg) {
    const out = document.getElementById("output");
    if (!out) return;

    out.innerHTML += `<div class="system-msg">${msg}</div>`;
    out.scrollTop = out.scrollHeight;
}

// -----------------------------------------------
// ACTION BAR HELPERS
// -----------------------------------------------
function hideActionBar() {
    if (!actionBar) return;
    actionBar.classList.add("hidden");
    actionBar.innerHTML = "";
}

function showActionBar(objectName, actions) {
    if (!actionBar || !window.sendText) return;

    actionBar.innerHTML = "";

    actions.forEach(action => {
        const btn = document.createElement("button");
        btn.className = "action-btn";
        btn.textContent = action;

        btn.onclick = () => {
            window.sendText(`${action} ${objectName}`);
            hideActionBar();
        };

        actionBar.appendChild(btn);
    });

    actionBar.classList.remove("hidden");
}

// -----------------------------------------------
// ROOM RENDER
// -----------------------------------------------
export function renderRoom(data, selfName) {
    const out = document.getElementById("output");
    if (!out) return;

    out.innerHTML = "";
    hideActionBar();

    // Title
    out.innerHTML += `<h2>${data.title}</h2>`;

    const objects = data.objects || [];
    const lines = Array.isArray(data.desc) ? data.desc : [data.desc];

    // Description
    lines.forEach(line => {
        let processed = line;

        objects.forEach(obj => {
            const regex = new RegExp(`\\b${obj.name}\\b`, "gi");
            processed = processed.replace(regex, () => `
                ${obj.emoji || ""}
                <span class="obj"
                      data-name="${obj.name}"
                      data-actions='${JSON.stringify(obj.actions || ["look"])}'>
                    ${obj.name}
                </span>
            `);
        });

        out.innerHTML += `<p>${processed}</p>`;
    });

    // Objects list
    if (objects.length) {
        out.innerHTML += `<div class="room-objects"><strong>You see:</strong><br>`;
        objects.forEach(obj => {
            out.innerHTML += `
                ${obj.emoji || ""}
                <span class="obj"
                      data-name="${obj.name}"
                      data-actions='${JSON.stringify(obj.actions || ["look"])}'>
                    ${obj.name}
                </span><br>
            `;
        });
        out.innerHTML += `</div>`;
    }

    // Exits
    out.innerHTML += `
        <div class="exits-block">
            <strong>Exits:</strong> ${(data.exits || []).join(", ")}
        </div>
    `;

    // Players
    if (data.players?.length) {
        out.innerHTML += `
            <div class="room-players">
                <strong>Players here:</strong><br>
                ${data.players
                    .map(name => `• ${name === selfName ? "you" : name}`)
                    .join("<br>")}
            </div>
        `;
    }

    updateMovementButtons(data);
    out.scrollTop = out.scrollHeight;
}

// -----------------------------------------------
// OBJECT CLICK → ACTION BAR
// -----------------------------------------------
document.addEventListener("click", e => {
    if (!e.target.classList.contains("obj")) return;

    const name = e.target.dataset.name;
    const actions = JSON.parse(e.target.dataset.actions || "[]");

    showActionBar(name, actions);
});

// -----------------------------------------------
// DIM MOVEMENT BUTTONS
// -----------------------------------------------
function updateMovementButtons(roomData) {
    const exits = roomData.exits || [];

    document.querySelectorAll(".arrow-btn").forEach(btn => {
        const dir = btn.getAttribute("data-dir");
        btn.classList.toggle("disabled", !exits.includes(dir));
    });
}
