const MAX_STRIKES  = 3;
const BASE_SPEED   = 2;
const SPEED_STEP   = 1;   
const MAX_SPEED    = 6;
const CATCHER_W    = 90;
const MOVE_STEP    = 13;


const ITEMS = [
  { name: "chip-bag",       type: "trash",   img: "images/chip-bag.png" },
  { name: "coffee-cup",     type: "trash",   img: "images/coffee-cup.png" },
  { name: "pizza-box",      type: "trash",   img: "images/pizza-box.png" },
  { name: "plastic-bottle", type: "recycle", img: "images/plastic-bottle.png" },
  { name: "cardboard",      type: "recycle", img: "images/cardboard.png" },
  { name: "paper",          type: "recycle", img: "images/paper.png" },
  { name: "banana-peel",    type: "compost", img: "images/banana-peel.png" },
  { name: "apple-core",     type: "compost", img: "images/apple-core.png" },
  { name: "leaves",         type: "compost", img: "images/leaves.png" },
];

let gameRunning    = false;
let gameLoop       = null;
let moveLoop       = null;
let currentMode    = "trash";
let score          = 0;
let hiScore        = Number(localStorage.getItem("hiScore") || 0);
let strikes        = 0;
let catchCount     = 0;
let fallingSpeed   = BASE_SPEED;
let catcherLeft    = 200;
let activeObj      = null;
const keys         = {};

