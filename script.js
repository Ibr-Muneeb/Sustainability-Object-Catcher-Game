let fallingObjects = [];
let gameInterval = null;
let gameRunning = false;

document.addEventListener("DOMContentLoaded", function () {

    const pane = document.getElementById("pane");
    const box = document.getElementById("catcher");

    const w = pane.clientWidth - box.clientWidth;
    const d = {};
    const x = 5;

    function newv(v, a, b) {
        let n = v
            - (d[a] ? x : 0)
            + (d[b] ? x : 0);

        if (n < 0) return 0;
        if (n > w) return w;
        return n;
    }

    window.addEventListener("keydown", function (e) {
        d[e.keyCode] = true;
    });

    window.addEventListener("keyup", function (e) {
        d[e.keyCode] = false;
    });

    setInterval(function () {
        const currentLeft = box.offsetLeft;
        box.style.left = newv(currentLeft, 37, 39) + "px";
    }, 20);

});

const items = [
    { name: "chip-bag", type: "trash" },
    { name: "plastic-wrapper", type: "trash" },
    { name: "styrofoam", type: "trash" },

    { name: "plastic-bottle", type: "recycle" },
    { name: "can", type: "recycle" },
    { name: "paper", type: "recycle" },

    { name: "banana-peel", type: "compost" },
    { name: "apple-core", type: "compost" },
    { name: "leaves", type: "compost" }
];


function  startGame() {
    if (gameRunning) return;
    gameRunning = true;

    const startButton = document.getElementById("start");
    const catcher = document.getElementById("catcher");

    startButton.style.display = "none";
    catcher.style.visibility = "visible";

    createFallingObjects();
    startGameLoop();
}

function createFallingObjects() {
    const pane = document.getElementById("pane");
    const spacing = 120; 

    for (let i = 0; i < 5; i++) {
        const obj = document.createElement("div");
        const item = items[Math.floor(Math.random() * items.length)];

        obj.classList.add("falling-object", item.type);
        obj.dataset.type = item.type;

        obj.style.width = "40px";
        obj.style.height = "40px";
        obj.style.position = "absolute";

        obj.style.left = Math.random() * (pane.clientWidth - 40) + "px";
        obj.style.top = -(i * spacing + 40) + "px"; 

        pane.appendChild(obj);
        fallingObjects.push(obj);
    }
}

function startGameLoop() {
    gameInterval = setInterval(() => {
        fallingObjects.forEach(obj => moveFallingObject(obj));
    }, 20);
}

function moveFallingObject(obj) {
    const pane = document.getElementById("pane");

    let y = obj.offsetTop;
    y += 2;
    obj.style.top = y + "px";

    if (y > pane.clientHeight) {
        resetObject(obj);
    }
}

function resetObject(obj) {
    const pane = document.getElementById("pane");
    const spacing = 500;

    const item = items[Math.floor(Math.random() * items.length)];

    obj.className = "falling-object " + item.type;
    obj.dataset.type = item.type;

    obj.style.top = -(Math.random() * spacing + 40) + "px"; 
    obj.style.left = Math.random() * (pane.clientWidth - 40) + "px";
}

