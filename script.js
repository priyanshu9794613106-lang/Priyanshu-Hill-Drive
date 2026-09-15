/* =========================================================
   PRIYANSHU HILL DRIVE
   STEP 10
   LEVEL + CHECKPOINT SYSTEM
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


/* ================= ELEMENTS ================= */

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");

const hud = document.getElementById("hud");

const distanceEl = document.getElementById("distance");
const coinsEl = document.getElementById("coins");
const fuelEl = document.getElementById("fuel");
const livesEl = document.getElementById("lives");

const currentLevelEl =
    document.getElementById("currentLevel");

const checkpointEl =
    document.getElementById("checkpoint");

const menuCoins =
    document.getElementById("menuCoins");

const menuBestScore =
    document.getElementById("menuBestScore");

const menuLevel =
    document.getElementById("menuLevel");

const levelText =
    document.getElementById("levelText");

const menuCheckpoint =
    document.getElementById("menuCheckpoint");

const countdownEl =
    document.getElementById("countdown");

const controls =
    document.getElementById("controls");

const gasBtn =
    document.getElementById("gasBtn");

const brakeBtn =
    document.getElementById("brakeBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const soundBtn =
    document.getElementById("soundBtn");

const pauseScreen =
    document.getElementById("pauseScreen");

const resumeBtn =
    document.getElementById("resumeBtn");

const quitBtn =
    document.getElementById("quitBtn");

const levelComplete =
    document.getElementById("levelComplete");

const checkpointMessage =
    document.getElementById("checkpointMessage");

const continueBtn =
    document.getElementById("continueBtn");


/* ================= CANVAS ================= */

let W = innerWidth;
let H = innerHeight;

function resizeCanvas() {

    W = innerWidth;
    H = innerHeight;

    const dpr =
        Math.min(devicePixelRatio || 1, 2);

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


/* ================= VEHICLES ================= */

const vehicles = {

    car: {
        name: "RED RACER",
        price: 0,
        acceleration: .19,
        maxSpeed: 9.5,
        fuelUsage: .018,
        grip: .035,
        width: 82,
        height: 38
    },

    suv: {
        name: "BLUE SUV",
        price: 50,
        acceleration: .24,
        maxSpeed: 9,
        fuelUsage: .015,
        grip: .045,
        width: 88,
        height: 42
    },

    bike: {
        name: "HILL BIKE",
        price: 100,
        acceleration: .28,
        maxSpeed: 12,
        fuelUsage: .012,
        grip: .025,
        width: 62,
        height: 34
    }

};


let selectedVehicle =
    localStorage.getItem(
        "phd_selectedVehicle"
    ) || "car";


let unlockedVehicles =
    JSON.parse(
        localStorage.getItem(
            "phd_unlockedVehicles"
        ) || '["car"]'
    );


/* ================= UPGRADES ================= */

let upgrades =
    JSON.parse(
        localStorage.getItem(
            "phd_upgrades"
        ) ||
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


/* ================= SAVED DATA ================= */

let totalCoins =
    Number(
        localStorage.getItem(
            "phd_totalCoins"
        ) || 0
    );


let bestDistance =
    Number(
        localStorage.getItem(
            "phd_bestDistance"
        ) || 0
    );


let highestLevel =
    Number(
        localStorage.getItem(
            "phd_highestLevel"
        ) || 1
    );


/* ================= GAME STATE ================= */

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

let currentLevel = highestLevel;

let checkpoints = 0;

let nextCheckpoint = 500;

let checkpointBonus = 25;

let lastTime = 0;

let terrain = [];
let coins = [];
let fuelItems = [];
let obstacles = [];


/* ================= AUDIO ================= */

let soundEnabled =
    localStorage.getItem(
        "phd_sound"
    ) !== "false";


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

    if (
        audioCtx.state === "suspended"
    ) {

        audioCtx.resume();

    }

}


function playTone(
    frequency,
    duration = .1,
    type = "sine",
    volume = .05
) {

    if (!soundEnabled) return;

    initAudio();

    if (!audioCtx) return;

    const osc =
        audioCtx.createOscillator();

    const gain =
        audioCtx.createGain();

    osc.type = type;

    osc.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        volume,
        audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        .001,
        audioCtx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();

    osc.stop(
        audioCtx.currentTime + duration
    );

}


function startEngineSound() {

    if (!soundEnabled) return;

    initAudio();

    if (
        !audioCtx ||
        engineOscillator
    ) return;

    engineOscillator =
        audioCtx.createOscillator();

    engineGain =
        audioCtx.createGain();

    engineOscillator.type =
        "sawtooth";

    engineOscillator.frequency.value =
        70;

    engineGain.gain.value =
        .015;

    engineOscillator.connect(
        engineGain
    );

    engineGain.connect(
        audioCtx.destination
    );

    engineOscillator.start();

}


function updateEngineSound() {

    if (
        !engineOscillator ||
        !audioCtx ||
        !soundEnabled
    ) return;

    engineOscillator.frequency.linearRampToValueAtTime(
        60 + Math.abs(speed) * 18,
        audioCtx.currentTime + .08
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


function updateSoundButton() {

    soundBtn.textContent =
        soundEnabled
            ? "🔊"
            : "🔇";

}


updateSoundButton();


soundBtn.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;

        localStorage.setItem(
            "phd_sound",
            soundEnabled
        );

        updateSoundButton();

        if (soundEnabled) {

            initAudio();

            if (running && !paused) {
                startEngineSound();
            }

        } else {

            stopEngineSound();

        }

    }
);


/* ================= GARAGE ================= */

function getUpgradeCost(type) {

    return 20 * upgrades[type];

}


function updateGarageUI() {

    const data = [
        ["engine","engine"],
        ["tire","tire"],
        ["fuel","fuel"],
        ["speed","speed"]
    ];

    data.forEach(
        ([type,id]) => {

            const level =
                upgrades[type];

            const levelEl =
                document.getElementById(
                    id === "tire"
                        ? "tireLevel"
                        : id + "Level"
                );

            const progressEl =
                document.getElementById(
                    id === "tire"
                        ? "tireProgress"
                        : id + "Progress"
                );

            const button =
                document.getElementById(
                    id === "tire"
                        ? "tireUpgrade"
                        : id + "Upgrade"
                );


            levelEl.textContent =
                level;

            progressEl.style.width =
                (level / 5 * 100) + "%";


            if (level >= 5) {

                button.textContent =
                    "MAX";

                button.classList.add(
                    "maxed"
                );

                button.disabled = true;

            } else {

                button.innerHTML =
                    `🪙 <span>${getUpgradeCost(type)}</span>`;

                button.classList.remove(
                    "maxed"
                );

                button.disabled = false;

            }

        }
    );


    document.getElementById(
        "garageLevel"
    ).textContent =
        Math.max(
            upgrades.engine,
            upgrades.tire,
            upgrades.fuel,
            upgrades.speed
        );

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
            .1,
            "square"
        );

        alert(
            `You need ${cost} coins.`
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

    updateMenu();

    updateGarageUI();

    playTone(
        900,
        .08,
        "triangle"
    );

}


document.getElementById(
    "engineUpgrade"
).onclick =
    () => purchaseUpgrade("engine");


document.getElementById(
    "tireUpgrade"
).onclick =
    () => purchaseUpgrade("tire");


document.getElementById(
    "fuelUpgrade"
).onclick =
    () => purchaseUpgrade("fuel");


document.getElementById(
    "speedUpgrade"
).onclick =
    () => purchaseUpgrade("speed");


/* ================= VEHICLES ================= */

function updateVehicleUI() {

    document
        .querySelectorAll(".vehicle-card")
        .forEach(card => {

            const type =
                card.dataset.vehicle;

            const unlocked =
                unlockedVehicles.includes(
                    type
                );

            const status =
                card.querySelector(
                    ".vehicle-status"
                );


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
                    !unlockedVehicles.includes(
                        type
                    )
                ) {

                    if (
                        totalCoins <
                        vehicle.price
                    ) {

                        alert(
                            `You need ${vehicle.price} coins.`
                        );

                        return;
                    }


                    if (
                        !confirm(
                            `Unlock ${vehicle.name} for ${vehicle.price} coins?`
                        )
                    ) {
                        return;
                    }


                    totalCoins -=
                        vehicle.price;

                    unlockedVehicles.push(
                        type
                    );


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

                }


                selectedVehicle =
                    type;

                localStorage.setItem(
                    "phd_selectedVehicle",
                    type
                );

                updateVehicleUI();
                updateMenu();

            }
        );

    });


