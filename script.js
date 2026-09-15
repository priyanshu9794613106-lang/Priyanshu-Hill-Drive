/* =========================================================
   PRIYANSHU HILL DRIVE
   STEP 6 - GARAGE + VEHICLE UPGRADE SYSTEM
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");

const hud = document.getElementById("hud");
const distanceEl = document.getElementById("distance");
const coinsEl = document.getElementById("coins");
const fuelEl = document.getElementById("fuel");
const livesEl = document.getElementById("lives");

const menuBestScore = document.getElementById("menuBestScore");
const menuCoins = document.getElementById("menuCoins");

const countdownEl = document.getElementById("countdown");

const controls = document.getElementById("controls");
const gasBtn = document.getElementById("gasBtn");
const brakeBtn = document.getElementById("brakeBtn");

const pauseBtn = document.getElementById("pauseBtn");
const soundBtn = document.getElementById("soundBtn");

const pauseScreen = document.getElementById("pauseScreen");
const resumeBtn = document.getElementById("resumeBtn");
const quitBtn = document.getElementById("quitBtn");


/* =========================================================
   CANVAS
========================================================= */

let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


/* =========================================================
   VEHICLES
========================================================= */

const vehicles = {

    car: {
        name: "RED RACER",
        emoji: "🚗",
        price: 0,
        acceleration: 0.19,
        maxSpeed: 9.5,
        fuelUsage: 0.018,
        grip: 0.035,
        width: 82,
        height: 38
    },

    suv: {
        name: "BLUE SUV",
        emoji: "🚙",
        price: 50,
        acceleration: 0.24,
        maxSpeed: 9.0,
        fuelUsage: 0.015,
        grip: 0.045,
        width: 88,
        height: 42
    },

    bike: {
        name: "HILL BIKE",
        emoji: "🏍️",
        price: 100,
        acceleration: 0.28,
        maxSpeed: 12,
        fuelUsage: 0.012,
        grip: 0.025,
        width: 62,
        height: 34
    }

};


let selectedVehicle =
    localStorage.getItem("phd_selectedVehicle") || "car";


let unlockedVehicles =
    JSON.parse(
        localStorage.getItem("phd_unlockedVehicles") ||
        '["car"]'
    );


/* =========================================================
   GARAGE UPGRADES
========================================================= */

let upgrades =
    JSON.parse(
        localStorage.getItem("phd_upgrades") ||
        JSON.stringify({
            engine: 1,
            tire: 1,
            fuel: 1,
            speed: 1
        })
    );


function saveUpgrades() {

    localStorage.setItem(
        "phd_upgrades",
        JSON.stringify(upgrades)
    );

}


/* =========================================================
   COINS / SCORE
========================================================= */

let totalCoins =
    Number(
        localStorage.getItem("phd_totalCoins") || 0
    );


let bestDistance =
    Number(
        localStorage.getItem("phd_bestDistance") || 0
    );


menuCoins.textContent = totalCoins;
menuBestScore.textContent = bestDistance;


/* =========================================================
   SOUND
========================================================= */

let soundEnabled =
    localStorage.getItem("phd_sound") !== "false";


let audioCtx = null;
let engineOscillator = null;
let engineGain = null;


function initAudio() {

    if (!soundEnabled) return;

    if (!audioCtx) {

        audioCtx =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

}


function playTone(
    frequency = 500,
    duration = 0.08,
    type = "sine",
    volume = 0.05
) {

    if (!soundEnabled) return;

    initAudio();

    if (!audioCtx) return;

    const oscillator =
        audioCtx.createOscillator();

    const gain =
        audioCtx.createGain();

    oscillator.type = type;

    oscillator.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        volume,
        audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.start();

    oscillator.stop(
        audioCtx.currentTime + duration
    );
}


function startEngineSound() {

    if (!soundEnabled) return;

    initAudio();

    if (!audioCtx || engineOscillator) return;

    engineOscillator =
        audioCtx.createOscillator();

    engineGain =
        audioCtx.createGain();

    engineOscillator.type = "sawtooth";

    engineOscillator.frequency.value = 70;

    engineGain.gain.value = 0.018;

    engineOscillator.connect(engineGain);

    engineGain.connect(audioCtx.destination);

    engineOscillator.start();

}


function updateEngineSound() {

    if (
        !engineOscillator ||
        !audioCtx ||
        !soundEnabled
    ) return;

    const targetFrequency =
        60 + Math.abs(speed) * 18;

    engineOscillator.frequency.linearRampToValueAtTime(
        targetFrequency,
        audioCtx.currentTime + 0.08
    );

}


function stopEngineSound() {

    if (engineOscillator) {

        try {
            engineOscillator.stop();
        } catch (e) {}

        engineOscillator = null;
        engineGain = null;
    }

}


/* =========================================================
   SOUND BUTTON
========================================================= */

function updateSoundButton() {

    soundBtn.textContent =
        soundEnabled ? "🔊" : "🔇";

}

updateSoundButton();


soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    localStorage.setItem(
        "phd_sound",
        soundEnabled
    );

    updateSoundButton();

    if (soundEnabled) {

        initAudio();

        if (running) {
            startEngineSound();
        }

    } else {

        stopEngineSound();

    }

});


