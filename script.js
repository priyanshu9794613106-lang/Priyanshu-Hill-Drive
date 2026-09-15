// ==========================================
// PRIYANSHU HILL DRIVE - STEP 3
// Fuel + Coins + Obstacles + Damage System
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");

const hud = document.getElementById("hud");
const distanceText = document.getElementById("distance");
const coinsText = document.getElementById("coins");
const fuelText = document.getElementById("fuel");

const controls = document.getElementById("controls");
const gasBtn = document.getElementById("gasBtn");
const brakeBtn = document.getElementById("brakeBtn");

const menuBestScore = document.getElementById("menuBestScore");

// ==========================================
// CANVAS
// ==========================================

let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ==========================================
// GAME STATE
// ==========================================

let gameRunning = false;
let gameOver = false;

let distance = 0;
let coins = 0;
let fuel = 100;
let lives = 3;

let speed = 0;
let cameraX = 0;

let gasPressed = false;
let brakePressed = false;

let lastTime = 0;

// ==========================================
// BEST SCORE
// ==========================================

let bestDistance =
    Number(localStorage.getItem("priyanshuHillBest")) || 0;

if (menuBestScore) {
    menuBestScore.textContent = bestDistance;
}

// ==========================================
// TERRAIN
// ==========================================

const terrain = [];

function generateTerrain() {

    terrain.length = 0;

    for (let x = 0; x < 12000; x += 20) {

        const y =
            H * 0.68
            + Math.sin(x * 0.004) * 65
            + Math.sin(x * 0.009) * 25
            + Math.sin(x * 0.018) * 12;

        terrain.push({
            x: x,
            y: y
        });
    }
}

generateTerrain();

function getGroundY(worldX) {

    if (worldX < 0) {
        return H * 0.68;
    }

    let index = Math.floor(worldX / 20);

    if (index < 0) index = 0;

    if (index >= terrain.length - 1) {
        index = terrain.length - 2;
    }

    const p1 = terrain[index];
    const p2 = terrain[index + 1];

    const ratio =
        (worldX - p1.x) / (p2.x - p1.x);

    return p1.y + (p2.y - p1.y) * ratio;
}

function getGroundAngle(worldX) {

    const y1 = getGroundY(worldX - 10);
    const y2 = getGroundY(worldX + 10);

    return Math.atan2(y2 - y1, 20);
}

// ==========================================
// CAR
// ==========================================

const car = {
    x: 180,
    y: 0,

    width: 85,
    height: 42,

    vx: 0,
    vy: 0,

    angle: 0,

    wheelRotation: 0,

    onGround: false,

    bounce: 0,

    invincible: false,
    invincibleTimer: 0
};

// ==========================================
// OBJECTS
// ==========================================

let coinItems = [];
let fuelItems = [];
let obstacles = [];

function createObjects() {

    coinItems = [];
    fuelItems = [];
    obstacles = [];

    // Coins
    for (let x = 450; x < 12000; x += 350) {

        coinItems.push({
            x: x + Math.random() * 120,
            yOffset: -55 - Math.random() * 30,
            collected: false,
            rotation: Math.random() * Math.PI * 2
        });
    }

    // Fuel
    for (let x = 900; x < 12000; x += 1100) {

        fuelItems.push({
            x: x + Math.random() * 250,
            collected: false
        });
    }

    // Rocks / obstacles
    for (let x = 700; x < 12000; x += 500) {

        obstacles.push({
            x: x + Math.random() * 250,
            size: 18 + Math.random() * 12,
            hit: false
        });
    }
}

// ==========================================
// RESET GAME
// ==========================================

function resetGame() {

    distance = 0;
    coins = 0;
    fuel = 100;
    lives = 3;

    speed = 0;
    cameraX = 0;

    car.x = 180;

    car.y =
        getGroundY(car.x) -
        car.height -
        20;

    car.vx = 0;
    car.vy = 0;

    car.angle = 0;
    car.wheelRotation = 0;

    car.onGround = false;

    car.bounce = 0;

    car.invincible = false;
    car.invincibleTimer = 0;

    createObjects();

    updateHUD();
}

// ==========================================
// START GAME
// ==========================================