/* ================= TERRAIN ================= */

function generateTerrain() {

    terrain = [];

    const step = 70;

    let y =
        H * .68;

    let slope = 0;


    const difficulty =
        1 +
        (currentLevel - 1) * .08;


    for (
        let x = -500;
        x < 35000;
        x += step
    ) {

        slope +=
            (Math.random() - .5)
            * .22
            * difficulty;

        slope *= .92;

        slope =
            Math.max(
                -.75,
                Math.min(
                    .75,
                    slope
                )
            );


        y +=
            slope * 15;


        y +=
            Math.sin(
                x * .006
            ) * 2;


        y =
            Math.max(
                H * .42,
                Math.min(
                    H * .82,
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
        return H * .68;
    }


    for (
        let i = 0;
        i < terrain.length - 1;
        i++
    ) {

        const a =
            terrain[i];

        const b =
            terrain[i + 1];


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

    const d = 5;

    return Math.atan2(
        getGroundY(x + d) -
        getGroundY(x - d),
        d * 2
    );

}


/* ================= ITEMS ================= */

function generateItems() {

    coins = [];
    fuelItems = [];
    obstacles = [];


    for (
        let x = 650;
        x < 33000;
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
                Math.random() * 6

        });

    }


    for (
        let x = 1200;
        x < 33000;
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
        x < 33000;
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


/* ================= START ================= */

startBtn.onclick =
    startGame;


function startGame() {

    initAudio();

    currentLevel =
        Math.max(
            1,
            highestLevel
        );


    distance = 0;
    runCoins = 0;

    checkpoints = 0;

    nextCheckpoint =
        500;

    fuel =
        100 +
        (upgrades.fuel - 1) * 20;

    lives = 3;

    speed = 0;

    carX = 220;

    carVelocityY = 0;

    cameraX = 0;

    generateTerrain();

    carY =
        getGroundY(carX) - 45;

    carAngle =
        getGroundAngle(carX);

    generateItems();


    running = true;
    paused = false;
    gameOver = false;


    menu.style.display =
        "none";

    hud.style.display =
        "flex";

    controls.style.display =
        "flex";

    levelComplete.style.display =
        "none";


    updateHUD();

    startCountdown();

}


/* ================= COUNTDOWN ================= */

function startCountdown() {

    countdownRunning = true;

    countdownEl.style.display =
        "flex";


    const values =
        ["3","2","1","GO!"];

    let index = 0;


    function next() {

        if (!running) {
            countdownEl.style.display =
                "none";
            countdownRunning = false;
            return;
        }


        countdownEl.textContent =
            values[index];


        playTone(
            index === 3
                ? 900
                : 500,
            .1,
            "square"
        );


        index++;


        if (
            index >= values.length
        ) {

            setTimeout(() => {

                countdownEl.style.display =
                    "none";

                countdownRunning =
                    false;

                startEngineSound();

            },500);

            return;
        }


        setTimeout(
            next,
            700
        );

    }


    next();

}


/* ================= INPUT ================= */

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


/* ================= MOBILE ================= */

function setupHoldButton(
    button,
    callback
) {

    button.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            callback(true);

        }
    );


    button.addEventListener(
        "pointerup",
        e => {

            e.preventDefault();

            callback(false);

        }
    );


    button.addEventListener(
        "pointercancel",
        () => callback(false)
    );


    button.addEventListener(
        "pointerleave",
        () => callback(false)
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


/* ================= PAUSE ================= */

pauseBtn.onclick =
    togglePause;


resumeBtn.onclick =
    () => {

        paused = false;

        pauseScreen.style.display =
            "none";

        startEngineSound();

    };


quitBtn.onclick =
    () => {

        running = false;

        paused = false;

        gasPressed = false;
        brakePressed = false;

        stopEngineSound();

        pauseScreen.style.display =
            "none";

        hud.style.display =
            "none";

        controls.style.display =
            "none";

        menu.style.display =
            "flex";

        updateMenu();

    };


function togglePause() {

    if (
        !running ||
        gameOver ||
        countdownRunning
    ) {
        return;
    }


    paused =
        !paused;


    pauseScreen.style.display =
        paused
            ? "flex"
            : "none";


    if (paused) {
        stopEngineSound();
    } else {
        startEngineSound();
    }

}


/* ================= PHYSICS ================= */

function updatePhysics(dt) {

    const vehicle =
        vehicles[selectedVehicle];


    const enginePower =
        1 +
        (upgrades.engine - 1)
        * .16;


    const speedPower =
        1 +
        (upgrades.speed - 1)
        * .13;


    const grip =
        vehicle.grip +
        (upgrades.tire - 1)
        * .012;


    const maxSpeed =
        vehicle.maxSpeed *
        speedPower;


    const acceleration =
        vehicle.acceleration *
        enginePower;


    if (
        gasPressed &&
        fuel > 0
    ) {

        speed +=
            acceleration * dt;


        fuel -=
            vehicle.fuelUsage *
            dt *
            (
                1 -
                (upgrades.fuel - 1)
                * .025
            );

    } else {

        speed *=
            Math.pow(
                .985,
                dt
            );

    }


    if (brakePressed) {

        speed -=
            .32 * dt;

    }


    speed =
        Math.max(
            -3,
            Math.min(
                maxSpeed,
                speed
            )
        );


    carVelocityY +=
        .45 * dt;


    carY +=
        carVelocityY * dt;


    carX +=
        speed *
        dt *
        2.2;


    const ground =
        getGroundY(carX);


    const targetY =
        ground -
        vehicle.height;


    if (
        carY >= targetY
    ) {

        carY = targetY;

        carVelocityY = 0;

    }


    const targetAngle =
        getGroundAngle(carX);


    carAngle +=
        (
            targetAngle -
            carAngle
        ) *
        grip *
        dt *
        3;


    const targetCamera =
        carX -
        W * .30;


    cameraX +=
        (
            targetCamera -
            cameraX
        ) * .08;


    cameraX =
        Math.max(
            0,
            cameraX
        );


    distance =
        Math.max(
            0,
            Math.floor(
                carX / 10
            )
        );


    fuel =
        Math.max(
            0,
            fuel
        );


    checkItems();

    checkObstacles();

    checkCheckpoint();

    updateHUD();


    if (
        fuel <= 0 &&
        Math.abs(speed) < .04
    ) {

        endGame();

    }


    updateEngineSound();

}


/* ================= CHECKPOINT ================= */

function checkCheckpoint() {

    if (
        distance < nextCheckpoint
    ) {
        return;
    }


    checkpoints++;


    totalCoins +=
        checkpointBonus;


    runCoins +=
        checkpointBonus;


    localStorage.setItem(
        "phd_totalCoins",
        totalCoins
    );


    playTone(
        700,
        .12,
        "triangle"
    );


    setTimeout(
        () =>
            playTone(
                1000,
                .15,
                "triangle"
            ),
        100
    );


    if (
        checkpoints >= 3
    ) {

        completeLevel();

        return;

    }


    nextCheckpoint += 500;

}


/* ================= LEVEL COMPLETE ================= */

function completeLevel() {

    running = false;

    stopEngineSound();

    currentLevel++;

    highestLevel =
        Math.max(
            highestLevel,
            currentLevel
        );


    localStorage.setItem(
        "phd_highestLevel",
        highestLevel
    );


    checkpointMessage.textContent =
        `Level ${currentLevel - 1} completed!`;


    levelComplete.style.display =
        "flex";


    updateMenu();


}


continueBtn.onclick =
    () => {

        levelComplete.style.display =
            "none";

        startNextLevel();

    };


function startNextLevel() {

    distance = 0;

    runCoins = 0;

    checkpoints = 0;

    nextCheckpoint = 500;

    fuel =
        100 +
        (upgrades.fuel - 1) * 20;

    lives = 3;

    speed = 0;

    carX = 220;

    carVelocityY = 0;

    cameraX = 0;

    generateTerrain();

    carY =
        getGroundY(carX) - 45;

    carAngle =
        getGroundAngle(carX);

    generateItems();

    running = true;

    gameOver = false;

    hud.style.display =
        "flex";

    controls.style.display =
        "flex";

    updateHUD();

    startCountdown();

}


/* ================= ITEMS ================= */

function checkItems() {

    coins.forEach(
        coin => {

            if (coin.collected) {
                return;
            }


            const dx =
                carX - coin.x;

            const dy =
                carY - coin.y;


            const d =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (d < 50) {

                coin.collected = true;

                runCoins++;

                totalCoins++;


                localStorage.setItem(
                    "phd_totalCoins",
                    totalCoins
                );


                playTone(
                    900,
                    .07,
                    "triangle"
                );

            }

        }
    );


    fuelItems.forEach(
        item => {

            if (item.collected) {
                return;
            }


            const dx =
                carX - item.x;

            const dy =
                carY - item.y;


            const d =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (d < 55) {

                item.collected = true;


                fuel =
                    Math.min(
                        100 +
                        (upgrades.fuel - 1)
                        * 20,

                        fuel + 35
                    );


                playTone(
                    600,
                    .1
                );

            }

        }
    );

}


/* ================= OBSTACLES ================= */

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
                vehicle.width * .45 +
                obstacle.width * .45
                &&
                dy <
                vehicle.height * .55 +
                obstacle.height * .55
            ) {

                obstacle.hit = true;

                crash();

            }

        }
    );

}


