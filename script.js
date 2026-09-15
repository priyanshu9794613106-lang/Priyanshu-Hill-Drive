/* =========================================================
   PRIYANSHU HILL DRIVE
   STABLE GAME ENGINE - FIXED VERSION
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

    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);

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
        price: 50,
        acceleration: 0.24,
        maxSpeed: 9,
        fuelUsage: 0.015,
        grip: 0.045,
        width: 90,
        height: 43
    },

    bike: {
        name: "HILL BIKE",
        price: 100,
        acceleration: 0.28,
        maxSpeed: 12,
        fuelUsage: 0.012,
        grip: 0.025,
        width: 64,
        height: 34
    }
};


/* =========================================================
   SAVE DATA
========================================================= */

let selectedVehicle =
    localStorage.getItem("phd_selectedVehicle") || "car";

let unlockedVehicles;

try {
    unlockedVehicles = JSON.parse(
        localStorage.getItem("phd_unlockedVehicles") || '["car"]'
    );
} catch (e) {
    unlockedVehicles = ["car"];
}

if (!Array.isArray(unlockedVehicles)) {
    unlockedVehicles = ["car"];
}

if (!unlockedVehicles.includes("car")) {
    unlockedVehicles.unshift("car");
}


let upgrades;

try {
    upgrades = JSON.parse(
        localStorage.getItem("phd_upgrades") ||
        '{"engine":1,"tire":1,"fuel":1,"speed":1}'
    );
} catch (e) {
    upgrades = {
        engine: 1,
        tire: 1,
        fuel: 1,
        speed: 1
    };
}


upgrades.engine = Number(upgrades.engine) || 1;
upgrades.tire = Number(upgrades.tire) || 1;
upgrades.fuel = Number(upgrades.fuel) || 1;
upgrades.speed = Number(upgrades.speed) || 1;


let totalCoins =
    Number(localStorage.getItem("phd_totalCoins") || 0);

let bestDistance =
    Number(localStorage.getItem("phd_bestDistance") || 0);


function saveUpgrades() {
    localStorage.setItem(
        "phd_upgrades",
        JSON.stringify(upgrades)
    );
}


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
        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }

    if (
        audioCtx &&
        audioCtx.state === "suspended"
    ) {
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

    try {

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

    } catch (e) {}

}


function startEngineSound() {

    if (!soundEnabled) return;

    initAudio();

    if (!audioCtx || engineOscillator) return;

    try {

        engineOscillator =
            audioCtx.createOscillator();

        engineGain =
            audioCtx.createGain();

        engineOscillator.type =
            "sawtooth";

        engineOscillator.frequency.value =
            70;

        engineGain.gain.value =
            0.015;

        engineOscillator.connect(
            engineGain
        );

        engineGain.connect(
            audioCtx.destination
        );

        engineOscillator.start();

    } catch (e) {

        engineOscillator = null;
        engineGain = null;

    }
}


function updateEngineSound() {

    if (
        !engineOscillator ||
        !audioCtx ||
        !soundEnabled
    ) {
        return;
    }

    try {

        const frequency =
            60 + Math.abs(speed) * 18;

        engineOscillator.frequency.linearRampToValueAtTime(
            frequency,
            audioCtx.currentTime + 0.08
        );

    } catch (e) {}

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

    if (soundBtn) {
        soundBtn.textContent =
            soundEnabled ? "🔊" : "🔇";
    }

}


updateSoundButton();


