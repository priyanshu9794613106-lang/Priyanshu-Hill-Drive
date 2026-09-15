
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const hud = document.getElementById("hud");
const controls = document.getElementById("controls");

let gameRunning = false;
let gameOver = false;
let animationId;

let distance = 0;
let coins = 0;
let fuel = 100;
let bestScore = Number(localStorage.getItem("hillBestScore")) || 0;

let speed = 0;
let carX = 180;
let carY = 0;
let cameraX = 0;

let gasPressed = false;
let brakePressed = false;

let terrain = [];
let coinItems = [];
let fuelItems = [];

const gravity = 0.45;
const maxSpeed = 8;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Create hill terrain
function createTerrain() {
  terrain = [];

  for (let x = 0; x < 5000; x += 20) {
    const y =
      canvas.height * 0.68 +
      Math.sin(x * 0.008) * 55 +
      Math.sin(x * 0.021) * 25 +
      Math.sin(x * 0.003) * 35;

    terrain.push({ x, y });
  }
}

// Create coins and fuel pickups
function createItems() {
  coinItems = [];
  fuelItems = [];

  for (let i = 0; i < 60; i++) {
    const x = 300 + i * 75 + Math.random() * 40;
    const ground = getGroundY(x);

    coinItems.push({
      x,
      y: ground - 55 - Math.random() * 20,
      collected: false
    });
  }

  for (let i = 0; i < 12; i++) {
    const x = 500 + i * 400;
    const ground = getGroundY(x);

    fuelItems.push({
      x,
      y: ground - 55,
      collected: false
    });
  }
}

function getGroundY(x) {
  const index = Math.floor(x / 20);

  if (!terrain[index]) {
    return canvas.height * 0.68;
  }

  return terrain[index].y;
}

function resetGame() {
  distance = 0;
  coins = 0;
  fuel = 100;
  speed = 0;
  carX = 180;
  cameraX = 0;
  gameOver = false;

  createTerrain();
  createItems();

  updateHUD();
}

function startGame() {
  resetGame();

  menu.style.display = "none";
  hud.style.display = "flex";
  controls.style.display = "flex";

  gameRunning = true;

  cancelAnimationFrame(animationId);
  gameLoop();
}

function endGame() {
  gameRunning = false;
  gameOver = true;

  cancelAnimationFrame(animationId);

  if (distance > bestScore) {
    bestScore = Math.floor(distance);
    localStorage.setItem("hillBestScore", bestScore);
  }

  menu.innerHTML = `
    <h1>GAME OVER</h1>
    <p>Distance: ${Math.floor(distance)} m</p>
    <p>Coins: ${coins}</p>
    <p>Best Score: ${bestScore} m</p>
    <button id="restartBtn">Restart Game</button>
  `;

  menu.style.display = "flex";

  document.getElementById("restartBtn").addEventListener("click", startGame);
}

function updateHUD() {
  const distanceEl = document.getElementById("distance");
  const coinsEl = document.getElementById("coins");
  const fuelEl = document.getElementById("fuel");

  if (distanceEl) {
    distanceEl.textContent = `Distance: ${Math.floor(distance)} m`;
  }

  if (coinsEl) {
    coinsEl.textContent = `Coins: ${coins}`;
  }

  if (fuelEl) {
    fuelEl.textContent = `Fuel: ${Math.floor(fuel)}%`;
  }
}