/* =========================================================
   GAME STATE
========================================================= */

let running = false;
let paused = false;
let gameOver = false;
let countdownRunning = false;

let distance = 0;
let runCoins = 0;
let fuel = 100;
let lives = 3;

let speed = 0;
let carX = 220;
let carY = 300;

let carVelocityY = 0;
let carAngle = 0;

let cameraX = 0;

let gasPressed = false;
let brakePressed = false;

let lastTime = 0;

let worldTime = 0;

let terrain = [];
let coins = [];
let fuelItems = [];
let obstacles = [];


/* =========================================================
   UPGRADE FUNCTIONS
========================================================= */

const upgradeNames = [
    "engine",
    "tire",
    "fuel",
    "speed"
];


const baseUpgradeCost = 20;


function getUpgradeCost(type) {

    const level = upgrades[type];

    return baseUpgradeCost * level;

}


function updateGarageUI() {

    const types = upgradeNames;

    types.forEach(type => {

        const level =
            Math.min(
                5,
                Number(upgrades[type]) || 1
            );

        const levelEl =
            document.getElementById(
                type === "tire"
                    ? "tireLevel"
                    : type + "Level"
            );

        const progressEl =
            document.getElementById(
                type === "tire"
                    ? "tireProgress"
                    : type + "Progress"
            );

        const button =
            document.getElementById(
                type === "tire"
                    ? "tireUpgrade"
                    : type + "Upgrade"
            );

        if (levelEl) {
            levelEl.textContent = level;
        }

        if (progressEl) {

            progressEl.style.width =
                (level / 5 * 100) + "%";

        }

        if (button) {

            if (level >= 5) {

                button.textContent = "MAX";

                button.classList.add("maxed");

                button.disabled = true;

            } else {

                button.innerHTML =
                    `🪙 <span>${getUpgradeCost(type)}</span>`;

                button.classList.remove("maxed");

                button.disabled = false;

            }

        }

    });


    const garageLevel =
        Math.max(
            upgrades.engine,
            upgrades.tire,
            upgrades.fuel,
            upgrades.speed
        );

    document.getElementById(
        "garageLevel"
    ).textContent = garageLevel;

}


function purchaseUpgrade(type) {

    if (upgrades[type] >= 5) {
        return;
    }

    const cost =
        getUpgradeCost(type);

    if (totalCoins < cost) {

        playTone(
            180,
            0.12,
            "square",
            0.04
        );

        alert(
            `Not enough coins!\n\nYou need ${cost} coins.`
        );

        return;
    }


    totalCoins -= cost;

    upgrades[type]++;

    localStorage.setItem(
        "phd_totalCoins",
        totalCoins
    );

    saveUpgrades();

    menuCoins.textContent =
        totalCoins;

    updateGarageUI();

    playTone(
        800,
        0.08,
        "triangle",
        0.06
    );

    setTimeout(() => {

        playTone(
            1100,
            0.12,
            "triangle",
            0.05
        );

    }, 90);

}


document
    .getElementById("engineUpgrade")
    .addEventListener(
        "click",
        () => purchaseUpgrade("engine")
    );


document
    .getElementById("tireUpgrade")
    .addEventListener(
        "click",
        () => purchaseUpgrade("tire")
    );


document
    .getElementById("fuelUpgrade")
    .addEventListener(
        "click",
        () => purchaseUpgrade("fuel")
    );


document
    .getElementById("speedUpgrade")
    .addEventListener(
        "click",
        () => purchaseUpgrade("speed")
    );


updateGarageUI();


/* =========================================================
   VEHICLE SELECTION
========================================================= */

