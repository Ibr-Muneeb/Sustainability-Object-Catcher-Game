let fallingObjects = [];
let gameInterval = null;
let gameRunning = false;

let score = 0;
let hiScore = 0;
let strikes = 0;
const MAX_STRIKES = 3;


let currentMode = "trash";

document.addEventListener("DOMContentLoaded", function () {
  hiScore = Number(localStorage.getItem("hiScore") || 0);
  if (!Number.isFinite(hiScore)) hiScore = 0;
  updateScoreUI();

  const pane = document.getElementById("pane");
  const box = document.getElementById("catcher");

  setCatcherMode(currentMode);

  const w = pane.clientWidth - box.clientWidth;
  const d = {};
  const x = 10;

  function newv(v, a, b) {
    let n = v - (d[a] ? x : 0) + (d[b] ? x : 0);
    if (n < 0) return 0;
    if (n > w) return w;
    return n;
  }

  window.addEventListener("keydown", function (e) {
    if (e.key === "1") {
      setCatcherMode("trash");
      return;
    }
    if (e.key === "2") {
      setCatcherMode("recycle");
      return;
    }
    if (e.key === "3") {
      setCatcherMode("compost");
      return;
    }

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

function setCatcherMode(mode) {
  currentMode = mode;
  const catcher = document.getElementById("catcher");
  if (!catcher) return;

  catcher.classList.remove("trash", "recycle", "compost");
  catcher.classList.add(mode);
}

function updateScoreUI() {
  const scoreEl = document.getElementById("score");
  const hiEl = document.getElementById("hi-score");

  if (scoreEl) scoreEl.textContent = `score: ${score}  |  strikes: ${strikes}/${MAX_STRIKES}`;
  if (hiEl) hiEl.textContent = `hi-score: ${hiScore}`;
}


function isColliding(a, b) {
  const aLeft = a.offsetLeft;
  const aTop = a.offsetTop;
  const aRight = aLeft + a.offsetWidth;
  const aBottom = aTop + a.offsetHeight;

  const bLeft = b.offsetLeft;
  const bTop = b.offsetTop;
  const bRight = bLeft + b.offsetWidth;
  const bBottom = bTop + b.offsetHeight;

  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

function handleCatch(obj) {
  const objType = obj.dataset.type;

  if (objType === currentMode) {
    score += 1;
  } else {
    strikes += 1;
    if (strikes >= MAX_STRIKES) {
      updateScoreUI();
      endGame("Too many wrong bins!");
      return;
    }
  }

  if (score > hiScore) {
    hiScore = score;
    localStorage.setItem("hiScore", String(hiScore));
  }

  updateScoreUI();
  resetObject(obj);
}


function startGame() {
  if (gameRunning) return;
  gameRunning = true;

  score = 0;
  strikes = 0;
  updateScoreUI();

  const startButton = document.getElementById("start");
  const catcher = document.getElementById("catcher");

  startButton.style.display = "none";
  catcher.style.visibility = "visible";

  createFallingObjects();
  startGameLoop();
}

function createFallingObjects() {
  const pane = document.getElementById("pane");
  const spacing = 250;

  for (let i = 0; i < 3; i++) {
    const obj = document.createElement("div");
    const item = items[Math.floor(Math.random() * items.length)];

    obj.classList.add("falling-object", item.type);
    obj.dataset.type = item.type;

    obj.style.width = "35px";
    obj.style.height = "35px";
    obj.style.position = "absolute";

    obj.style.left = Math.random() * (pane.clientWidth - 40) + "px";
    obj.style.top = -(i * spacing + 40) + "px";

    pane.appendChild(obj);
    fallingObjects.push(obj);
  }
}

function startGameLoop() {
  const catcher = document.getElementById("catcher");

  if (gameInterval) clearInterval(gameInterval);

  gameInterval = setInterval(() => {
    fallingObjects.forEach(obj => {
      moveFallingObject(obj);

      if (isColliding(obj, catcher)) {
        handleCatch(obj);
      }
    });
  }, 20);
}

function moveFallingObject(obj) {
  const pane = document.getElementById("pane");

  let y = obj.offsetTop;
  y += 2;
  obj.style.top = y + "px";

  if (y > pane.clientHeight) {
  strikes += 1;

  if (strikes >= MAX_STRIKES) {
    updateScoreUI();
    endGame("You missed too many objects!");
    return;
  }

  updateScoreUI();
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

function endGame(reasonText = "Game Over!") {
  gameRunning = false;

  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  fallingObjects.forEach(o => o.remove());
  fallingObjects = [];

  const startButton = document.getElementById("start");
  if (startButton) {
    startButton.style.display = "block";
    startButton.textContent = "Restart Game";
  }

  alert(`${reasonText}\nFinal score: ${score}`);
}

