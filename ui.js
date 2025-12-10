// ===============================================
// ui.js (Authentication + Race/Pronoun UI)
// ===============================================

import { beginCreateAccount, attemptLogin, chooseRace, choosePronoun } from "./client.js";

// DOM elements
const welcomeScreen = document.getElementById("welcome-screen");
const modalOverlay = document.getElementById("modal-overlay");
const authModal = document.getElementById("auth-modal");

const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const authError = document.getElementById("auth-error");

const btnAuthConfirm = document.getElementById("auth-confirm");
const btnAuthCancel = document.getElementById("auth-cancel");

const raceUI = document.getElementById("race-select");
const pronounUI = document.getElementById("pronoun-select");

let authMode = null;


// -----------------------------------------------
// PUBLIC
// -----------------------------------------------
export function showAuthModal(mode) {
    authMode = mode;

    welcomeScreen.classList.add("hidden");
    modalOverlay.classList.remove("hidden");

    authUsername.value = "";
    authPassword.value = "";
    authPassword.style.display = "block";
    authUsername.parentElement.style.display = "block";

    // auto-focus
    authUsername.focus();
}

export function hideAuthUI() {
    // Only closes welcome screen + login form,
    // but does NOT hide modal overlay if race/pronoun phases are active.
    welcomeScreen.classList.add("hidden");

    authUsername.parentElement.style.display = "none";
    authPassword.parentElement.style.display = "none";
    btnAuthConfirm.style.display = "none";
    btnAuthCancel.style.display = "none";
}



// -----------------------------------------------
// Authentication click
// -----------------------------------------------
btnAuthConfirm.onclick = () => {
    authError.textContent = "";

    const name = authUsername.value.trim();
    const pass = authPassword.value.trim();

    if (!name || !pass) {
        authError.textContent = "Missing fields.";
        return;
    }

    if (authMode === "create") {
        beginCreateAccount(name, pass);
    } else {
        attemptLogin(name, pass);
    }
};

btnAuthCancel.onclick = () => {
    modalOverlay.classList.add("hidden");
};


// -----------------------------------------------
// RACE SELECTION UI
// -----------------------------------------------
export function showRaceUI() {
    // hide fields
    authUsername.parentElement.style.display = "none";
    authPassword.parentElement.style.display = "none";
    btnAuthConfirm.style.display = "none";
    btnAuthCancel.style.display = "none";

    raceUI.classList.remove("hidden");
}

document.querySelectorAll(".race-btn").forEach(btn => {
    btn.onclick = () => {
        chooseRace(btn.dataset.race);
        raceUI.classList.add("hidden");
    };
});


// -----------------------------------------------
// PRONOUN SELECTION UI
// -----------------------------------------------
export function showPronounUI(allowed) {
    pronounUI.classList.remove("hidden");

    document.querySelectorAll(".pronoun-btn").forEach(btn => {
        btn.style.display = allowed.includes(btn.dataset.pronoun)
            ? "block"
            : "none";

        btn.onclick = () => {
            choosePronoun(btn.dataset.pronoun);
            pronounUI.classList.add("hidden");
        };
    });
}