function crash() {

    lives--;

    speed *= .3;

    carVelocityY = -6;


    playTone(
        100,
        .18,
        "sawtooth",
        .08
    );


    if (lives <= 0) {

        setTimeout(
            endGame,
            400
        );

    }

}


/* ================= HUD ================= */

function updateHUD() {

    distanceEl.textContent =
        distance;

    coinsEl.textContent =
        runCoins;

    const maxFuel =
        100 +
        (upgrades.fuel - 1) * 20;


    fuelEl.textContent =
        Math.round(
            fuel /
            maxFuel *
            100
        );


    livesEl.textContent =
        lives;

    currentLevelEl.textContent =
        currentLevel;

    checkpointEl.textContent =
        checkpoints;

}


/* ================= END GAME ================= */

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
        distance >
        bestDistance
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
        500
    );

}


function showGameOver() {

    hud.style.display =
        "none";

    controls.style.display =
        "none";

    pauseScreen.style.display =
        "none";


    menu.style.display =
        "flex";


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
            LEVEL ${currentLevel}
        </h2>

        <div class="top-stats">

            <div class="stat-box">
                📏 DISTANCE
                <strong>
                    ${distance} m
                </strong>
            </div>

            <div class="stat-box">
                🪙 RUN COINS
                <strong>
                    ${runCoins}
                </strong>
            </div>

            <div class="stat-box">
                🗺️ LEVEL
                <strong>
                    ${currentLevel}
                </strong>
            </div>

        </div>


        <div class="level-box">

            <div>
                🏆 BEST
                <strong>
                    ${bestDistance} m
                </strong>
            </div>

            <div>
                🪙 TOTAL
                <strong>
                    ${totalCoins}
                </strong>
            </div>

        </div>


        <button
            id="restartBtn"
            style="
                width:100%;
                padding:15px;
                margin-top:18px;
                border:none;
                border-radius:14px;
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
                margin-top:9px;
                border:none;
                border-radius:14px;
                background:
                rgba(255,255,255,.12);
                color:white;
                font-size:15px;
                font-weight:900;
                cursor:pointer;
            "
        >
            🏠 GARAGE
        </button>

    `;


    document.getElementById(
        "restartBtn"
    ).onclick =
        () => {

            location.reload();

        };


    document.getElementById(
        "menuBtn"
    ).onclick =
        () => {

            location.reload();

        };

}


/* ================= MENU UPDATE ================= */

function updateMenu() {

    menuCoins.textContent =
        totalCoins;

    menuBestScore.textContent =
        bestDistance;

    menuLevel.textContent =
        highestLevel;

    levelText.textContent =
        "LEVEL " +
        highestLevel;

    menuCheckpoint.textContent =
        "0 / 3";

    updateGarageUI();

    updateVehicleUI();

}


updateMenu();


/* ================= DRAW SKY ================= */

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
        .55,
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
        W * .82,
        H * .16,
        48,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#fff176";

    ctx.fill();


    drawCloud(
        W * .18 -
        cameraX * .08,
        H * .18,
        1
    );


    drawCloud(
        W * .58 -
        cameraX * .05,
        H * .25,
        .8
    );


    drawCloud(
        W * .90 -
        cameraX * .04,
        H * .12,
        .7
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
        "rgba(255,255,255,.72)";


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


/* ================= MOUNTAINS ================= */

function drawMountains() {

    ctx.save();

    ctx.translate(
        -cameraX * .12,
        0
    );

    ctx.fillStyle =
        "#78909c";

    ctx.beginPath();

    ctx.moveTo(
        -500,
        H * .62
    );


    for (
        let x = -500;
        x < W + cameraX + 1000;
        x += 180
    ) {

        const peak =
            H * .35 +
            Math.sin(
                x * .01
            ) * 55;


        ctx.lineTo(
            x,
            peak
        );

        ctx.lineTo(
            x + 90,
            H * .62
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


/* ================= TERRAIN ================= */

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


    terrain.forEach(
        point => {

            ctx.lineTo(
                point.x,
                point.y
            );

        }
    );


    ctx.lineTo(
        terrain[
            terrain.length - 1
        ].x,
        H
    );


    ctx.lineTo(
        terrain[0].x,
        H
    );


    ctx.closePath();


    const gradient =
        ctx.createLinearGradient(
            0,
            H * .45,
            0,
            H
        );


    gradient.addColorStop(
        0,
        "#4caf50"
    );

    gradient.addColorStop(
        .12,
        "#795548"
    );

    gradient.addColorStop(
        1,
        "#4e342e"
    );


    ctx.fillStyle =
        gradient;

    ctx.fill();


    ctx.beginPath();


    terrain.forEach(
        (point,i) => {

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
    );


    ctx.strokeStyle =
        "#2e7d32";

    ctx.lineWidth = 8;

    ctx.stroke();

    ctx.restore();

}


/* ================= CHECKPOINT MARKERS ================= */

function drawCheckpointMarkers() {

    ctx.save();

    ctx.translate(
        -cameraX,
        0
    );


    for (
        let i = 1;
        i <= 3;
        i++
    ) {

        const x =
            i * 500;


        if (
            x < cameraX - 100 ||
            x > cameraX + W + 100
        ) {
            continue;
        }


        const y =
            getGroundY(x);


        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 4;


        ctx.beginPath();

        ctx.moveTo(
            x,
            y
        );

        ctx.lineTo(
            x,
            y - 100
        );

        ctx.stroke();


        ctx.fillStyle =
            "#ff1744";


        ctx.beginPath();

        ctx.moveTo(
            x,
            y - 100
        );

        ctx.lineTo(
            x + 55,
            y - 82
        );

        ctx.lineTo(
            x,
            y - 65
        );

        ctx.closePath();

        ctx.fill();


        ctx.fillStyle =
            "white";

        ctx.font =
            "bold 12px Arial";

        ctx.fillText(
            "CP " + i,
            x + 5,
            y - 110
        );

    }


    ctx.restore();

}


/* ================= COINS ================= */

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
                .04;


            ctx.save();

            ctx.translate(
                coin.x,
                coin.y
            );


            ctx.scale(
                Math.max(
                    .25,
                    Math.abs(
                        Math.cos(
                            coin.rotation
                        )
                    )
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


/* ================= FUEL ================= */

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


            ctx.fillStyle =
                "#f44336";


            ctx.fillRect(
                item.x - 12,
                item.y - 17,
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
                item.x,
                item.y + 5
            );

        }
    );


    ctx.restore();

}


/* ================= OBSTACLES ================= */

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


            ctx.fillStyle =
                "#37474f";


            ctx.beginPath();

            ctx.moveTo(
                obstacle.x -
                obstacle.width / 2,
                obstacle.y
            );

            ctx.lineTo(
                obstacle.x -
                obstacle.width * .25,
                obstacle.y -
                obstacle.height
            );

            ctx.lineTo(
                obstacle.x +
                obstacle.width * .2,
                obstacle.y -
                obstacle.height * .8
            );

            ctx.lineTo(
                obstacle.x +
                obstacle.width / 2,
                obstacle.y
            );

            ctx.closePath();

            ctx.fill();

        }
    );


    ctx.restore();

}


/* ================= CAR ================= */

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


    ctx.fillStyle =
        "rgba(0,0,0,.22)";


    ctx.beginPath();

    ctx.ellipse(
        0,
        24,
        vehicle.width * .5,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    if (
        selectedVehicle === "bike"
    ) {

        drawBike();

    } else {

        drawCarBody(
            selectedVehicle === "suv"
                ? "#1565c0"
                : "#e53935",
            vehicle
        );

    }


    ctx.restore();

}


function drawCarBody(
    color,
    vehicle
) {

    ctx.fillStyle =
        color;


    ctx.beginPath();

    ctx.roundRect(
        -vehicle.width / 2,
        -vehicle.height,
        vehicle.width,
        vehicle.height * .62,
        9
    );

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        -vehicle.width * .28,
        -vehicle.height
    );

    ctx.lineTo(
        -vehicle.width * .12,
        -vehicle.height * 1.38
    );

    ctx.lineTo(
        vehicle.width * .22,
        -vehicle.height * 1.38
    );

    ctx.lineTo(
        vehicle.width * .38,
        -vehicle.height
    );

    ctx.closePath();

    ctx.fill();


    ctx.fillStyle =
        "#263238";


    ctx.beginPath();

    ctx.moveTo(
        -vehicle.width * .08,
        -vehicle.height * 1.31
    );

    ctx.lineTo(
        vehicle.width * .18,
        -vehicle.height * 1.31
    );

    ctx.lineTo(
        vehicle.width * .29,
        -vehicle.height * 1.04
    );

    ctx.lineTo(
        -vehicle.width * .04,
        -vehicle.height * 1.04
    );

    ctx.closePath();

    ctx.fill();


    drawWheel(
        -vehicle.width * .32
    );

    drawWheel(
        vehicle.width * .32
    );

}


function drawWheel(x) {

    ctx.fillStyle =
        "#212121";


    ctx.beginPath();

    ctx.arc(
        x,
        1,
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
        1,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


function drawBike() {

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
        "#212121";

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


/* ================= DRAW ================= */

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

    drawCheckpointMarkers();

    drawCoins();

    drawFuelItems();

    drawObstacles();

    drawCar();

}


/* ================= GAME LOOP ================= */

function gameLoop(timestamp) {

    if (!lastTime) {
        lastTime = timestamp;
    }


    let dt =
        (timestamp - lastTime)
        / 16.67;


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
