// CLIENT-SIDE HELD ITEM CACHE
let clientHeldItem = null;
export function setClientHeldItem(id) {
    clientHeldItem = id || null;
    updateHandsDisplay();
}



// ===============================================
// hudUI.js — Player HUD (top bar only)
// ===============================================

export function updatePlayerHUD(player) {
    if (!player) return;

    const nameCol = document.getElementById("player-name-col");
    const hudCol  = document.getElementById("hud-col");
    const topBar  = document.getElementById("top-bar");

    if (nameCol) {
        nameCol.textContent =
            `${player.name}@${player.race}.${player.pronoun}`;
    }

    if (hudCol) hudCol.classList.remove("hidden");
    if (topBar) topBar.classList.remove("hidden");
    // Reveal hands bar
const hands = document.getElementById("hands-bar");
if (hands) hands.classList.remove("hidden");

}
export function updateHUD({ level, energy, stamina, interactions }) {
    if (level !== undefined)
        document.getElementById("hud-level").textContent = `🧠 ${level}`;

    if (energy !== undefined)
        document.getElementById("hud-energy").textContent = `⚡ ${energy}%`;

    if (stamina !== undefined)
        document.getElementById("hud-stamina").textContent = `💪 ${stamina}%`;

    if (interactions !== undefined)
        document.getElementById("hud-interact").textContent = `❗ ${interactions}`;
}

// ===============================================
// HAND DISPLAY
// ===============================================
export function updateHandsDisplay() {
    const left = document.getElementById("hand-left");
    if (!left) return;

    if (!clientHeldItem) {
        left.textContent = "✋";
        left.classList.remove("obj");
        left.removeAttribute("data-name");
        left.removeAttribute("data-actions");
        return;
    }

    // Lookup emoji if available (worldItems populated later)
    const def = window.worldItems?.[clientHeldItem];
    const emoji = def?.emoji || "❓";

    const actions = JSON.stringify(["drop","store","look"]);
    left.textContent = emoji;
    left.classList.add("obj");
    left.dataset.name = clientHeldItem;
    left.dataset.actions = actions;
}