function startGame() {

    resetGame();

    gameRunning = true;
    gameOver = false;

    menu.style.display = "none";

    hud.style.display = "flex";
    controls.style.display = "flex";

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", startGame);

// ==========================================
// INPUT
// ==========================================

window.addEventListener("keydown", (e) => {

    if (
        e.code === "ArrowRight" ||
        e.code === "KeyD" ||
        e.code === "Space"
    ) {
        gasPressed = true;
    }

    if (
        e.code === "ArrowLeft" ||
        e.code === "KeyA"
    ) {
        brakePressed = true;
    }

    if (
        (e.code === "Enter" || e.code === "Space") &&
        gameOver
    ) {
        startGame();
    }
});

window.addEventListener("keyup", (e) => {

    if (
        e.code === "ArrowRight" ||
        e.code === "KeyD" ||
        e.code === "Space"
    ) {
        gasPressed = false;
    }

    if (
        e.code === "ArrowLeft" ||
        e.code === "KeyA"
    ) {
        brakePressed = false;
    }
});

// ==========================================
// MOBILE BUTTONS
// ==========================================

function pressButton(button, action) {

    button.addEventListener("pointerdown", (e) => {

        e.preventDefault();

        action(true);
    });

    button.addEventListener("pointerup", (e) => {

        e.preventDefault();

        action(false);
    });

    button.addEventListener("pointercancel", () => {
        action(false);
    });

    button.addEventListener("pointerleave", () => {
        action(false);
    });
}

pressButton(gasBtn, (value) => {
    gasPressed = value;
});

pressButton(brakeBtn, (value) => {
    brakePressed = value;
});

// ==========================================
// PHYSICS
// ==========================================

function updatePhysics(dt) {

    const gravity = 1450;

    // --------------------------------------
    // ENGINE
    // --------------------------------------

    if (gasPressed && fuel > 0) {

        car.vx += 520 * dt;

        fuel -= 7 * dt;
    }

    // --------------------------------------
    // BRAKE
    // --------------------------------------

    if (brakePressed) {

        car.vx -= 650 * dt;
    }

    // --------------------------------------
    // NATURAL FRICTION
    // --------------------------------------

    car.vx *= Math.pow(0.985, dt * 60);

    // --------------------------------------
    // MAX SPEED
    // --------------------------------------

    const maxSpeed =
        520 + Math.min(distance * 0.4, 300);

    if (car.vx > maxSpeed) {
        car.vx = maxSpeed;
    }

    if (car.vx < -180) {
        car.vx = -180;
    }

    // --------------------------------------
    // GRAVITY
    // --------------------------------------

    car.vy += gravity * dt;

    car.x += car.vx * dt;
    car.y += car.vy * dt;

    // --------------------------------------
    // TERRAIN COLLISION
    // --------------------------------------

    const groundY =
        getGroundY(car.x);

    const targetY =
        groundY -
        car.height -
        15;

    if (car.y >= targetY) {

        car.y = targetY;

        if (car.vy > 250) {

            car.bounce = Math.min(
                car.vy / 1200,
                0.7
            );
        }

        car.vy = -car.bounce * 500;

        car.bounce *= 0.4;

        car.onGround = true;

    } else {

        car.onGround = false;
    }

    // --------------------------------------
    // CAR ANGLE
    // --------------------------------------

    const groundAngle =
        getGroundAngle(car.x);

    car.angle +=
        (groundAngle - car.angle) *
        Math.min(dt * 9, 1);

    // --------------------------------------
    // WHEEL ROTATION
    // --------------------------------------

    car.wheelRotation +=
        car.vx * dt * 0.05;

    // --------------------------------------
    // CAMERA
    // --------------------------------------

    const targetCamera =
        car.x - W * 0.28;

    cameraX +=
        (targetCamera - cameraX) *
        Math.min(dt * 4, 1);

    if (cameraX < 0) {
        cameraX = 0;
    }

    // --------------------------------------
    // DISTANCE
    // --------------------------------------

    distance =
        Math.max(
            distance,
            Math.floor((car.x - 180) / 10)
        );

    // --------------------------------------
    // INVINCIBILITY
    // --------------------------------------

    if (car.invincible) {

        car.invincibleTimer -= dt;

        if (car.invincibleTimer <= 0) {

            car.invincible = false;
        }
    }

    // --------------------------------------
    // FUEL EMPTY
    // --------------------------------------

    if (fuel <= 0) {

        fuel = 0;

        car.vx *= 0.985;

        if (Math.abs(car.vx) < 10) {

            endGame();
        }
    }

    checkCoins();
    checkFuel();
    checkObstacles();

    updateHUD();
}

// ==========================================
// COIN COLLISION
// ==========================================

function checkCoins() {

    for (const coin of coinItems) {

        if (coin.collected) {
            continue;
        }

        const coinY =
            getGroundY(coin.x) +
            coin.yOffset;

        const dx =
            Math.abs(car.x - coin.x);

        const dy =
            Math.abs(
                (car.y + car.height / 2) -
                coinY
            );

        if (dx < 50 && dy < 60) {

            coin.collected = true;

            coins += 1;
        }
    }
}

// ==========================================
// FUEL COLLISION
// ==========================================

function checkFuel() {

    for (const item of fuelItems) {

        if (item.collected) {
            continue;
        }

        const fuelY =
            getGroundY(item.x) - 55;

        const dx =
            Math.abs(car.x - item.x);

        const dy =
            Math.abs(
                car.y - fuelY
            );

        if (dx < 55 && dy < 65) {

            item.collected = true;

            fuel += 30;

            if (fuel > 100) {
                fuel = 100;
            }
        }
    }
}

// ==========================================
// OBSTACLE COLLISION
// ==========================================

function checkObstacles() {

    for (const rock of obstacles) {

        if (rock.hit) {
            continue;
        }

        const rockY =
            getGroundY(rock.x) -
            rock.size;

        const dx =
            Math.abs(car.x - rock.x);

        const dy =
            Math.abs(
                car.y + car.height -
                rockY
            );

        if (
            dx < 50 &&
            dy < 45 &&
            !car.invincible
        ) {

            rock.hit = true;

            crash();
        }
    }
}

// ==========================================
// CRASH
// ==========================================

function crash() {

    lives--;

    car.invincible = true;
    car.invincibleTimer = 2;

    car.vx *= 0.45;

    car.vy = -450;

    car.bounce = 0.7;

    if (lives <= 0) {

        setTimeout(() => {
            endGame();
        }, 700);
    }
}

// ==========================================
// HUD
// ==========================================

function updateHUD() {

    distanceText.textContent =
        Math.max(0, distance);

    coinsText.textContent =
        coins;

    fuelText.textContent =
        Math.max(0, Math.floor(fuel));

    // Fuel warning
    if (fuelText) {

        if (fuel < 20) {

            fuelText.style.color = "#ff5252";

        } else {

            fuelText.style.color = "";
        }
    }
}

// ==========================================
// SKY
// ==========================================

function drawSky() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        "#66c7ff"
    );

    gradient.addColorStop(
        1,
        "#dff6ff"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    // Sun

    ctx.beginPath();

    ctx.arc(
        W - 100,
        90,
        45,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(255,220,90,0.95)";

    ctx.fill();
}

// ==========================================
// CLOUDS
// ==========================================

function drawCloud(x, y, scale = 1) {

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(scale, scale);

    ctx.fillStyle =
        "rgba(255,255,255,0.85)";

    ctx.beginPath();

    ctx.arc(0, 10, 25, 0, Math.PI * 2);

    ctx.arc(30, 0, 32, 0, Math.PI * 2);

    ctx.arc(65, 12, 25, 0, Math.PI * 2);

    ctx.fill();

    ctx.restore();
}

function drawClouds() {

    drawCloud(
        120 - cameraX * 0.08,
        100,
        1
    );

    drawCloud(
        500 - cameraX * 0.05,
        170,
        0.8
    );

    drawCloud(
        850 - cameraX * 0.04,
        80,
        1.1
    );
}

// ==========================================
// MOUNTAINS
// ==========================================

function drawMountains() {

    ctx.fillStyle =
        "rgba(80,120,150,0.45)";

    ctx.beginPath();

    ctx.moveTo(0, H * 0.62);

    for (
        let x = -100;
        x <= W + 100;
        x += 100
    ) {

        const worldX =
            x + cameraX * 0.15;

        const y =
            H * 0.55 +
            Math.sin(worldX * 0.004) * 55;

        ctx.lineTo(
            x,
            y
        );
    }

    ctx.lineTo(W, H);

    ctx.lineTo(0, H);

    ctx.closePath();

    ctx.fill();
}

// ==========================================
// TERRAIN DRAW
// ==========================================

function drawTerrain() {

    ctx.beginPath();

    ctx.moveTo(
        -20,
        H
    );

    for (
        let x = -20;
        x <= W + 20;
        x += 20
    ) {

        const worldX =
            x + cameraX;

        const y =
            getGroundY(worldX);

        ctx.lineTo(
            x,
            y
        );
    }

    ctx.lineTo(
        W + 20,
        H
    );

    ctx.closePath();

    ctx.fillStyle =
        "#5c4033";

    ctx.fill();

    // Grass

    ctx.beginPath();

    for (
        let x = -20;
        x <= W + 20;
        x += 20
    ) {

        const worldX =
            x + cameraX;

        const y =
            getGroundY(worldX);

        if (x === -20) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.strokeStyle =
        "#43a047";

    ctx.lineWidth = 12;

    ctx.stroke();
}

// ==========================================
// COINS
// ==========================================

function drawCoins() {

    for (const coin of coinItems) {

        if (coin.collected) {
            continue;
        }

        const screenX =
            coin.x - cameraX;

        if (
            screenX < -50 ||
            screenX > W + 50
        ) {
            continue;
        }

        const y =
            getGroundY(coin.x) +
            coin.yOffset;

        coin.rotation += 0.05;

        const scale =
            Math.abs(
                Math.sin(coin.rotation)
            ) * 0.7 + 0.3;

        ctx.save();

        ctx.translate(
            screenX,
            y
        );

        ctx.scale(
            scale,
            1
        );

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            13,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffd700";

        ctx.fill();

        ctx.strokeStyle =
            "#c58c00";

        ctx.lineWidth = 3;

        ctx.stroke();

        ctx.restore();
    }
}

// ==========================================
// FUEL ITEMS
// ==========================================

function drawFuelItems() {

    for (const item of fuelItems) {

        if (item.collected) {
            continue;
        }

        const screenX =
            item.x - cameraX;

        if (
            screenX < -80 ||
            screenX > W + 80
        ) {
            continue;
        }

        const y =
            getGroundY(item.x) - 50;

        ctx.save();

        ctx.translate(
            screenX,
            y
        );

        // Tank

        ctx.fillStyle =
            "#e53935";

        ctx.fillRect(
            -16,
            -20,
            32,
            40
        );

        // Top

        ctx.fillStyle =
            "#263238";

        ctx.fillRect(
            -8,
            -27,
            16,
            8
        );

        // F

        ctx.fillStyle =
            "white";

        ctx.font =
            "bold 20px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "F",
            0,
            8
        );

        ctx.restore();
    }
}

// ==========================================
// OBSTACLES
// ==========================================

function drawObstacles() {

    for (const rock of obstacles) {

        if (rock.hit) {
            continue;
        }

        const screenX =
            rock.x - cameraX;

        if (
            screenX < -60 ||
            screenX > W + 60
        ) {
            continue;
        }

        const y =
            getGroundY(rock.x);

        ctx.save();

        ctx.translate(
            screenX,
            y
        );

        ctx.fillStyle =
            "#4e342e";

        ctx.beginPath();

        ctx.moveTo(
            -rock.size,
            0
        );

        ctx.lineTo(
            -rock.size * 0.5,
            -rock.size
        );

        ctx.lineTo(
            rock.size * 0.6,
            -rock.size * 1.1
        );

        ctx.lineTo(
            rock.size,
            0
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }
}

// ==========================================
// CAR DRAW
// ==========================================

function drawCar() {

    const screenX =
        car.x - cameraX;

    const screenY =
        car.y;

    ctx.save();

    ctx.translate(
        screenX,
        screenY
    );

    ctx.rotate(
        car.angle
    );

    // Damage flash
    if (
        car.invincible &&
        Math.floor(
            performance.now() / 120
        ) % 2 === 0
    ) {

        ctx.globalAlpha = 0.35;
    }

    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.25)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        car.height + 15,
        48,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Car body

    ctx.fillStyle =
        "#e53935";

    ctx.beginPath();

    ctx.roundRect(
        -42,
        -30,
        84,
        35,
        10
    );

    ctx.fill();

    // Hood

    ctx.fillStyle =
        "#c62828";

    ctx.fillRect(
        25,
        -25,
        22,
        12
    );

    // Cabin

    ctx.fillStyle =
        "#263238";

    ctx.beginPath();

    ctx.moveTo(
        -22,
        -30
    );

    ctx.lineTo(
        -5,
        -50
    );

    ctx.lineTo(
        22,
        -50
    );

    ctx.lineTo(
        35,
        -30
    );

    ctx.closePath();

    ctx.fill();

    // Windows

    ctx.fillStyle =
        "#90caf9";

    ctx.beginPath();

    ctx.moveTo(
        -14,
        -31
    );

    ctx.lineTo(
        -3,
        -44
    );

    ctx.lineTo(
        8,
        -44
    );

    ctx.lineTo(
        15,
        -31
    );

    ctx.closePath();

    ctx.fill();

    // Rear window

    ctx.fillStyle =
        "#64b5f6";

    ctx.beginPath();

    ctx.moveTo(
        10,
        -44
    );

    ctx.lineTo(
        21,
        -31
    );

    ctx.lineTo(
        29,
        -31
    );

    ctx.lineTo(
        19,
        -44
    );

    ctx.closePath();

    ctx.fill();

    // Wheels

    drawWheel(
        -27,
        5
    );

    drawWheel(
        27,
        5
    );

    ctx.restore();
}

// ==========================================
// WHEEL
// ==========================================

function drawWheel(x, y) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.rotate(
        car.wheelRotation
    );

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        14,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#151515";

    ctx.fill();

    ctx.strokeStyle =
        "#555";

    ctx.lineWidth = 3;

    ctx.stroke();

    // Spokes

    ctx.strokeStyle =
        "#bbb";

    ctx.lineWidth = 2;

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const a =
            i * Math.PI / 2;

        ctx.beginPath();

        ctx.moveTo(
            0,
            0
        );

        ctx.lineTo(
            Math.cos(a) * 9,
            Math.sin(a) * 9
        );

        ctx.stroke();
    }

    ctx.restore();
}