if (soundBtn) {

    soundBtn.addEventListener(
        "click",
        function () {

            soundEnabled =
                !soundEnabled;

            localStorage.setItem(
                "phd_sound",
                String(soundEnabled)
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

}


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

let terrain = [];
let coinItems = [];
let fuelItems = [];
let obstacles = [];


/* =========================================================
   INITIAL MENU
========================================================= */

menuCoins.textContent = totalCoins;
menuBestScore.textContent = bestDistance;


/* =========================================================
   GARAGE
========================================================= */

const upgradeTypes = [
    "engine",
    "tire",
    "fuel",
    "speed"
];


function getUpgradeCost(type) {

    const level =
        Number(upgrades[type]) || 1;

    return 20 * level;

}


function updateGarageUI() {

    upgradeTypes.forEach(
        function (type) {

            const level =
                Math.min(
                    5,
                    Number(upgrades[type]) || 1
                );

            let idPrefix = type;

            if (type === "tire") {
                idPrefix = "tire";
            }

            const levelEl =
                document.getElementById(
                    idPrefix + "Level"
                );

            const progressEl =
                document.getElementById(
                    idPrefix + "Progress"
                );

            const button =
                document.getElementById(
                    idPrefix + "Upgrade"
                );


            if (levelEl) {
                levelEl.textContent = level;
            }


            if (progressEl) {

                progressEl.style.width =
                    ((level / 5) * 100) + "%";

            }


            if (button) {

                if (level >= 5) {

                    button.textContent = "MAX";

                    button.classList.add("maxed");

                    button.disabled = true;

                } else {

                    button.innerHTML =
                        "🪙 <span>" +
                        getUpgradeCost(type) +
                        "</span>";

                    button.classList.remove(
                        "maxed"
                    );

                    button.disabled = false;
                }

            }

        }
    );


    const garageLevel =
        Math.max(
            upgrades.engine,
            upgrades.tire,
            upgrades.fuel,
            upgrades.speed
        );

    const garageLevelEl =
        document.getElementById(
            "garageLevel"
        );

    if (garageLevelEl) {
        garageLevelEl.textContent =
            garageLevel;
    }

}


function purchaseUpgrade(type) {

    if (!upgrades[type]) {
        upgrades[type] = 1;
    }

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
            "Not enough coins!\n\n" +
            "You need " +
            cost +
            " coins."
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

    setTimeout(
        function () {

            playTone(
                1100,
                0.12,
                "triangle",
                0.05
            );

        },
        90
    );

}


const engineUpgrade =
    document.getElementById(
        "engineUpgrade"
    );

const tireUpgrade =
    document.getElementById(
        "tireUpgrade"
    );

const fuelUpgrade =
    document.getElementById(
        "fuelUpgrade"
    );

const speedUpgrade =
    document.getElementById(
        "speedUpgrade"
    );


if (engineUpgrade) {
    engineUpgrade.addEventListener(
        "click",
        function () {
            purchaseUpgrade("engine");
        }
    );
}

if (tireUpgrade) {
    tireUpgrade.addEventListener(
        "click",
        function () {
            purchaseUpgrade("tire");
        }
    );
}

if (fuelUpgrade) {
    fuelUpgrade.addEventListener(
        "click",
        function () {
            purchaseUpgrade("fuel");
        }
    );
}

if (speedUpgrade) {
    speedUpgrade.addEventListener(
        "click",
        function () {
            purchaseUpgrade("speed");
        }
    );
}


updateGarageUI();


/* =========================================================
   VEHICLE UI
========================================================= */

function updateVehicleUI() {

    document
        .querySelectorAll(".vehicle-card")
        .forEach(
            function (card) {

                const type =
                    card.dataset.vehicle;

                if (!vehicles[type]) {
                    return;
                }

                const status =
                    card.querySelector(
                        ".vehicle-status"
                    );

                const unlocked =
                    unlockedVehicles.includes(
                        type
                    );


                card.classList.toggle(
                    "selected",
                    type === selectedVehicle
                );


                card.classList.toggle(
                    "locked",
                    !unlocked
                );


                if (status) {

                    if (!unlocked) {

                        status.textContent =
                            "🔒 " +
                            vehicles[type].price +
                            " COINS";

                    } else if (
                        type === selectedVehicle
                    ) {

                        status.textContent =
                            "SELECTED";

                    } else {

                        status.textContent =
                            "SELECT";

                    }

                }

            }
        );

}


document
    .querySelectorAll(".vehicle-card")
    .forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const type =
                        card.dataset.vehicle;

                    const vehicle =
                        vehicles[type];

                    if (!vehicle) {
                        return;
                    }


                    if (
                        !unlockedVehicles.includes(
                            type
                        )
                    ) {

                        if (
                            totalCoins <
                            vehicle.price
                        ) {

                            playTone(
                                180,
                                0.1,
                                "square"
                            );

                            alert(
                                "You need " +
                                vehicle.price +
                                " coins to unlock " +
                                vehicle.name +
                                "."
                            );

                            return;
                        }


                        const confirmUnlock =
                            confirm(
                                "Unlock " +
                                vehicle.name +
                                " for " +
                                vehicle.price +
                                " coins?"
                            );

                        if (!confirmUnlock) {
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


                        menuCoins.textContent =
                            totalCoins;


                        playTone(
                            900,
                            0.08,
                            "triangle"
                        );

                    }


                    selectedVehicle =
                        type;


                    localStorage.setItem(
                        "phd_selectedVehicle",
                        selectedVehicle
                    );


                    updateVehicleUI();

                }
            );

        }
    );