function updateVehicleUI() {

    document
        .querySelectorAll(".vehicle-card")
        .forEach(card => {

            const type =
                card.dataset.vehicle;

            const status =
                card.querySelector(
                    ".vehicle-status"
                );

            const unlocked =
                unlockedVehicles.includes(type);

            card.classList.toggle(
                "selected",
                type === selectedVehicle
            );

            card.classList.toggle(
                "locked",
                !unlocked
            );

            if (!unlocked) {

                status.textContent =
                    `🔒 ${vehicles[type].price} COINS`;

            } else if (
                type === selectedVehicle
            ) {

                status.textContent =
                    "SELECTED";

            } else {

                status.textContent =
                    "SELECT";

            }

        });

}


document
    .querySelectorAll(".vehicle-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const type =
                    card.dataset.vehicle;

                const vehicle =
                    vehicles[type];


                if (
                    !unlockedVehicles.includes(type)
                ) {

                    if (
                        totalCoins < vehicle.price
                    ) {

                        playTone(
                            180,
                            0.1,
                            "square"
                        );

                        alert(
                            `You need ${vehicle.price} coins to unlock ${vehicle.name}.`
                        );

                        return;
                    }


                    const confirmUnlock =
                        confirm(
                            `Unlock ${vehicle.name} for ${vehicle.price} coins?`
                        );

                    if (!confirmUnlock) {
                        return;
                    }


                    totalCoins -=
                        vehicle.price;


                    unlockedVehicles.push(type);


                    localStorage.setItem(
                        "phd_totalCoins",
                        totalCoins
                    );


                    localStorage.setItem(
                        "phd_unlockedVehicles",
                        JSON.stringify(
                            unlockedVehicles
                        )
                    );


                    menuCoins.textContent =
                        totalCoins;


                    playTone(
                        900,
                        0.08,
                        "triangle"
                    );

                }


                selectedVehicle = type;


                localStorage.setItem(
                    "phd_selectedVehicle",
                    selectedVehicle
                );


                updateVehicleUI();

            }
        );

    });


updateVehicleUI();


/* =========================================================
   TERRAIN
========================================================= */

function generateTerrain() {

    terrain = [];

    const step = 70;

    let y = H * 0.68;

    let slope = 0;


    for (
        let x = -500;
        x < 30000;
        x += step
    ) {

        slope +=
            (Math.random() - 0.5) * 0.22;

        slope *= 0.92;

        slope =
            Math.max(
                -0.65,
                Math.min(
                    0.65,
                    slope
                )
            );

        y += slope * 15;

        y +=
            Math.sin(x * 0.006) * 2;

        y =
            Math.max(
                H * 0.42,
                Math.min(
                    H * 0.82,
                    y
                )
            );


        terrain.push({
            x,
            y
        });

    }

}


function getGroundY(x) {

    if (!terrain.length) {
        return H * 0.68;
    }


    if (
        x <= terrain[0].x
    ) {
        return terrain[0].y;
    }


    for (
        let i = 0;
        i < terrain.length - 1;
        i++
    ) {

        const a = terrain[i];
        const b = terrain[i + 1];


        if (
            x >= a.x &&
            x <= b.x
        ) {

            const t =
                (x - a.x) /
                (b.x - a.x);


            return (
                a.y +
                (b.y - a.y) * t
            );

        }

    }


    return terrain[
        terrain.length - 1
    ].y;

}


function getGroundAngle(x) {

    const delta = 5;

    const y1 =
        getGroundY(x - delta);

    const y2 =
        getGroundY(x + delta);

    return Math.atan2(
        y2 - y1,
        delta * 2
    );

}


/* =========================================================
   ITEMS
========================================================= */

function generateItems() {

    coins = [];
    fuelItems = [];
    obstacles = [];


    for (
        let x = 650;
        x < 28000;
        x +=
            350 +
            Math.random() * 500
    ) {

        coins.push({

            x:
                x +
                Math.random() * 150,

            y:
                getGroundY(x) - 65,

            radius: 13,

            collected: false,

            rotation:
                Math.random() * Math.PI * 2

        });

    }


    for (
        let x = 1200;
        x < 28000;
        x +=
            900 +
            Math.random() * 800
    ) {

        fuelItems.push({

            x:
                x +
                Math.random() * 250,

            y:
                getGroundY(x) - 58,

            radius: 16,

            collected: false

        });

    }


    for (
        let x = 900;
        x < 28000;
        x +=
            600 +
            Math.random() * 850
    ) {

        obstacles.push({

            x:
                x +
                Math.random() * 250,

            y:
                getGroundY(x) - 18,

            width:
                25 +
                Math.random() * 22,

            height:
                20 +
                Math.random() * 18,

            hit: false

        });

    }

}


/* =========================================================
   START GAME
========================================================= */

startBtn.addEventListener(
    "click",
    startGame
);