// ==========================================
// DRAW LIVES
// ==========================================

function drawLives() {

    ctx.save();

    ctx.font =
        "bold 24px Arial";

    ctx.textAlign =
        "left";

    ctx.fillStyle =
        "white";

    ctx.fillText(
        "❤️".repeat(lives),
        20,
        115
    );

    ctx.restore();
}

// ==========================================
// GAME DRAW
// ==========================================

function drawGame() {

    drawSky();

    drawClouds();

    drawMountains();

    drawTerrain();

    drawCoins();

    drawFuelItems();

    drawObstacles();

    drawCar();

    drawLives();
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(time) {

    if (!gameRunning) {
        return;
    }

    let dt =
        (time - lastTime) / 1000;

    lastTime = time;

    // Prevent huge physics jumps
    dt = Math.min(
        dt,
        0.033
    );

    updatePhysics(dt);

    drawGame();

    requestAnimationFrame(gameLoop);
}

// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;
    gameOver = true;

    if (distance > bestDistance) {

        bestDistance = distance;

        localStorage.setItem(
            "priyanshuHillBest",
            bestDistance
        );
    }

    hud.style.display = "none";
    controls.style.display = "none";

    showGameOverScreen();
}

// ==========================================
// GAME OVER SCREEN
// ==========================================

function showGameOverScreen() {

    menu.style.display = "flex";

    const card =
        menu.querySelector(".menu-card");

    if (!card) {
        return;
    }

    card.innerHTML = `

        <div class="game-icon">💥</div>

        <h1>GAME OVER</h1>

        <h2>PRIYANSHU</h2>

        <p class="developer">
            Great driving! Keep going 🚗
        </p>

        <div class="best-box">
            📏 Distance:
            <span>${distance}</span> m
            <br><br>
            🪙 Coins:
            <span>${coins}</span>
            <br><br>
            🏆 Best:
            <span>${bestDistance}</span> m
        </div>

        <button id="startBtn">
            🔄 PLAY AGAIN
        </button>

        <p class="instruction">
            ⌨️ Arrow Keys / D = GAS<br>
            ⬅️ Arrow Left / A = BRAKE
        </p>
    `;

    document
        .getElementById("startBtn")
        .addEventListener(
            "click",
            startGame
        );
}

// ==========================================
// INITIAL SCREEN
// ==========================================

updateHUD();