updateVehicleUI();


/* =========================================================
   TERRAIN GENERATION
========================================================= */

function generateTerrain() {

    terrain = [];

    const step = 70;

    let y =
        H * 0.67;

    let slope = 0;


    for (
        let x = -500;
        x <= 30000;
        x += step
    ) {

        slope +=
            (Math.random() - 0.5) * 0.18;

        slope *= 0.91;


        slope =
            Math.max(
                -0.55,
                Math.min(
                    0.55,
                    slope
                )
            );


        y += slope * 15;


        y +=
            Math.sin(x * 0.006) * 2;


        y =
            Math.max(
                H * 0.43,
                Math.min(
                    H * 0.80,
                    y
                )
            );


        terrain.push({
            x: x,
            y: y
        });

    }

}


/* =========================================================
   FAST GROUND LOOKUP
========================================================= */

function getGroundY(x) {

    if (!terrain.length) {
        return H * 0.67;
    }


    if (x <= terrain[0].x) {
        return terrain[0].y;
    }


    const step = 70;

    let index =
        Math.floor(
            (x + 500) / step
        );


    index =
        Math.max(
            0,
            Math.min(
                terrain.length - 2,
                index
            )
        );


    const a =
        terrain[index];

    const b =
        terrain[index + 1];


    if (!a || !b) {
        return terrain[
            terrain.length - 1
        ].y;
    }


    const t =
        Math.max(
            0,
            Math.min(
                1,
                (x - a.x) /
                (b.x - a.x)
            )
        );


    return (
        a.y +
        (b.y - a.y) * t
    );

}


