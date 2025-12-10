// ===============================================
// ui.js – Character Sheet Authentication UI
// ===============================================

import { beginCreateAccount, attemptLogin } from "./client.js";

const welcomeScreen  = document.getElementById("welcome-screen");
const modalOverlay   = document.getElementById("modal-overlay");
const gameUI         = document.getElementById("game-ui");

const authTitle      = document.getElementById("auth-title");
const authUsername   = document.getElementById("auth-username");
const authPassword   = document.getElementById("auth-password");
const authError      = document.getElementById("auth-error");
const usernameHint   = document.getElementById("username-hint");
const passwordHint   = document.getElementById("password-hint");

const raceUI         = document.getElementById("race-select");
const pronounUI      = document.getElementById("pronoun-select");

const btnAuthConfirm = document.getElementById("auth-confirm");
const btnAuthCancel  = document.getElementById("auth-cancel");

let authMode = null;     // "create" | "login"
let chosenRace = null;
let chosenPronoun = null;

// Pronoun rules
const RACE_PRONOUNS = {
    goblin: ["they", "it"],
    human:  ["he", "she", "they", "it"],
    elf:    ["he", "she"]
};

// ================================
// PUBLIC — SHOW AUTH UI
// ================================
export function showAuthModal(mode) {
    authMode = mode;
    authError.textContent = "";
    usernameHint.textContent = "";
    passwordHint.textContent = "";

    authUsername.value = "";
    authPassword.value = "";

    chosenRace = null;
    chosenPronoun = null;

    welcomeScreen.classList.add("hidden");
    modalOverlay.classList.remove("hidden");
    gameUI.classList.add("hidden");

    if (mode === "create") {
        setupCreateUI();
    } else {
        setupLoginUI();
    }
}

export function hideAuthUI() {
    modalOverlay.classList.add("hidden");
    welcomeScreen.classList.add("hidden");
    gameUI.classList.remove("hidden");
}

// ================================
// CREATE MODE
// ================================
function setupCreateUI() {
    authTitle.textContent = "Create a Being";

    raceUI.classList.remove("hidden");
    pronounUI.classList.add("hidden");

    authUsername.parentElement.style.display = "none";
    authPassword.parentElement.style.display = "none";
    btnAuthConfirm.style.display = "none";
}

// Race → Pronoun step
document.querySelectorAll(".race-btn").forEach(btn => {
    btn.onclick = () => {
        chosenRace = btn.dataset.race;

        if (authMode === "login") {
            showPronounOptions();
            return;
        }

        goToPronouns();
    };
});

function goToPronouns() {
    authTitle.textContent = "Choose Pronouns";

    raceUI.classList.add("hidden");
    pronounUI.classList.remove("hidden");

    filterPronounButtons(chosenRace);
}

function filterPronounButtons(race) {
    const allowed = RACE_PRONOUNS[race] || [];
    document.querySelectorAll(".pronoun-btn").forEach(btn => {
        btn.style.display = allowed.includes(btn.dataset.pronoun)
            ? "block"
            : "none";
    });
}

// Pronouns → Credentials
document.querySelectorAll(".pronoun-btn").forEach(btn => {
    btn.onclick = () => {
        chosenPronoun = btn.dataset.pronoun;

        if (authMode === "login") {
            authPassword.focus();
            return;
        }

        goToCredentials();
    };
});

function goToCredentials() {
    pronounUI.classList.add("hidden");

    authTitle.textContent = "Name This Being";
    authUsername.parentElement.style.display = "block";
    authPassword.parentElement.style.display = "block";

    btnAuthConfirm.style.display = "inline-block";
    authUsername.focus();
}

// ================================
// LOGIN MODE
// ================================
function setupLoginUI() {
    authTitle.textContent = "Login";

    raceUI.classList.remove("hidden");
    pronounUI.classList.add("hidden");

    authUsername.parentElement.style.display = "block";
    authPassword.parentElement.style.display = "block";

    btnAuthConfirm.style.display = "inline-block";
    authUsername.placeholder = "Character name";

    usernameHint.textContent = "Pick race + pronoun below.";
}

// When race is picked in login
function showPronounOptions() {
    pronounUI.classList.remove("hidden");
    filterPronounButtons(chosenRace);
}

// ================================
// LIVE VALIDATION
// ================================
authUsername.addEventListener("input", () => {
    let val = authUsername.value.trim();

    if (authMode === "login") {
        usernameHint.textContent = chosenRace && chosenPronoun
            ? `Logging in as ${val}@${chosenRace}.${chosenPronoun}`
            : "Choose race + pronoun.";

        return;
    }

    // Auto-format create names
    authUsername.value =
        val.charAt(0).toUpperCase() +
        val.slice(1).toLowerCase();

    val = authUsername.value;

    if (val.length < 1) {
        usernameHint.textContent = "Name must be 4 letters.";
        return;
    }
    if (val.length < 4) {
        usernameHint.style.color = "#ffdd88";
        usernameHint.textContent = `Needs ${4 - val.length} more letters.`;
        return;
    }

    const NAME_RE = /^[A-Za-z']+$/;
    if (!NAME_RE.test(val)) {
        usernameHint.style.color = "#ff9d9d";
        usernameHint.textContent = "Letters + ' only.";
        return;
    }

    usernameHint.style.color = "#a0ffa0";
    usernameHint.textContent = "This being feels stable.";
});

authPassword.addEventListener("input", () => {
    const val = authPassword.value.trim();

    if (val.length < 1) {
        passwordHint.textContent = "Choose a key phrase.";
        return;
    }
    if (val.length < 6) {
        passwordHint.style.color = "#ffdd88";
        passwordHint.textContent = `Needs ${6 - val.length} more characters.`;
        return;
    }

    passwordHint.style.color = "#a0ffa0";
    passwordHint.textContent = "Strong enough.";
});

// ================================
// CONFIRM (Create OR Login)
// ================================
btnAuthConfirm.onclick = () => {
    authError.textContent = "";

    const name = authUsername.value.trim();
    const pass = authPassword.value.trim();

    // CREATE
    if (authMode === "create") {
        if (!chosenRace || !chosenPronoun) {
            authError.textContent = "Pick race and pronouns first.";
            return;
        }
        if (!name || !pass) {
            authError.textContent = "Missing name or password.";
            return;
        }

        beginCreateAccount(name, pass, chosenRace, chosenPronoun);
        return;
    }

    // LOGIN
    if (!chosenRace || !chosenPronoun) {
        authError.textContent = "Select race + pronouns.";
        return;
    }
    if (!name || !pass) {
        authError.textContent = "Enter name + key phrase.";
        return;
    }

    const loginId =
        name.toLowerCase() +
        "@" +
        chosenRace +
        "." +
        chosenPronoun;

    attemptLogin(loginId, pass);
};

// ================================
// CANCEL
// ================================
btnAuthCancel.onclick = () => {
    modalOverlay.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
};