function updateGame() {
  if (!gameRunning) return;

  // Gas and brake
  if (gasPressed) {
    speed += 0.12;
  } else {
    speed -= 0.03;
  }

  if (brakePressed) {
    speed -= 0.18;
  }

  speed = Math.max(0, Math.min(speed, maxSpeed));

  // Move car
  carX += speed;

  // Camera follows car
  cameraX = Math.max(0, carX - canvas.width * 0.3);

  // Distance
  distance = carX / 10;

  // Fuel decreases
  fuel -= speed * 0.003;

  if (fuel <= 0) {
    fuel = 0;
    endGame();
    return;
  }

  // Collect coins
  coinItems.forEach((coin) => {
    if (!coin.collected && Math.abs(coin.x - carX) < 35) {
      coin.collected = true;
      coins++;
    }
  });

  // Collect fuel
  fuelItems.forEach((item) => {
    if (!item.collected && Math.abs(item.x - carX) < 35) {
      item.collected = true;
      fuel = Math.min(100, fuel + 25);
    }
  });

  // End when terrain finishes
  if (carX > 4900) {
    endGame();
    return;
  }

  updateHUD();
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

  gradient.addColorStop(0, "#4facfe");
  gradient.addColorStop(1, "#dff6ff");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
  ctx.fillStyle = "#FFD54F";
  ctx.beginPath();
  ctx.arc(canvas.width - 100, 100, 45, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountains() {
  ctx.fillStyle = "#8BC34A";

  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.65);

  for (let x = 0; x <= canvas.width; x += 80) {
    const y =
      canvas.height * 0.55 +
      Math.sin((x + cameraX * 0.2) * 0.01) * 60;

    ctx.lineTo(x, y);
  }

  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();
}

function drawTerrain() {
  ctx.fillStyle = "#6B4F2A";

  ctx.beginPath();

  for (let i = 0; i < terrain.length; i++) {
    const point = terrain[i];
    const screenX = point.x - cameraX;

    if (i === 0) {
      ctx.moveTo(screenX, point.y);
    } else {
      ctx.lineTo(screenX, point.y);
    }
  }

  ctx.lineTo(5000 - cameraX, canvas.height);
  ctx.lineTo(-cameraX, canvas.height);
  ctx.closePath();
  ctx.fill();

  // Grass
  ctx.strokeStyle = "#43A047";
  ctx.lineWidth = 8;

  ctx.beginPath();

  terrain.forEach((point, index) => {
    const screenX = point.x - cameraX;

    if (index === 0) {
      ctx.moveTo(screenX, point.y);
    } else {
      ctx.lineTo(screenX, point.y);
    }
  });

  ctx.stroke();
}

function drawCoins() {
  coinItems.forEach((coin) => {
    if (coin.collected) return;

    const x = coin.x - cameraX;

    if (x < -30 || x > canvas.width + 30) return;

    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(x, coin.y, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#8B6508";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("$", x, coin.y + 4);
  });
}

function drawFuel() {
  fuelItems.forEach((item) => {
    if (item.collected) return;

    const x = item.x - cameraX;

    if (x < -30 || x > canvas.width + 30) return;

    ctx.fillStyle = "#E53935";
    ctx.fillRect(x - 12, item.y - 18, 24, 30);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("F", x, item.y + 4);
  });
}

function drawCar() {
  const groundY = getGroundY(carX);

  carY = groundY - 55;

  const x = carX - cameraX;
  const y = carY;

  // Car body
  ctx.fillStyle = "#E53935";
  ctx.fillRect(x - 35, y - 25, 70, 25);

  // Roof
  ctx.fillStyle = "#C62828";
  ctx.beginPath();
  ctx.moveTo(x - 20, y - 25);
  ctx.lineTo(x - 8, y - 45);
  ctx.lineTo(x + 20, y - 45);
  ctx.lineTo(x + 32, y - 25);
  ctx.closePath();
  ctx.fill();

  // Windows
  ctx.fillStyle = "#90CAF9";
  ctx.fillRect(x - 5, y - 40, 20, 12);

  // Wheels
  ctx.fillStyle = "#222";

  ctx.beginPath();
  ctx.arc(x - 22, y, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 22, y, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#BDBDBD";

  ctx.beginPath();
  ctx.arc(x - 22, y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 22, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawGame() {
  drawSky();
  drawSun();
  drawMountains();
  drawTerrain();
  drawCoins();
  drawFuel();
  drawCar();
}

function gameLoop() {
  if (!gameRunning) return;

  updateGame();
  drawGame();

  animationId = requestAnimationFrame(gameLoop);
}

// Keyboard controls
window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    gasPressed = true;
  }

  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    brakePressed = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    gasPressed = false;
  }

  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    brakePressed = false;
  }
});

// Mobile buttons
const gasBtn = document.getElementById("gasBtn");
const brakeBtn = document.getElementById("brakeBtn");

if (gasBtn) {
  gasBtn.addEventListener("pointerdown", () => {
    gasPressed = true;
  });

  gasBtn.addEventListener("pointerup", () => {
    gasPressed = false;
  });

  gasBtn.addEventListener("pointerleave", () => {
    gasPressed = false;
  });
}

if (brakeBtn) {
  brakeBtn.addEventListener("pointerdown", () => {
    brakePressed = true;
  });

  brakeBtn.addEventListener("pointerup", () => {
    brakePressed = false;
  });

  brakeBtn.addEventListener("pointerleave", () => {
    brakePressed = false;
  });
}

if (startBtn) {
  startBtn.addEventListener("click", startGame);
}

createTerrain();
createItems();
