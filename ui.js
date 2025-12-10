// ===============================================
// ui.js (Authentication + Race/Pronoun UI)
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

const btnAuthConfirm = document.getElementById("auth-confirm");
const btnAuthCancel  = document.getElementById("auth-cancel");

const raceUI         = document.getElementById("race-select");
const pronounUI      = document.getElementById("pronoun-select");

// State
let authMode   = null;     // "create" or "login"
let createStep = null;     // "race" | "pronoun" | "credentials"
let chosenRace = null;     // "goblin" | "human" | "elf"
let chosenPronoun = null;  // "he" | "she" | "they" | "it"

// Race → allowed pronouns
const RACE_PRONOUNS = {
    goblin: ["they", "it"],
    elf:    ["he", "she"],
    human:  ["he", "she", "they", "it"]
};

// -----------------------------------------------
// PUBLIC: SHOW / HIDE AUTH MODAL
// -----------------------------------------------
export function showAuthModal(mode) {
    authMode = mode;
    authError.textContent = "";
    usernameHint.textContent = "";
    passwordHint.textContent = "";
    authUsername.value = "";
    authPassword.value = "";

    welcomeScreen.classList.add("hidden");
    modalOverlay.classList.remove("hidden");
    gameUI.classList.add("hidden");

    if (mode === "create") {
        authTitle.textContent = "Create a Being";
        startCreateFlow();
    } else {
        authTitle.textContent = "Login";
        showLoginFields();
    }
}

export function hideAuthUI() {
    modalOverlay.classList.add("hidden");
    welcomeScreen.classList.add("hidden");
    gameUI.classList.remove("hidden");
    raceUI.classList.add("hidden");
    pronounUI.classList.add("hidden");
}

// -----------------------------------------------
// CREATE FLOW STEPS
// -----------------------------------------------
function startCreateFlow() {
    createStep = "race";
    chosenRace = null;
    chosenPronoun = null;

    // Hide fields + show race
    authUsername.parentElement.style.display = "none";
    authPassword.parentElement.style.display = "none";
    btnAuthConfirm.style.display = "none";

    raceUI.classList.remove("hidden");
    pronounUI.classList.add("hidden");
}

function goToPronounStep() {
    createStep = "pronoun";

    raceUI.classList.add("hidden");
    pronounUI.classList.remove("hidden");

    // Filter pronoun buttons based on race
    const allowed = RACE_PRONOUNS[chosenRace] || [];
    document.querySelectorAll(".pronoun-btn").forEach(btn => {
        const key = btn.dataset.pronoun;
        btn.style.display = allowed.includes(key) ? "block" : "none";
    });
}

function goToCredentialStep() {
    createStep = "credentials";

    pronounUI.classList.add("hidden");

    authUsername.parentElement.style.display = "block";
    authPassword.parentElement.style.display = "block";
    btnAuthConfirm.style.display = "inline-block";

    authTitle.textContent = "Name this being";
    authUsername.focus();
}

// -----------------------------------------------
// LOGIN FIELDS (non-create mode)
// -----------------------------------------------
function showLoginFields() {
    createStep = null;
    chosenRace = null;
    chosenPronoun = null;

    raceUI.classList.add("hidden");
    pronounUI.classList.add("hidden");

    authUsername.parentElement.style.display = "block";
    authPassword.parentElement.style.display = "block";
    btnAuthConfirm.style.display = "inline-block";

    authTitle.textContent = "Login";
    authUsername.placeholder = "name@race.pronoun";
    authUsername.focus();
}

// -----------------------------------------------
// LIVE VALIDATION
// -----------------------------------------------
authUsername.addEventListener("input", () => {
    usernameHint.style.color = "#ccc";
    const val = authUsername.value.trim();
        authUsername.value = 
        authUsername.value.charAt(0).toUpperCase() +
        authUsername.value.slice(1).toLowerCase();

    if (authMode === "login") {
        // For login, just hint the format
        if (!val.includes("@")) {
            usernameHint.textContent = "Tip: use name@race.pronoun (e.g. kimy@goblin.they)";
        } else {
            usernameHint.textContent = "";
        }
        return;
    }

    // Create mode – validate base name (we'll send race/pronoun separately)
    if (val.length === 0) {
        usernameHint.textContent = "Name must be at least 4 letters.";
        return;
    }

    if (val.length < 4) {
        const need = 4 - val.length;
        usernameHint.style.color = "#ffdd88";
        usernameHint.textContent = `That being is still forming (needs ${need} more letter${need === 1 ? "" : "s"}).`;
        return;
    }

    const NAME_RE = /^[A-Za-z']+$/;
    if (!NAME_RE.test(val)) {
        usernameHint.style.color = "#ff9d9d";
        usernameHint.textContent = "Only letters and ' are allowed. No spaces or numbers.";
        return;
    }

    usernameHint.style.color = "#a0ffa0";
    usernameHint.textContent = "This name feels stable enough.";
});

authPassword.addEventListener("input", () => {
    passwordHint.style.color = "#ccc";
    const val = authPassword.value;

    if (val.length === 0) {
        passwordHint.textContent = "Choose a secret phrase.";
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

// -----------------------------------------------
// Authentication confirm
// -----------------------------------------------
btnAuthConfirm.onclick = () => {
    authError.textContent = "";

    const name = authUsername.value.trim();
    const pass = authPassword.value.trim();

    if (authMode === "create") {
        if (createStep !== "credentials") {
            authError.textContent = "The being is not ready to be named yet.";
            return;
        }
        if (!chosenRace || !chosenPronoun) {
            authError.textContent = "Something went wrong with race/pronoun selection.";
            return;
        }
        if (!name || !pass) {
            authError.textContent = "That being cannot be created (missing name or key phrase).";
            return;
        }

        // client-side pattern check (must match server rules)
        const NAME_RE = /^[A-Za-z']{4,16}$/;
        if (!NAME_RE.test(name)) {
            authError.textContent = "Name must be 4–16 letters; apostrophes allowed.";
            return;
        }

        beginCreateAccount(name, pass, chosenRace, chosenPronoun);
        return;
    }

    // LOGIN
    if (authMode === "login") {
        if (!name || !pass) {
            authError.textContent = "Please enter both login name and password.";
            return;
        }
        attemptLogin(name, pass);
    }
};

btnAuthCancel.onclick = () => {
    authError.textContent = "";

    if (authMode === "create") {
        // Back through steps
        if (createStep === "credentials") {
            goToPronounStep();
        } else if (createStep === "pronoun") {
            startCreateFlow();
        } else {
            // from race step: go back to title
            modalOverlay.classList.add("hidden");
            welcomeScreen.classList.remove("hidden");
        }
    } else {
        // login: just close
        modalOverlay.classList.add("hidden");
        welcomeScreen.classList.remove("hidden");
    }
};

// -----------------------------------------------
// RACE SELECTION UI
// -----------------------------------------------
document.querySelectorAll(".race-btn").forEach(btn => {
    btn.onclick = () => {
        chosenRace = btn.dataset.race;
        goToPronounStep();
    };
});

// -----------------------------------------------
// PRONOUN SELECTION UI
// -----------------------------------------------
document.querySelectorAll(".pronoun-btn").forEach(btn => {
    btn.onclick = () => {
        chosenPronoun = btn.dataset.pronoun;
        goToCredentialStep();
    };
});