document.addEventListener("DOMContentLoaded", () => {
  updateHUD();

  const pane   = document.getElementById("pane");
  const catcher = document.getElementById("catcher");

  catcherLeft = pane.clientWidth / 2 - CATCHER_W / 2;
  catcher.style.left = catcherLeft + "px";

  window.addEventListener("keydown", (e) => {
    if (e.key === "1") { setCatcherMode("trash");   return; }
    if (e.key === "2") { setCatcherMode("recycle"); return; }
    if (e.key === "3") { setCatcherMode("compost"); return; }
    keys[e.code] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
});


function setCatcherMode(mode) {
  currentMode = mode;

  const catcher = document.getElementById("catcher");
  catcher.classList.remove("trash", "recycle", "compost");
  catcher.classList.add(mode);

  document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById("btn-" + mode).classList.add("active");
}


function updateHUD() {
  document.getElementById("score-display").textContent = "Score: " + score;
  document.getElementById("hi-display").textContent    = "Best: "  + hiScore;
}


function startGame() {
  if (gameRunning) return;
  gameRunning  = true;
  score        = 0;
  strikes      = 0;
  catchCount   = 0;
  fallingSpeed = BASE_SPEED;

  updateHUD();

  document.getElementById("start-screen").style.display    = "none";
  document.getElementById("gameover-screen").classList.remove("show");

  const catcher = document.getElementById("catcher");
  catcher.style.visibility = "visible";
  setCatcherMode("trash");   

  spawnObject();
  startLoops();
}

function endGame() {
  gameRunning = false;
  clearInterval(gameLoop);
  clearInterval(moveLoop);
  gameLoop  = null;
  moveLoop  = null;

  if (activeObj) { activeObj.remove(); activeObj = null; }

  document.getElementById("catcher").style.visibility = "hidden";

  const goScreen = document.getElementById("gameover-screen");
  goScreen.classList.add("show");

  document.getElementById("go-message").textContent = " Game Over!";
  document.getElementById("go-score").textContent   =
    "You scored " + score + (score > 0 && score === hiScore ? " — new best!" : "");
}


function startLoops() {
  moveLoop = setInterval(() => {
    if (!gameRunning) return;
    const pane    = document.getElementById("pane");
    const maxLeft = pane.clientWidth - CATCHER_W;

    if (keys["ArrowLeft"]  || keys["KeyA"]) catcherLeft = Math.max(0,       catcherLeft - MOVE_STEP);
    if (keys["ArrowRight"] || keys["KeyD"]) catcherLeft = Math.min(maxLeft, catcherLeft + MOVE_STEP);

    document.getElementById("catcher").style.left = catcherLeft + "px";
  }, 16);

  gameLoop = setInterval(() => {
    if (!gameRunning || !activeObj) return;

    const pane    = document.getElementById("pane");
    const catcher = document.getElementById("catcher");

    let y = activeObj.offsetTop + fallingSpeed;
    activeObj.style.top = y + "px";

    if (isColliding(activeObj, catcher)) {
      resolveCollision(true);
      return;
    }

    if (y > pane.clientHeight) {
      resolveCollision(false);
    }
  }, 16);
}

function spawnObject() {
  if (activeObj) { activeObj.remove(); activeObj = null; }

  const pane = document.getElementById("pane");
  const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];

  const obj = document.createElement("div");
  obj.className = "falling-object";
  obj.style.backgroundImage = `url('${item.img}')`;
  obj.dataset.type = item.type;

  const maxX = pane.clientWidth - 52;
  obj.style.left = Math.floor(Math.random() * maxX) + "px";
  obj.style.top  = "-60px";

  pane.appendChild(obj);
  activeObj = obj;
}
function isColliding(a, b) {
  const ra = a.getBoundingClientRect();
  const rb = b.getBoundingClientRect();
  return ra.left < rb.right && ra.right > rb.left &&
         ra.top  < rb.bottom && ra.bottom > rb.top;
}

function resolveCollision(caught) {
  const correct = caught && activeObj.dataset.type === currentMode;
  const missed  = !caught;

  if (!correct) {
    strikes++;
    triggerMiss();

    if (strikes >= MAX_STRIKES) {
      if (activeObj) { activeObj.remove(); activeObj = null; }
      updateHUD();
      setTimeout(endGame, 400);
      return;
    }
  }

  if (correct) {
    score++;
    catchCount++;

    if (catchCount % 5 === 0) {
      fallingSpeed = Math.min(fallingSpeed + SPEED_STEP, MAX_SPEED);
    }

    if (score > hiScore) {
      hiScore = score;
      localStorage.setItem("hiScore", String(hiScore));
    }

    spawnParticles();
    showScorePop();
  }

  updateHUD();

  if (activeObj) { activeObj.remove(); activeObj = null; }

  setTimeout(() => {
    if (gameRunning) spawnObject();
  }, 300);
}


function triggerMiss() {
  const pane = document.getElementById("pane");

  pane.classList.remove("shake", "miss-flash");
  void pane.offsetWidth; 
  pane.classList.add("shake", "miss-flash");

  setTimeout(() => pane.classList.remove("shake", "miss-flash"), 450);
}

function spawnParticles() {
  if (!activeObj) return;
  const pane  = document.getElementById("pane");
  const pRect = pane.getBoundingClientRect();
  const oRect = activeObj.getBoundingClientRect();
  const cx    = oRect.left - pRect.left + oRect.width  / 2;
  const cy    = oRect.top  - pRect.top  + oRect.height / 2;

  const colors = ["#ffb3d1", "#b3d9ff", "#b3ffcc", "#fff4b3", "#e0b3ff"];

  for (let i = 0; i < 7; i++) {
    const p     = document.createElement("div");
    p.className = "particle";
    const size  = 6 + Math.random() * 7;
    p.style.width  = size + "px";
    p.style.height = size + "px";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = cx + "px";
    p.style.top  = cy + "px";

    const angle = (i / 7) * Math.PI * 2;
    const dist  = 25 + Math.random() * 35;
    p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    p.style.animationDuration = "0.5s";

    pane.appendChild(p);
    setTimeout(() => p.remove(), 550);
  }
}


function showScorePop() {
  if (!activeObj) return;
  const pane  = document.getElementById("pane");
  const pRect = pane.getBoundingClientRect();
  const oRect = activeObj.getBoundingClientRect();

  const pop     = document.createElement("div");
  pop.className = "score-pop";
  pop.textContent = "+1";
  pop.style.color = "#c060a0";
  pop.style.left  = (oRect.left - pRect.left + 10) + "px";
  pop.style.top   = (oRect.top  - pRect.top)       + "px";

  pane.appendChild(pop);
  setTimeout(() => pop.remove(), 750);
}