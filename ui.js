// ===============================================
// ui.js – Character Sheet Authentication UI
// ===============================================

import { beginCreateAccount, attemptLogin } from "./client.js";

/* DOM ELEMENTS */
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

/* STATE */
let authMode       = null; // "create" | "login"
let createStep     = null; // "race" | "pronoun" | "credentials"
let chosenRace     = null;
let chosenPronoun  = null;

/* PRONOUN RULES */
const RACE_PRONOUNS = {
    goblin: ["they", "it"],
    human:  ["he", "she", "they", "it"],
    elf:    ["he", "she"]
};
const body = document.body;

function applyThemeForRace(race) {
    const classes = body.classList;
    classes.remove("theme-default", "theme-goblin", "theme-elf", "theme-human");

    switch (race) {
        case "goblin":
            classes.add("theme-goblin");
            break;
        case "elf":
            classes.add("theme-elf");
            break;
        case "human":
            classes.add("theme-human");
            break;
        default:
            classes.add("theme-default");
            break;
    }
}


/* ============================================================
   PUBLIC — SHOW / HIDE AUTH UI
   ============================================================ */
export function showAuthModal(mode) {
    authMode = mode;
    authError.textContent   = "";
    usernameHint.textContent = "";
    passwordHint.textContent = "";

    authUsername.value = "";
    authPassword.value = "";

    chosenRace    = null;
    chosenPronoun = null;
    createStep    = null;

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

    // apply race theme AFTER character is actually in the game
    applyThemeForRace(chosenRace || "default");
}


/* ============================================================
   CREATE MODE (step-by-step)
   ============================================================ */
function setupCreateUI() {
    authTitle.textContent = "Create a Being";

    createStep = "race";
    chosenRace = null;
    chosenPronoun = null;

    // Step 1: race only
    raceUI.classList.remove("hidden");
    pronounUI.classList.add("hidden");

    authUsername.parentElement.style.display = "none";
    authPassword.parentElement.style.display = "none";
    btnAuthConfirm.style.display = "none";
}

function goToPronounStep() {
    createStep = "pronoun";

    authTitle.textContent = "Choose Pronouns";

    raceUI.classList.add("hidden");
    pronounUI.classList.remove("hidden");

    filterPronounButtons(chosenRace);
}

function goToCredentialStep() {
    createStep = "credentials";

    pronounUI.classList.add("hidden");

    authTitle.textContent = "Name This Being";

    authUsername.parentElement.style.display = "block";
    authPassword.parentElement.style.display = "block";
    btnAuthConfirm.style.display = "inline-block";

    authUsername.focus();
}

/* ============================================================
   LOGIN MODE (one screen with race + pronoun)
   ============================================================ */
function setupLoginUI() {
    authTitle.textContent = "Login";

    createStep = null;

    raceUI.classList.remove("hidden");
    pronounUI.classList.remove("hidden");

    authUsername.parentElement.style.display = "block";
    authPassword.parentElement.style.display = "block";
    btnAuthConfirm.style.display = "inline-block";

    authUsername.placeholder = "Character name";
    usernameHint.textContent = "Choose race + pronouns, then enter key phrase.";
}

/* ============================================================
   RACE + PRONOUN BUTTONS
   ============================================================ */
function filterPronounButtons(race) {
    const allowed = RACE_PRONOUNS[race] || [];
    document.querySelectorAll(".pronoun-btn").forEach(btn => {
        btn.style.display = allowed.includes(btn.dataset.pronoun)
            ? "inline-block"
            : "none";
    });
}

document.querySelectorAll(".race-btn").forEach(btn => {
    btn.onclick = () => {
        chosenRace = btn.dataset.race;

        if (!chosenRace) return;

        if (authMode === "create") {
            // step-by-step flow
            goToPronounStep();
        } else {
            // login: keep everything on screen, just filter pronouns
            filterPronounButtons(chosenRace);
        }
    };
});

document.querySelectorAll(".pronoun-btn").forEach(btn => {
    btn.onclick = () => {
        chosenPronoun = btn.dataset.pronoun;

        if (authMode === "create") {
            goToCredentialStep();
        } else {
            // login: just let them type password now
            authPassword.focus();
        }
    };
});

/* ============================================================
   LIVE VALIDATION — NAME + PASSWORD
   ============================================================ */
authUsername.addEventListener("input", () => {
    let val = authUsername.value.trim();

    // LOGIN: no auto-formatting, just show preview
    if (authMode === "login") {
        usernameHint.style.color = "#ccc";
        if (chosenRace && chosenPronoun && val.length >= 1) {
            usernameHint.textContent =
                `Logging in as ${val.toLowerCase()}@${chosenRace}.${chosenPronoun}`;
        } else {
            usernameHint.textContent = "Choose race + pronouns, then type the name.";
        }
        return;
    }

    // CREATE: auto format first letter upper, rest lower
    authUsername.value =
        val.charAt(0).toUpperCase() +
        val.slice(1).toLowerCase();

    val = authUsername.value;

    if (val.length === 0) {
        usernameHint.style.color = "#ccc";
        usernameHint.textContent = "Name must be at least 4 letters.";
        return;
    }

    if (val.length < 4) {
        const need = 4 - val.length;
        usernameHint.style.color = "#ffdd88";
        usernameHint.textContent = `This being is still forming (needs ${need} more letter${need === 1 ? "" : "s"}).`;
        return;
    }

    const NAME_RE = /^[A-Za-z']+$/;
    if (!NAME_RE.test(val)) {
        usernameHint.style.color = "#ff9d9d";
        usernameHint.textContent = "Letters and ' only. No spaces or numbers.";
        return;
    }

    usernameHint.style.color = "#a0ffa0";
    usernameHint.textContent = "This name feels stable.";
});

authPassword.addEventListener("input", () => {
    const val = authPassword.value;

    if (val.length === 0) {
        passwordHint.style.color = "#ccc";
        passwordHint.textContent = "Choose a key phrase.";
        return;
    }

    if (val.length < 6) {
        const need = 6 - val.length;
        passwordHint.style.color = "#ffdd88";
        passwordHint.textContent = `That key is fragile (needs ${need} more character${need === 1 ? "" : "s"}).`;
        return;
    }

    passwordHint.style.color = "#a0ffa0";
    passwordHint.textContent = "That key feels strong enough for now.";
});

/* ============================================================
   CONFIRM BUTTON
   ============================================================ */
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
            authError.textContent = "Missing name or key phrase.";
            return;
        }

        beginCreateAccount(name, pass, chosenRace, chosenPronoun);
        return;
    }

    // LOGIN
    if (!chosenRace || !chosenPronoun) {
        authError.textContent = "Select race and pronouns.";
        return;
    }
    if (!name || !pass) {
        authError.textContent = "Enter name and key phrase.";
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

/* ============================================================
   CANCEL BUTTON
   ============================================================ */
btnAuthCancel.onclick = () => {
    modalOverlay.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
};
