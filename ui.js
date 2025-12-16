// ===============================================
// ui.js – Authentication UI + Themes (CLEAN)
// ===============================================

console.log("🧩 ui.js loaded");

// -------------------------------------------------
// CALLBACKS (wired by client.js)
// -------------------------------------------------
let onCreate = null;
let onLogin  = null;

export function bindAuthActions(createFn, loginFn) {
    console.log("🔗 bindAuthActions()");
    onCreate = createFn;
    onLogin  = loginFn;
}

// -------------------------------------------------
// DOM ELEMENTS
// -------------------------------------------------
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

// -------------------------------------------------
// STATE
// -------------------------------------------------
let authMode      = null; // "create" | "login"
let chosenRace    = null;
let chosenPronoun = null;

// -------------------------------------------------
// PRONOUN RULES
// -------------------------------------------------
const RACE_PRONOUNS = {
    goblin: ["they", "it"],
    human:  ["he", "she", "they", "it"],
    elf:    ["he", "she"]
};

// -------------------------------------------------
// THEMES
// -------------------------------------------------
export function applyThemeForRace(race) {
    console.log("🎨 applyThemeForRace:", race);

    const themeLink = document.getElementById("theme-css");
    if (!themeLink) {
        console.warn("⚠ theme-css <link> missing");
        return;
    }

    switch (race) {
        case "goblin": themeLink.href = "themes/goblin.css"; break;
        case "elf":    themeLink.href = "themes/elven.css"; break;
        case "human":  themeLink.href = "themes/human.css"; break;
        default:       themeLink.href = "themes/default.css";
    }
}

// -------------------------------------------------
// SHOW / HIDE AUTH UI
// -------------------------------------------------
export function showAuthModal(mode) {
    console.log("🪟 showAuthModal:", mode);

    authMode      = mode;
    chosenRace    = null;
    chosenPronoun = null;

    authError.textContent = "";
    usernameHint.textContent = "";
    passwordHint.textContent = "";

    authUsername.value = "";
    authPassword.value = "";

    welcomeScreen.classList.add("hidden");
    modalOverlay.classList.remove("hidden");
    gameUI.classList.add("hidden");

    authTitle.textContent = mode === "create"
        ? "Create a Being"
        : "Login";

    raceUI.classList.remove("hidden");
    pronounUI.classList.remove("hidden");

    authUsername.parentElement.style.display = "block";
    authPassword.parentElement.style.display = "block";
    btnAuthConfirm.style.display = "inline-block";
}

export function hideAuthUI() {
    console.log("🚪 hideAuthUI()");
    modalOverlay.classList.add("hidden");
    welcomeScreen.classList.add("hidden");
    gameUI.classList.remove("hidden");
}

// -------------------------------------------------
// RACE / PRONOUN SELECTION
// -------------------------------------------------
function filterPronouns(race) {
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
        console.log("🧬 race selected:", chosenRace);
        filterPronouns(chosenRace);
    };
});

document.querySelectorAll(".pronoun-btn").forEach(btn => {
    btn.onclick = () => {
        chosenPronoun = btn.dataset.pronoun;
        console.log("🗣 pronoun selected:", chosenPronoun);
    };
});

// -------------------------------------------------
// CONFIRM
// -------------------------------------------------
btnAuthConfirm.onclick = () => {
    console.log("✅ auth confirm");

    authError.textContent = "";

    const name = authUsername.value.trim();
    const pass = authPassword.value.trim();

    if (!chosenRace || !chosenPronoun) {
        authError.textContent = "Select race and pronouns.";
        return;
    }

    if (!name || !pass) {
        authError.textContent = "Missing name or key phrase.";
        return;
    }

    if (authMode === "create") {
        console.log("📤 create account");
        if (onCreate) onCreate(name, pass, chosenRace, chosenPronoun);
        return;
    }

    const loginId = `${name.toLowerCase()}@${chosenRace}.${chosenPronoun}`;
    console.log("📤 login:", loginId);
    if (onLogin) onLogin(loginId, pass);
};

// -------------------------------------------------
// CANCEL
// -------------------------------------------------
btnAuthCancel.onclick = () => {
    console.log("↩ auth cancel");
    modalOverlay.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
};