function startGame() {

    initAudio();

    distance = 0;
    runCoins = 0;

    fuel =
        100 +
        (upgrades.fuel - 1) * 20;

    lives = 3;

    speed = 0;

    carVelocityY = 0;

    carX = 220;

    cameraX = 0;

    carY =
        getGroundY(carX) - 45;

    carAngle =
        getGroundAngle(carX);

    paused = false;
    gameOver = false;
    running = true;

    generateTerrain();
    generateItems();

    menu.style.display = "none";

    hud.style.display = "flex";

    controls.style.display = "flex";

    pauseScreen.style.display = "none";

    distanceEl.textContent = "0";

    coinsEl.textContent = "0";

    fuelEl.textContent =
        Math.round(fuel);

    livesEl.textContent = lives;

    startCountdown();

}


/* =========================================================
   COUNTDOWN
========================================================= */

function startCountdown() {

    countdownRunning = true;

    countdownEl.style.display =
        "flex";


    const numbers = [
        "3",
        "2",
        "1",
        "GO!"
    ];


    let index = 0;


    function showNext() {

        if (!running) {
            countdownRunning = false;
            countdownEl.style.display = "none";
            return;
        }


        countdownEl.textContent =
            numbers[index];


        playTone(
            index === 3 ? 900 : 500,
            0.1,
            "square",
            0.05
        );


        index++;


        if (
            index >= numbers.length
        ) {

            setTimeout(() => {

                countdownEl.style.display =
                    "none";

                countdownRunning = false;

                startEngineSound();

            }, 550);

            return;

        }


        setTimeout(
            showNext,
            700
        );

    }


    showNext();

}


/* =========================================================
   INPUT
========================================================= */

window.addEventListener(
    "keydown",
    e => {

        if (
            e.code === "ArrowRight" ||
            e.code === "KeyD"
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
            e.code === "KeyP" ||
            e.code === "Escape"
        ) {

            togglePause();

        }

    }
);


window.addEventListener(
    "keyup",
    e => {

        if (
            e.code === "ArrowRight" ||
            e.code === "KeyD"
        ) {

            gasPressed = false;

        }


        if (
            e.code === "ArrowLeft" ||
            e.code === "KeyA"
        ) {

            brakePressed = false;

        }

    }
);


/* =========================================================
   MOBILE BUTTONS
========================================================= */

function setupHoldButton(
    button,
    setter
) {

    const start = e => {

        e.preventDefault();

        setter(true);

    };


    const end = e => {

        e.preventDefault();

        setter(false);

    };


    button.addEventListener(
        "pointerdown",
        start
    );

    button.addEventListener(
        "pointerup",
        end
    );

    button.addEventListener(
        "pointercancel",
        end
    );

    button.addEventListener(
        "pointerleave",
        end
    );

}


setupHoldButton(
    gasBtn,
    value => {
        gasPressed = value;
    }
);


setupHoldButton(
    brakeBtn,
    value => {
        brakePressed = value;
    }
);


/* =========================================================
   PAUSE
========================================================= */

pauseBtn.addEventListener(
    "click",
    togglePause
);


resumeBtn.addEventListener(
    "click",
    () => {

        paused = false;

        pauseScreen.style.display =
            "none";

        startEngineSound();

    }
);


quitBtn.addEventListener(
    "click",
    () => {

        running = false;

        paused = false;

        stopEngineSound();

        pauseScreen.style.display =
            "none";

        hud.style.display = "none";

        controls.style.display = "none";

        menu.style.display = "flex";

        updateMenuStats();

    }
);


function togglePause() {

    if (
        !running ||
        gameOver ||
        countdownRunning
    ) {
        return;
    }


    paused = !paused;


    if (paused) {

        pauseScreen.style.display =
            "flex";

        stopEngineSound();

    } else {

        pauseScreen.style.display =
            "none";

        startEngineSound();

    }

}


/* =========================================================
   PHYSICS
========================================================= */

