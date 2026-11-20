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
            if (musicOn) musicFadeOut(1.5); // music fades during bootup
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
    if (musicOn) musicFadeIn(2.5); // gently back in, only if it was on
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

//Music: Toggles on/off
const tracks = [
    "assets/lofi1.mp3",
    "assets/lofi2.mp3",
    "assets/lofi3.mp3"
];

const MUSIC_VOLUME = 0.25; // 0 = silent, 1 = full volume
const CROSSFADE = 4;       // seconds two songs overlap
const musicButton = document.querySelector(".music-toggle");
let musicOn = false;
let audioCtx = null;   // Web Audio
let musicGain = null;  // master volume: on/off and computer fades
let players = [];      // one audio element + its own volume per track
let current = -1;      // which track is playing (-1 = none yet)
let switching = false; // true while two tracks crossfade
let pauseTimer = null;

// Smoothly slides a volume control to `target` over `seconds`
function ramp(gainNode, target, seconds) {
    const now = audioCtx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(target, now + seconds);
}

// Builds the players the first time music is turned on.
// Each track gets its own volume.
function setUpAudio() {
    if (audioCtx) return;
    audioCtx = new AudioContext();
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(audioCtx.destination);

    players = tracks.map((src) => {
        const audio = new Audio(src);
        audio.preload = "none"; // download only when it plays
        const gain = audioCtx.createGain();
        gain.gain.value = 0;
        audioCtx.createMediaElementSource(audio).connect(gain).connect(musicGain);

        // near the end of the current song, start crossfading to the next
        audio.addEventListener("timeupdate", () => {
            const isCurrent = players[current] && players[current].audio === audio;
            if (isCurrent && !switching && audio.duration - audio.currentTime < CROSSFADE) {
                nextTrack();
            }
        });
        return { audio, gain };
    });
}

// Starts a track from the beginning and fades it up
function startTrack(i) {
    current = i;
    const p = players[i];
    p.audio.currentTime = 0;
    p.audio.play().catch(() => { });
    ramp(p.gain, 1, CROSSFADE);
}

// Random next track, never the same one twice in a row
function nextTrack() {
    switching = true;
    const old = players[current];
    ramp(old.gain, 0, CROSSFADE);
    setTimeout(() => {
        old.audio.pause();
        switching = false;
    }, CROSSFADE * 1000);

    let next;
    do {
        next = Math.floor(Math.random() * tracks.length);
    } while (next === current);
    startTrack(next);
}

function musicFadeIn(seconds) {
    setUpAudio();
    clearTimeout(pauseTimer); // cancel a pause from a fade-out still in progress
    audioCtx.resume();
    if (current === -1) {
        startTrack(Math.floor(Math.random() * tracks.length)); // first song is random too
    } else {
        players[current].audio.play().catch(() => { }); // pick up where it left off
    }
    ramp(musicGain, MUSIC_VOLUME, seconds);
}

function musicFadeOut(seconds) {
    if (!audioCtx) return; // music never started
    ramp(musicGain, 0, seconds);
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
        players.forEach((p) => p.audio.pause()); // pause once silent
    }, seconds * 1000);
}

// On/off button
musicButton.addEventListener("click", () => {
    musicOn = !musicOn;
    musicButton.setAttribute("aria-pressed", String(musicOn));
    musicButton.textContent = musicOn ? "♪ Music: On" : "♪ Music: Off";
    if (musicOn) {
        musicFadeIn(1.5);
    } else {
        musicFadeOut(1);
    }
});