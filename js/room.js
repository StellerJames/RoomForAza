// Greeting plays when the page loads.
const greeting = "Hello! My name is Aza. Welcome to my room!";

//Dialog lines for each object within room
const dialog = {
    character: ["I'm a software development student and I enjoy accessibility and design in programming.",
        "If you'd like to see some of my work, take a look at my computer!"],
    cat: ["*purrs*", "*mrrp*"],
    computer: ["Logging on to Aza's computer..."],
    painting: ["It's a painting of a Steller's jay! Unlike a real one, this one stays completely silent while Aza works."],
    cactus: ["A healthy-looking Cowboy Cactus. Its soil looks dry, just like it likes."],
    pearls: ["A stylish String of Pearls plant sits near the window. It looks like it was placed here purely for the vibes."],
    syngonium: ["A bushy Syngonium. One of the lower leaves has a tiny bite mark on it..."],
    bookshelf: ["Mostly books about visual art and houseplants."],
    minishelf: ["A small shelf of well-loved books. A dog-eared copy of Eloquent JavaScript sits in the middle."],
    diploma: ["It’s Aza’s Bachelor of Art Education from WSU!"]
};

//Page Elements
//Dialog Box
const shownText = document.querySelector(".dialog-shown");
const restText = document.querySelector(".dialog-rest");
const dialogLive = document.querySelector(".sr-only");

//Sprites
const characterSprite = document.querySelector("#character-sprite");

//Desktop
const boot = document.querySelector(".boot");
const desktop = document.querySelector(".desktop");
const startButton = document.querySelector(".start-button");
const startMenu = document.querySelector(".start-menu");
const computerButton = document.querySelector('[data-object="computer"]');

const dialupSound = new Audio("assets/dialup.mp3");
dialupSound.volume = 0.3;   // 0 = silent, 1 = full volume

// True if user asks for less motion
const reduceMotion = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

// The typewriter
let typingTimer = null;
let fullText = "";

//Shows each line of the dialog box, one letter at a time.
function say(text) {
    clearInterval(typingTimer); //stop at any line that's still typing
    fullText = text;
    dialogLive.textContent = text; //screen readers get full line instantly

    if (reduceMotion) {
        shownText.textContent = text;
        restText.textContent = "";
        return;
    }

    let shown = 0;
    shownText.textContent = "";
    restText.textContent = text; // whole line laid out, invisible
    typingTimer = setInterval(() => {
        shown++;
        shownText.textContent = text.slice(0, shown); // typed so far
        restText.textContent = text.slice(shown); // everything after
        if (shown >= text.length) {
            clearInterval(typingTimer);
        }
    }, 35);
}

// Clicking the dialog box while a line is typing shows all of it.
document.querySelector(".dialog").addEventListener("click", () => {
    clearInterval(typingTimer);
    shownText.textContent = fullText;
    restText.textContent = "";
});

// Swaps out idle GIF for the little bobbing GIF, then returns to its normal state.
function bobbing() {
    characterSprite.src = "assets/character-click-bob.gif";
    setTimeout(() => {
        characterSprite.src = "assets/character-idle.gif";
    }, 600);
}

// Which line each object shows next. Starts empty.
const followingDialog = {};

document.querySelectorAll(".hotspot").forEach((button) => {
    button.addEventListener("click", () => {
        const name = button.dataset.object;
        const list = dialog[name];
        if (!list) return; // this object doesn't have dialog

        const index = followingDialog[name] ?? 0;
        say(list[index]);
        followingDialog[name] = (index + 1) % list.length;

        if (name === "character") {
            bobbing();
        } else if (name === "computer") {
            setTimeout(bootUp, 1500);
        }
    });
});

// Greet visitor on open
say(greeting);

// Shows the boot screen with the dial-up sound. Desktop then opens.
function bootUp() {
    boot.hidden = false;
    dialupSound.currentTime = 0; // start the sound from the beginning
    dialupSound.play().catch(() => { }); // if a browser blocks sound, boot anyway

    setTimeout(() => {
        boot.hidden = true;
        desktop.hidden = false;
        document.querySelector(".desktop-icon").focus(); // keyboard users land on the desktop
    }, reduceMotion ? 300 : 3000);
}

// Closes the desktop and returns to the room.
function shutDown() {
    dialupSound.pause();
    startMenu.hidden = true;
    startButton.setAttribute("aria-expanded", "false");
    desktop.hidden = true;
    computerButton.focus(); // keyboard users land back on the computer
    say("You've logged off. Click the computer again to log back on.");
}

// Start toggles menu. Log Off goes back to the room.
startButton.addEventListener("click", () => {
    startMenu.hidden = !startMenu.hidden;
    startButton.setAttribute("aria-expanded", String(!startMenu.hidden));
});
document.querySelector(".shutdown-button").addEventListener("click", shutDown);

// Windows: Click icon to open window. Click the "X" to close it.
let topLayer = 10;   // the newest window sits on top

function openWindow(icon) {
    const win = document.getElementById("window-" + icon.dataset.window);
    if (!win) return; // no window for this icon yet
    win.hidden = false;
    topLayer++;
    win.style.zIndex = topLayer; // bring it to the front
    win.querySelector(".close-window").focus();
}

function closeWindow(closeButton) {
    const win = closeButton.closest(".window");
    win.hidden = true;
    // send keyboard focus back to the icon that opened this window
    const name = win.id.replace("window-", "");
    document.querySelector(`.desktop-icon[data-window="${name}"]`).focus();
}

document.querySelectorAll(".desktop-icon").forEach((icon) => {
    icon.addEventListener("click", () => openWindow(icon));
});

document.querySelectorAll(".close-window").forEach((button) => {
    button.addEventListener("click", () => closeWindow(button));
});

// Close rotation hint
document.querySelector(".rotate-hint-close").addEventListener("click", () => {
    document.querySelector(".rotate-hint").hidden = true;
});