function updatePhysics(dt) {

    const vehicle =
        vehicles[selectedVehicle];


    /* UPGRADE EFFECTS */

    const enginePower =
        1 +
        (upgrades.engine - 1) * 0.16;


    const speedPower =
        1 +
        (upgrades.speed - 1) * 0.13;


    const tireGrip =
        vehicle.grip +
        (upgrades.tire - 1) * 0.012;


    const maxSpeed =
        vehicle.maxSpeed *
        speedPower;


    const acceleration =
        vehicle.acceleration *
        enginePower;


    /* GAS */

    if (
        gasPressed &&
        fuel > 0
    ) {

        speed +=
            acceleration *
            dt;

        fuel -=
            vehicle.fuelUsage *
            dt *
            (1 -
                (upgrades.fuel - 1)
                * 0.025
            );

    } else {

        speed *=
            Math.pow(
                0.985,
                dt
            );

    }


    /* BRAKE */

    if (brakePressed) {

        speed -=
            0.32 * dt;

    }


    /* LIMIT */

    speed =
        Math.max(
            -3,
            Math.min(
                maxSpeed,
                speed
            )
        );


    /* GRAVITY */

    carVelocityY +=
        0.45 * dt;


    carY +=
        carVelocityY *
        dt;


    /* MOVE */

    carX +=
        speed *
        dt *
        2.2;


    /* GROUND */

    const groundY =
        getGroundY(
            carX
        );


    const targetY =
        groundY -
        vehicle.height;


    if (
        carY >= targetY
    ) {

        carY = targetY;

        carVelocityY = 0;

    }


    /* TERRAIN ANGLE */

    const targetAngle =
        getGroundAngle(
            carX
        );


    carAngle +=
        (
            targetAngle -
            carAngle
        ) *
        tireGrip *
        dt *
        3;


    /* CAMERA */

    const targetCamera =
        carX -
        W * 0.30;


    cameraX +=
        (
            targetCamera -
            cameraX
        ) *
        0.08;


    cameraX =
        Math.max(
            0,
            cameraX
        );


    /* DISTANCE */

    distance =
        Math.max(
            0,
            Math.floor(
                carX / 10
            )
        );


    /* FUEL */

    fuel =
        Math.max(
            0,
            fuel
        );


    /* HUD */

    distanceEl.textContent =
        distance;

    coinsEl.textContent =
        runCoins;

    fuelEl.textContent =
        Math.round(
            fuel /
            (
                100 +
                (upgrades.fuel - 1) * 20
            ) *
            100
        );

    livesEl.textContent =
        lives;


    checkItems();

    checkObstacles();


    if (
        fuel <= 0
    ) {

        speed *= 0.97;

        if (
            Math.abs(speed) < 0.04
        ) {

            endGame();

        }

    }


    updateEngineSound();

}


/* =========================================================
   ITEM COLLISION
========================================================= */

function checkItems() {

    const vehicle =
        vehicles[selectedVehicle];


    coins.forEach(coin => {

        if (coin.collected) {
            return;
        }


        const dx =
            carX -
            coin.x;


        const dy =
            carY -
            coin.y;


        const distanceBetween =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distanceBetween < 50
        ) {

            coin.collected = true;

            runCoins++;

            totalCoins++;

            localStorage.setItem(
                "phd_totalCoins",
                totalCoins
            );

            menuCoins.textContent =
                totalCoins;

            playTone(
                900,
                0.07,
                "triangle",
                0.06
            );

            setTimeout(
                () => playTone(
                    1300,
                    0.08,
                    "triangle",
                    0.05
                ),
                60
            );

        }

    });


    fuelItems.forEach(item => {

        if (item.collected) {
            return;
        }


        const dx =
            carX -
            item.x;


        const dy =
            carY -
            item.y;


        const d =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (d < 55) {

            item.collected = true;

            fuel = Math.min(
                100 +
                (upgrades.fuel - 1) * 20,

                fuel + 35
            );


            playTone(
                600,
                0.1,
                "sine",
                0.05
            );

        }

    });

}


/* =========================================================
   OBSTACLES
========================================================= */

function checkObstacles() {

    const vehicle =
        vehicles[selectedVehicle];


    obstacles.forEach(
        obstacle => {

            if (obstacle.hit) {
                return;
            }


            const dx =
                Math.abs(
                    carX -
                    obstacle.x
                );


            const dy =
                Math.abs(
                    carY -
                    obstacle.y
                );


            if (
                dx <
                vehicle.width * 0.45 +
                obstacle.width * 0.45
                &&
                dy <
                vehicle.height * 0.55 +
                obstacle.height * 0.55
            ) {

                obstacle.hit = true;

                crash();

            }

        }
    );

}


/* =========================================================
   CRASH
========================================================= */

function crash() {

    lives--;

    playTone(
        100,
        0.18,
        "sawtooth",
        0.08
    );


    speed *= 0.3;

    carVelocityY =
        -6;


    if (lives <= 0) {

        setTimeout(
            endGame,
            500
        );

    }

}


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    if (gameOver) {
        return;
    }

    gameOver = true;
    running = false;

    gasPressed = false;
    brakePressed = false;

    stopEngineSound();

    if (
        distance > bestDistance
    ) {

        bestDistance =
            distance;

        localStorage.setItem(
            "phd_bestDistance",
            bestDistance
        );

    }


    localStorage.setItem(
        "phd_totalCoins",
        totalCoins
    );


    setTimeout(
        showGameOver,
        400
    );

}


