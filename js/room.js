// Greeting plays when the page loads.
const greeting = "Hello! My name is Aza. Welcome to my room!";

//Dialog lines for each object within room
const dialog = {
    character: [
        "I'm a software development student and I enjoy design and accessibility in programming.",
        "If you'd like to see some of my work, take a look at my computer!"
    ],
    cat: ["*purrs*", "*mrrp*"],
    computer: ["Logging on to Aza's computer..."],
    painting: ["It's a painting of a Steller's jay! Unlike a real one, this one stays completely silent while Aza works."],
    cactus: ["A healthy-looking Cowboy Cactus. Its soil looks dry, just like it likes."],
    pearls: ["A stylish String of Pearls sits near the window. It looks like it was placed here purely for the vibes."],
    syngonium: ["A bushy Syngonium batik plant. One of the lower leaves has a suspiciously tiny bite mark on it..."],
    bookshelf: ["Mostly books about coding and houseplants."],
    diploma: ["It’s Aza’s BFA in art education from Weber State University!"]
};

//Find page elements, check user's motion settings.

const dialogText = document.querySelector(".dialog-text");

const shownText = document.querySelector(".dialog-shown");
const restText = document.querySelector(".dialog-rest");

const dialogLive = document.querySelector(".sr-only");

const characterSprite = document.querySelector("#character-sprite");

// True if user asks for less motion
const reduceMotion = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

// The typewriter
let typingTimer = null;
let fullText = "";

//Shows each line of the dilog box, one letter at a time.
function say(text) {
    clearInterval(typingTimer); //stop at any line that's still typing
    fullText = text;
    dialogLive.textContent = text;  //screen readers get full line instantly

        if (reduceMotion) {
        shownText.textContent = text;
        restText.textContent = "";
        return;
    }

    let shown = 0;
    shownText.textContent = "";
    restText.textContent = text;          // whole line laid out, invisible
    typingTimer = setInterval(() => {
        shown++;
        shownText.textContent = text.slice(0, shown);   // typed so far
        restText.textContent = text.slice(shown);       // everything after
        if (shown >= text.length) {
            clearInterval(typingTimer);
        }
    }, 35);
}

// Clicking the dialog box while a line is typing shows all of it.
document.querySelector(".dialog").addEventListener("click", () => {
    clearInterval(typingTimer);
    dialogText.textContent = fullText;
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
const followingDialog ={};

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
        }
    });
});

// Greet visitor on open
say(greeting);