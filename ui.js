// ===============================================
// ui.js (Auth + Race/Pronoun UI)
// ===============================================

import { beginCreateAccount, attemptLogin, chooseRace, choosePronoun } from "./client.js";

const welcomeScreen = document.getElementById("welcome-screen");
const modalOverlay = document.getElementById("modal-overlay");

const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");

const usernameHint = document.getElementById("username-hint");
const passwordHint = document.getElementById("password-hint");

const authError = document.getElementById("auth-error");
const btnAuthConfirm = document.getElementById("auth-confirm");
const btnAuthCancel = document.getElementById("auth-cancel");

const raceUI = document.getElementById("race-select");
const pronounUI = document.getElementById("pronoun-select");

let authMode = null;

// -----------------------------------------------
// SHOW AUTH
// -----------------------------------------------
export function showAuthModal(mode) {
    authMode = mode;

    welcomeScreen.classList.add("hidden");
    modalOverlay.classList.remove("hidden");

    authUsername.value = "";
    authPassword.value = "";

    usernameHint.textContent = "";
    passwordHint.textContent = "";
    authError.textContent = "";

    authUsername.parentElement.style.display = "block";
    authPassword.parentElement.style.display = "block";
    btnAuthConfirm.style.display = "block";
    btnAuthCancel.style.display = "block";

    authUsername.focus();
}

export function hideAuthUI() {
    modalOverlay.classList.add("hidden");
    raceUI.classList.add("hidden");
    pronounUI.classList.add("hidden");
}

// -----------------------------------------------
// LIVE VALIDATION
// -----------------------------------------------
authUsername.addEventListener("input", () => {
    const v = authUsername.value;
    if (v.length < 3) {
        usernameHint.textContent = `Needs ${3 - v.length} more characters`;
    } else {
        usernameHint.textContent = "✓ Good";
    }
});

authPassword.addEventListener("input", () => {
    const v = authPassword.value;
    if (v.length < 4) {
        passwordHint.textContent = `Needs ${4 - v.length} more characters`;
    } else {
        passwordHint.textContent = "✓ Looks good";
    }
});

// -----------------------------------------------
// AUTH SUBMIT
// -----------------------------------------------
btnAuthConfirm.onclick = () => {
    const name = authUsername.value.trim();
    const pass = authPassword.value.trim();

    if (name.length < 3) return authError.textContent = "Username too short.";
    if (pass.length < 4) return authError.textContent = "Password too short.";

    if (authMode === "create") {
        beginCreateAccount(name, pass);
    } else {
        attemptLogin(name, pass);
    }
};

btnAuthCancel.onclick = () => modalOverlay.classList.add("hidden");

// -----------------------------------------------
// RACE UI
// -----------------------------------------------
export function showRaceUI() {
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
// PRONOUN UI
// -----------------------------------------------
export function showPronounUI(allowed) {
    pronounUI.classList.remove("hidden");

    document.querySelectorAll(".pronoun-btn").forEach(btn => {
        btn.style.display = allowed.includes(btn.dataset.pronoun) ? "block" : "none";

        btn.onclick = () => {
            choosePronoun(btn.dataset.pronoun);
            pronounUI.classList.add("hidden");
        };
    });
}