function showGameOver() {

    hud.style.display = "none";

    controls.style.display = "none";

    countdownEl.style.display = "none";

    pauseScreen.style.display = "none";


    menu.style.display = "flex";


    const card =
        document.querySelector(
            ".menu-card"
        );


    card.innerHTML = `

        <div class="game-icon">
            🏁
        </div>

        <h1>
            GAME OVER
        </h1>

        <h2>
            PRIYANSHU HILL DRIVE
        </h2>

        <div class="top-stats">

            <div class="stat-box">
                📏 Distance
                <strong>
                    ${distance} m
                </strong>
            </div>

            <div class="stat-box">
                🪙 Run Coins
                <strong>
                    ${runCoins}
                </strong>
            </div>

        </div>

        <div class="best-box">
            🏆 Best Distance:
            <span>
                ${bestDistance}
            </span>
            m
        </div>

        <div class="menu-coins">
            🪙 Total Coins:
            <strong>
                ${totalCoins}
            </strong>
        </div>

        <button
            id="restartBtn"
            style="
                width:100%;
                padding:15px;
                margin-top:20px;
                border:none;
                border-radius:15px;
                background:
                    linear-gradient(
                        135deg,
                        #00c853,
                        #64dd17
                    );
                color:white;
                font-size:18px;
                font-weight:900;
                cursor:pointer;
            "
        >
            🔄 PLAY AGAIN
        </button>

        <button
            id="menuBtn"
            style="
                width:100%;
                padding:13px;
                margin-top:10px;
                border:none;
                border-radius:15px;
                background:
                    rgba(255,255,255,0.12);
                color:white;
                font-size:15px;
                font-weight:800;
                cursor:pointer;
            "
        >
            🏠 GARAGE
        </button>

    `;


    document
        .getElementById(
            "restartBtn"
        )
        .addEventListener(
            "click",
            () => {

                restoreMainMenu();

                startGame();

            }
        );


    document
        .getElementById(
            "menuBtn"
        )
        .addEventListener(
            "click",
            restoreMainMenu
        );

}


/* =========================================================
   RESTORE MENU
========================================================= */

function restoreMainMenu() {

    location.reload();

}


/* =========================================================
   DRAW SKY
========================================================= */

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
        "#42a5f5"
    );

    gradient.addColorStop(
        0.55,
        "#81d4fa"
    );

    gradient.addColorStop(
        1,
        "#e1f5fe"
    );


    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* SUN */

    ctx.beginPath();

    ctx.arc(
        W * 0.82,
        H * 0.16,
        48,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#fff176";

    ctx.fill();


    /* CLOUDS */

    drawCloud(
        W * 0.18 -
        cameraX * 0.08,
        H * 0.18,
        1
    );

    drawCloud(
        W * 0.58 -
        cameraX * 0.05,
        H * 0.25,
        0.8
    );

    drawCloud(
        W * 0.90 -
        cameraX * 0.04,
        H * 0.12,
        0.7
    );

}


function drawCloud(
    x,
    y,
    scale
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.scale(
        scale,
        scale
    );

    ctx.fillStyle =
        "rgba(255,255,255,0.72)";


    ctx.beginPath();

    ctx.arc(
        0,
        10,
        20,
        0,
        Math.PI * 2
    );

    ctx.arc(
        25,
        0,
        28,
        0,
        Math.PI * 2
    );

    ctx.arc(
        55,
        10,
        20,
        0,
        Math.PI * 2
    );

    ctx.fillRect(
        0,
        10,
        55,
        20
    );

    ctx.fill();

    ctx.restore();

}


/* =========================================================
   MOUNTAINS
========================================================= */

