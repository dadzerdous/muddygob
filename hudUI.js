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
}