function getGroundAngle(x) {

    const delta = 8;

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

    coinItems = [];
    fuelItems = [];
    obstacles = [];


    for (
        let x = 650;
        x < 28000;
        x +=
            350 +
            Math.random() * 450
    ) {

        const coinX =
            x +
            Math.random() * 120;


        coinItems.push({

            x: coinX,

            y:
                getGroundY(coinX) -
                65,

            radius: 13,

            collected: false,

            rotation:
                Math.random() *
                Math.PI *
                2

        });

    }


    for (
        let x = 1300;
        x < 28000;
        x +=
            1000 +
            Math.random() * 700
    ) {

        const fuelX =
            x +
            Math.random() * 200;


        fuelItems.push({

            x: fuelX,

            y:
                getGroundY(fuelX) -
                58,

            radius: 16,

            collected: false

        });

    }


    for (
        let x = 950;
        x < 28000;
        x +=
            650 +
            Math.random() * 700
    ) {

        const obstacleX =
            x +
            Math.random() * 180;


        obstacles.push({

            x: obstacleX,

            y:
                getGroundY(obstacleX),

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


    /* IMPORTANT:
       TERRAIN FIRST
    */

    generateTerrain();

    generateItems();


    distance = 0;

    runCoins = 0;


    const maxFuel =
        100 +
        (upgrades.fuel - 1) * 20;


    fuel = maxFuel;

    lives = 3;

    speed = 0;

    carVelocityY = 0;

    carX = 220;

    cameraX = 0;


    carY =
        getGroundY(carX) -
        vehicles[selectedVehicle].height;


    carAngle =
        getGroundAngle(carX);


    gasPressed = false;

    brakePressed = false;


    paused = false;

    gameOver = false;

    countdownRunning = false;

    running = true;


    menu.style.display =
        "none";


    hud.style.display =
        "flex";


    controls.style.display =
        "flex";


    pauseScreen.style.display =
        "none";


    countdownEl.style.display =
        "none";


    distanceEl.textContent =
        "0";


    coinsEl.textContent =
        "0";


    fuelEl.textContent =
        "100";


    livesEl.textContent =
        "3";


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


    function next() {

        if (!running) {

            countdownRunning =
                false;

            countdownEl.style.display =
                "none";

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

            setTimeout(
                function () {

                    countdownEl.style.display =
                        "none";

                    countdownRunning =
                        false;

                    startEngineSound();

                },
                550
            );

            return;
        }


        setTimeout(
            next,
            700
        );

    }


    next();

}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    function (e) {

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
    function (e) {

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
   MOBILE CONTROLS
========================================================= */

function setupHoldButton(
    button,
    setter
) {

    if (!button) return;


    function start(e) {

        e.preventDefault();

        setter(true);

    }


    function end(e) {

        e.preventDefault();

        setter(false);

    }


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
    function (value) {
        gasPressed = value;
    }
);


setupHoldButton(
    brakeBtn,
    function (value) {
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
    function () {

        paused = false;

        pauseScreen.style.display =
            "none";

        startEngineSound();

    }
);


quitBtn.addEventListener(
    "click",
    function () {

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


    paused =
        !paused;


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


    const enginePower =
        1 +
        (upgrades.engine - 1) *
        0.16;


    const speedPower =
        1 +
        (upgrades.speed - 1) *
        0.13;


    const tireGrip =
        vehicle.grip +
        (upgrades.tire - 1) *
        0.012;


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


        const fuelEfficiency =
            1 -
            (upgrades.fuel - 1) *
            0.025;


        fuel -=
            vehicle.fuelUsage *
            dt *
            fuelEfficiency;

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
            0.32 *
            dt;

    }


    /* SPEED LIMIT */

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
        0.45 *
        dt;


    carY +=
        carVelocityY *
        dt;


    /* MOVE */

    carX +=
        speed *
        dt *
        2.2;


    if (carX < 100) {
        carX = 100;
    }


    /* GROUND */

    const groundY =
        getGroundY(carX);


    const targetY =
        groundY -
        vehicle.height;


    if (
        carY >= targetY
    ) {

        carY =
            targetY;

        carVelocityY = 0;

    }


    /* ANGLE */

    const targetAngle =
        getGroundAngle(carX);


    carAngle +=
        (
            targetAngle -
            carAngle
        ) *
        Math.min(
            1,
            tireGrip *
            dt *
            3
        );


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


    const maxFuel =
        100 +
        (upgrades.fuel - 1) *
        20;


    distanceEl.textContent =
        distance;


    coinsEl.textContent =
        runCoins;


    fuelEl.textContent =
        Math.round(
            (fuel / maxFuel) *
            100
        );


    livesEl.textContent =
        lives;


    checkItems();

    checkObstacles();


    if (
        fuel <= 0
    ) {

        speed *=
            0.97;


        if (
            Math.abs(speed) <
            0.04
        ) {

            endGame();

        }

    }


    updateEngineSound();

}


/* =========================================================
   COINS + FUEL
========================================================= */

function checkItems() {

    coinItems.forEach(
        function (coin) {

            if (coin.collected) {
                return;
            }


            const dx =
                carX -
                coin.x;

            const dy =
                carY -
                coin.y;


            const d =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (d < 55) {

                coin.collected =
                    true;

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
                    function () {

                        playTone(
                            1300,
                            0.08,
                            "triangle",
                            0.05
                        );

                    },
                    60
                );

            }

        }
    );


    fuelItems.forEach(
        function (item) {

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

                item.collected =
                    true;


                const maxFuel =
                    100 +
                    (upgrades.fuel - 1) *
                    20;


                fuel =
                    Math.min(
                        maxFuel,
                        fuel + 35
                    );


                playTone(
                    600,
                    0.1,
                    "sine",
                    0.05
                );

            }

        }
    );

}


/* =========================================================
   OBSTACLES
========================================================= */

function checkObstacles() {

    const vehicle =
        vehicles[selectedVehicle];


    obstacles.forEach(
        function (obstacle) {

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
                vehicle.height * 0.6 +
                obstacle.height * 0.6
            ) {

                obstacle.hit =
                    true;

                crash();

            }

        }
    );

}


/* =========================================================
   CRASH
========================================================= */

function crash() {

    if (!running) {
        return;
    }


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


    gameOver =
        true;

    running =
        false;


    gasPressed =
        false;

    brakePressed =
        false;


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
        400
    );

}


/* =========================================================
   GAME OVER SCREEN
========================================================= */

function showGameOver() {

    hud.style.display =
        "none";

    controls.style.display =
        "none";

    countdownEl.style.display =
        "none";

    pauseScreen.style.display =
        "none";

    menu.style.display =
        "flex";


    const card =
        document.querySelector(
            ".menu-card"
        );


    if (!card) {
        return;
    }


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

        <div class="best-box"
             style="
                margin-top:15px;
                padding:12px;
                border-radius:12px;
                background:rgba(255,255,255,0.08);
                color:white;
             ">

            🏆 Best Distance:
            <strong>
                ${bestDistance} m
            </strong>

        </div>

        <div
            style="
                margin-top:12px;
                color:#ffd54f;
                font-weight:900;
            "
        >
            🪙 Total Coins: ${totalCoins}
        </div>

        <button
            id="restartBtn"
            style="
                width:100%;
                padding:15px;
                margin-top:20px;
                border:none;
                border-radius:15px;
                background:linear-gradient(135deg,#00c853,#64dd17);
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
                background:rgba(255,255,255,0.12);
                color:white;
                font-size:15px;
                font-weight:800;
                cursor:pointer;
            "
        >
            🏠 GARAGE
        </button>

    `;


    const restartBtn =
        document.getElementById(
            "restartBtn"
        );


    const menuBtn =
        document.getElementById(
            "menuBtn"
        );


    if (restartBtn) {

        restartBtn.addEventListener(
            "click",
            function () {

                location.reload();

            }
        );

    }


    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            function () {

                location.reload();

            }
        );

    }

}


/* =========================================================
   SKY
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
        W * 0.15 -
        cameraX * 0.06,
        H * 0.17,
        1
    );


    drawCloud(
        W * 0.55 -
        cameraX * 0.04,
        H * 0.24,
        0.8
    );


    drawCloud(
        W * 0.90 -
        cameraX * 0.03,
        H * 0.13,
        0.7
    );

}


/* =========================================================
   CLOUD
========================================================= */

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
        "rgba(255,255,255,0.75)";


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
        H * 0.65
    );


    for (
        let x = -500;
        x < W + cameraX + 1000;
        x += 180
    ) {

        const peak =
            H * 0.37 +
            Math.sin(
                x * 0.01
            ) * 55;


        ctx.lineTo(
            x,
            peak
        );


        ctx.lineTo(
            x + 90,
            H * 0.65
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
   TERRAIN
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
        let i = 1;
        i < terrain.length;
        i++
    ) {

        ctx.lineTo(
            terrain[i].x,
            terrain[i].y
        );

    }


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


    /* GRASS TOP */

    ctx.beginPath();


    ctx.moveTo(
        terrain[0].x,
        terrain[0].y
    );


    for (
        let i = 1;
        i < terrain.length;
        i++
    ) {

        ctx.lineTo(
            terrain[i].x,
            terrain[i].y
        );

    }


    ctx.strokeStyle =
        "#2e7d32";


    ctx.lineWidth =
        8;


    ctx.lineJoin =
        "round";


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


    coinItems.forEach(
        function (coin) {

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


            ctx.lineWidth =
                3;


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
        function (item) {

            if (item.collected) {
                return;
            }


            ctx.save();


            ctx.translate(
                item.x,
                item.y
            );


            /* CAN */

            ctx.fillStyle =
                "#e53935";


            ctx.fillRect(
                -12,
                -17,
                24,
                32
            );


            /* TOP */

            ctx.fillStyle =
                "#b71c1c";


            ctx.fillRect(
                -6,
                -21,
                12,
                5
            );


            /* F */

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
        function (obstacle) {

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


            ctx.strokeStyle =
                "#263238";


            ctx.lineWidth =
                2;


            ctx.stroke();


            ctx.restore();

        }
    );


    ctx.restore();

}


/* =========================================================
   ROUNDED RECTANGLE - SAFE VERSION
========================================================= */

function roundedRect(
    x,
    y,
    width,
    height,
    radius
) {

    radius =
        Math.min(
            radius,
            width / 2,
            height / 2
        );


    ctx.beginPath();


    ctx.moveTo(
        x + radius,
        y
    );


    ctx.lineTo(
        x + width - radius,
        y
    );


    ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );


    ctx.lineTo(
        x + width,
        y + height - radius
    );


    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );


    ctx.lineTo(
        x + radius,
        y + height
    );


    ctx.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
    );


    ctx.lineTo(
        x,
        y + radius
    );


    ctx.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );


    ctx.closePath();

}


/* =========================================================
   CAR DRAW
========================================================= */

function drawCar() {

    const vehicle =
        vehicles[selectedVehicle];


    if (!vehicle) {
        return;
    }


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
        23,
        vehicle.width * 0.5,
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

        let bodyColor =
            "#e53935";


        if (
            selectedVehicle === "suv"
        ) {

            bodyColor =
                "#1565c0";

        }


        drawCarBody(
            bodyColor,
            vehicle
        );

    }


    ctx.restore();

}


/* =========================================================
   CAR BODY
========================================================= */

function drawCarBody(
    bodyColor,
    vehicle
) {

    /* BODY */

    ctx.fillStyle =
        bodyColor;


    roundedRect(
        -vehicle.width / 2,
        -vehicle.height,
        vehicle.width,
        vehicle.height * 0.62,
        8
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


    /* HEADLIGHT */

    ctx.fillStyle =
        "#fff59d";


    ctx.beginPath();


    ctx.arc(
        vehicle.width * 0.43,
        -vehicle.height * 0.48,
        4,
        0,
        Math.PI * 2
    );


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


/* =========================================================
   WHEEL
========================================================= */

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


/* =========================================================
   BIKE
========================================================= */

function drawBike() {

    /* WHEELS */

    ctx.strokeStyle =
        "#212121";


    ctx.lineWidth =
        5;


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


    /* FRAME */

    ctx.strokeStyle =
        "#212121";


    ctx.lineWidth =
        6;


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


    /* HANDLE */

    ctx.beginPath();


    ctx.moveTo(
        19,
        0
    );


    ctx.lineTo(
        22,
        -17
    );


    ctx.stroke();


    /* RIDER HEAD */

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


    /* RIDER BODY */

    ctx.strokeStyle =
        "#212121";


    ctx.lineWidth =
        6;


    ctx.beginPath();


    ctx.moveTo(
        3,
        -20
    );


    ctx.lineTo(
        -5,
        -8
    );


    ctx.stroke();

}


/* =========================================================
   LIVES
========================================================= */

function drawLivesOnCanvas() {

    if (!running) {
        return;
    }


    ctx.save();


    ctx.font =
        "bold 16px Arial";


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
            i < lives
                ? 1
                : 0.25;


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
   DRAW EVERYTHING
========================================================= */

function draw() {

    try {

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

    } catch (error) {

        console.error(
            "Game drawing error:",
            error
        );

    }

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


    lastTime =
        timestamp;


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


/* =========================================================
   MENU STATS
========================================================= */

function updateMenuStats() {

    if (menuCoins) {
        menuCoins.textContent =
            totalCoins;
    }


    if (menuBestScore) {
        menuBestScore.textContent =
            bestDistance;
    }


    updateGarageUI();

    updateVehicleUI();

}


/* =========================================================
   START RENDER LOOP
========================================================= */

updateMenuStats();

requestAnimationFrame(
    gameLoop
);