function drawMountains() {

    ctx.save();

    ctx.translate(
        -cameraX * 0.12,
        0
    );


    ctx.fillStyle =
        "#78909c";


    ctx.beginPath();

    ctx.moveTo(
        -500,
        H * 0.62
    );


    for (
        let x = -500;
        x < W + cameraX + 1000;
        x += 180
    ) {

        const peak =
            H * 0.35 +
            Math.sin(
                x * 0.01
            ) * 55;


        ctx.lineTo(
            x,
            peak
        );

        ctx.lineTo(
            x + 90,
            H * 0.62
        );

    }


    ctx.lineTo(
        W + cameraX + 1000,
        H
    );

    ctx.lineTo(
        -500,
        H
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();

}


/* =========================================================
   TERRAIN DRAW
========================================================= */

function drawTerrain() {

    if (!terrain.length) {
        return;
    }


    ctx.save();

    ctx.translate(
        -cameraX,
        0
    );


    ctx.beginPath();

    ctx.moveTo(
        terrain[0].x,
        terrain[0].y
    );


    for (
        const point of terrain
    ) {

        ctx.lineTo(
            point.x,
            point.y
        );

    }


    ctx.lineTo(
        terrain[terrain.length - 1].x,
        H
    );

    ctx.lineTo(
        terrain[0].x,
        H
    );

    ctx.closePath();


    const groundGradient =
        ctx.createLinearGradient(
            0,
            H * 0.45,
            0,
            H
        );


    groundGradient.addColorStop(
        0,
        "#4caf50"
    );

    groundGradient.addColorStop(
        0.12,
        "#795548"
    );

    groundGradient.addColorStop(
        1,
        "#4e342e"
    );


    ctx.fillStyle =
        groundGradient;

    ctx.fill();


    /* GRASS LINE */

    ctx.beginPath();

    for (
        let i = 0;
        i < terrain.length;
        i++
    ) {

        const point =
            terrain[i];

        if (i === 0) {

            ctx.moveTo(
                point.x,
                point.y
            );

        } else {

            ctx.lineTo(
                point.x,
                point.y
            );

        }

    }


    ctx.strokeStyle =
        "#2e7d32";

    ctx.lineWidth = 8;

    ctx.stroke();


    ctx.restore();

}


/* =========================================================
   COINS DRAW
========================================================= */

function drawCoins() {

    ctx.save();

    ctx.translate(
        -cameraX,
        0
    );


    coins.forEach(
        coin => {

            if (coin.collected) {
                return;
            }


            coin.rotation +=
                0.04;


            ctx.save();

            ctx.translate(
                coin.x,
                coin.y
            );


            const scale =
                Math.abs(
                    Math.cos(
                        coin.rotation
                    )
                );


            ctx.scale(
                Math.max(
                    0.25,
                    scale
                ),
                1
            );


            ctx.beginPath();

            ctx.arc(
                0,
                0,
                coin.radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#ffd600";

            ctx.fill();


            ctx.strokeStyle =
                "#ff8f00";

            ctx.lineWidth = 3;

            ctx.stroke();


            ctx.fillStyle =
                "#fff8e1";

            ctx.font =
                "bold 12px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                "$",
                0,
                1
            );


            ctx.restore();

        }
    );


    ctx.restore();

}


/* =========================================================
   FUEL DRAW
========================================================= */

function drawFuelItems() {

    ctx.save();

    ctx.translate(
        -cameraX,
        0
    );


    fuelItems.forEach(
        item => {

            if (item.collected) {
                return;
            }


            ctx.save();

            ctx.translate(
                item.x,
                item.y
            );


            ctx.fillStyle =
                "#f44336";


            ctx.fillRect(
                -12,
                -17,
                24,
                32
            );


            ctx.fillStyle =
                "white";

            ctx.font =
                "bold 16px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                "F",
                0,
                5
            );


            ctx.restore();

        }
    );


    ctx.restore();

}


/* =========================================================
   OBSTACLES DRAW
========================================================= */

function drawObstacles() {

    ctx.save();

    ctx.translate(
        -cameraX,
        0
    );


    obstacles.forEach(
        obstacle => {

            if (obstacle.hit) {
                return;
            }


            ctx.save();

            ctx.translate(
                obstacle.x,
                obstacle.y
            );


            ctx.fillStyle =
                "#37474f";


            ctx.beginPath();

            ctx.moveTo(
                -obstacle.width / 2,
                0
            );

            ctx.lineTo(
                -obstacle.width * 0.25,
                -obstacle.height
            );

            ctx.lineTo(
                obstacle.width * 0.2,
                -obstacle.height * 0.8
            );

            ctx.lineTo(
                obstacle.width / 2,
                0
            );

            ctx.closePath();

            ctx.fill();


            ctx.restore();

        }
    );


    ctx.restore();

}


/* =========================================================
   CAR DRAW
========================================================= */

