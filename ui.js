// ===============================================
// ui.js – Character Sheet Authentication UI
// ===============================================

import { beginCreateAccount, attemptLogin } from "./client.js";
import { showHUD } from "./main.js";

// DOM elements
const welcomeScreen  = document.getElementById("welcome-screen");
const modalOverlay   = document.getElementById("modal-overlay");
const gameUI         = document.getElementById("game-ui");

// ... (ALL your existing UI code unchanged) ...

export function hideAuthUI() {
    modalOverlay.classList.add("hidden");
    welcomeScreen.classList.add("hidden");
    gameUI.classList.remove("hidden");
    showHUD(); // <<< HUD ON
}