function drawCar() {

    const vehicle =
        vehicles[selectedVehicle];


    ctx.save();


    ctx.translate(
        carX - cameraX,
        carY
    );


    ctx.rotate(
        carAngle
    );


    /* SHADOW */

    ctx.fillStyle =
        "rgba(0,0,0,0.22)";


    ctx.beginPath();

    ctx.ellipse(
        0,
        24,
        vehicle.width * 0.5,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* VEHICLE */

    let bodyColor =
        "#e53935";


    if (
        selectedVehicle === "suv"
    ) {

        bodyColor =
            "#1565c0";

    }


    if (
        selectedVehicle === "bike"
    ) {

        bodyColor =
            "#212121";

    }


    if (
        selectedVehicle === "bike"
    ) {

        drawBike(
            bodyColor
        );

    } else {

        drawCarBody(
            bodyColor,
            vehicle
        );

    }


    ctx.restore();

}


function drawCarBody(
    bodyColor,
    vehicle
) {

    /* BODY */

    ctx.fillStyle =
        bodyColor;


    ctx.beginPath();

    ctx.roundRect(
        -vehicle.width / 2,
        -vehicle.height,
        vehicle.width,
        vehicle.height * 0.62,
        9
    );

    ctx.fill();


    /* ROOF */

    ctx.beginPath();

    ctx.moveTo(
        -vehicle.width * 0.28,
        -vehicle.height
    );

    ctx.lineTo(
        -vehicle.width * 0.12,
        -vehicle.height * 1.38
    );

    ctx.lineTo(
        vehicle.width * 0.22,
        -vehicle.height * 1.38
    );

    ctx.lineTo(
        vehicle.width * 0.38,
        -vehicle.height
    );

    ctx.closePath();

    ctx.fill();


    /* WINDOWS */

    ctx.fillStyle =
        "#263238";


    ctx.beginPath();

    ctx.moveTo(
        -vehicle.width * 0.08,
        -vehicle.height * 1.31
    );

    ctx.lineTo(
        vehicle.width * 0.18,
        -vehicle.height * 1.31
    );

    ctx.lineTo(
        vehicle.width * 0.29,
        -vehicle.height * 1.04
    );

    ctx.lineTo(
        -vehicle.width * 0.04,
        -vehicle.height * 1.04
    );

    ctx.closePath();

    ctx.fill();


    /* WHEELS */

    drawWheel(
        -vehicle.width * 0.32,
        1
    );

    drawWheel(
        vehicle.width * 0.32,
        1
    );

}


function drawWheel(
    x,
    y
) {

    ctx.fillStyle =
        "#212121";


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        11,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#bdbdbd";


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


function drawBike(
    bodyColor
) {

    ctx.strokeStyle =
        "#212121";

    ctx.lineWidth = 5;


    ctx.beginPath();

    ctx.arc(
        -19,
        0,
        10,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.arc(
        19,
        0,
        10,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.strokeStyle =
        bodyColor;

    ctx.lineWidth = 7;


    ctx.beginPath();

    ctx.moveTo(
        -19,
        0
    );

    ctx.lineTo(
        -5,
        -20
    );

    ctx.lineTo(
        19,
        0
    );

    ctx.lineTo(
        5,
        -6
    );

    ctx.lineTo(
        -19,
        0
    );

    ctx.stroke();


    ctx.fillStyle =
        "#e53935";


    ctx.beginPath();

    ctx.arc(
        4,
        -27,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =========================================================
   LIVES DRAW
========================================================= */

function drawLivesOnCanvas() {

    if (!running) {
        return;
    }


    ctx.save();

    ctx.font =
        "bold 18px Arial";

    ctx.fillStyle =
        "white";

    ctx.fillText(
        "LIVES",
        20,
        H - 95
    );


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        ctx.globalAlpha =
            i < lives ? 1 : 0.25;

        ctx.font =
            "22px Arial";

        ctx.fillText(
            "❤️",
            20 + i * 27,
            H - 65
        );

    }


    ctx.restore();

}


/* =========================================================
   MAIN DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    drawSky();

    drawMountains();

    drawTerrain();

    drawCoins();

    drawFuelItems();

    drawObstacles();

    drawCar();

    drawLivesOnCanvas();

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (!lastTime) {
        lastTime = timestamp;
    }


    let dt =
        (timestamp - lastTime) /
        16.67;


    lastTime = timestamp;


    dt =
        Math.min(
            dt,
            2.5
        );


    if (
        running &&
        !paused &&
        !countdownRunning &&
        !gameOver
    ) {

        worldTime += dt;

        updatePhysics(dt);

    }


    draw();


    requestAnimationFrame(
        gameLoop
    );

}


requestAnimationFrame(
    gameLoop
);


/* =========================================================
   INITIAL MENU
========================================================= */

function updateMenuStats() {

    menuCoins.textContent =
        totalCoins;

    menuBestScore.textContent =
        bestDistance;

    updateGarageUI();

    updateVehicleUI();

}


updateMenuStats();
