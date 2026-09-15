// ==========================================
// PRIYANSHU HILL DRIVE
// STEP 4
// VEHICLE SELECTION + UNLOCK SYSTEM
// ==========================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const menu =
    document.getElementById("menu");

const startBtn =
    document.getElementById("startBtn");

const hud =
    document.getElementById("hud");

const distanceText =
    document.getElementById("distance");

const coinsText =
    document.getElementById("coins");

const fuelText =
    document.getElementById("fuel");

const controls =
    document.getElementById("controls");

const gasBtn =
    document.getElementById("gasBtn");

const brakeBtn =
    document.getElementById("brakeBtn");

const menuBestScore =
    document.getElementById("menuBestScore");

const menuCoins =
    document.getElementById("menuCoins");


// ==========================================
// CANVAS
// ==========================================

let W =
    window.innerWidth;

let H =
    window.innerHeight;

function resizeCanvas() {

    W =
        canvas.width =
        window.innerWidth;

    H =
        canvas.height =
        window.innerHeight;
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


// ==========================================
// VEHICLES
// ==========================================

const vehicles = {

    car: {

        name: "RED RACER",

        emoji: "🚗",

        price: 0,

        acceleration: 520,

        maxSpeed: 520,

        fuelUsage: 7,

        width: 85,

        height: 42
    },

    suv: {

        name: "BLUE SUV",

        emoji: "🚙",

        price: 50,

        acceleration: 680,

        maxSpeed: 590,

        fuelUsage: 8,

        width: 95,

        height: 46
    },

    bike: {

        name: "HILL BIKE",

        emoji: "🏍️",

        price: 100,

        acceleration: 760,

        maxSpeed: 680,

        fuelUsage: 9,

        width: 75,

        height: 38
    }
};


// ==========================================
// SAVED DATA
// ==========================================

let totalCoins =
    Number(
        localStorage.getItem(
            "priyanshuHillCoins"
        )
    ) || 0;


let selectedVehicle =
    localStorage.getItem(
        "priyanshuHillVehicle"
    ) || "car";


let unlockedVehicles =
    JSON.parse(
        localStorage.getItem(
            "priyanshuHillUnlocked"
        )
    ) || ["car"];


let bestDistance =
    Number(
        localStorage.getItem(
            "priyanshuHillBest"
        )
    ) || 0;


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
// TERRAIN
// ==========================================

const terrain = [];


function generateTerrain() {

    terrain.length = 0;

    for (
        let x = 0;
        x < 20000;
        x += 20
    ) {

        const y =

            H * 0.68 +

            Math.sin(
                x * 0.004
            ) * 65 +

            Math.sin(
                x * 0.009
            ) * 25 +

            Math.sin(
                x * 0.018
            ) * 12;

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

    let index =
        Math.floor(
            worldX / 20
        );

    if (index < 0) {
        index = 0;
    }

    if (
        index >=
        terrain.length - 1
    ) {

        index =
            terrain.length - 2;
    }

    const p1 =
        terrain[index];

    const p2 =
        terrain[index + 1];

    const ratio =

        (worldX - p1.x) /
        (p2.x - p1.x);

    return (

        p1.y +
        (p2.y - p1.y) *
        ratio

    );
}


function getGroundAngle(worldX) {

    const y1 =
        getGroundY(
            worldX - 10
        );

    const y2 =
        getGroundY(
            worldX + 10
        );

    return Math.atan2(
        y2 - y1,
        20
    );
}


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


    // COINS

    for (
        let x = 450;
        x < 20000;
        x += 350
    ) {

        coinItems.push({

            x:
                x +
                Math.random() *
                120,

            yOffset:
                -55 -
                Math.random() *
                30,

            collected: false,

            rotation:
                Math.random() *
                Math.PI *
                2
        });
    }


    // FUEL

    for (
        let x = 900;
        x < 20000;
        x += 1100
    ) {

        fuelItems.push({

            x:
                x +
                Math.random() *
                250,

            collected: false
        });
    }


    // ROCKS

    for (
        let x = 700;
        x < 20000;
        x += 500
    ) {

        obstacles.push({

            x:
                x +
                Math.random() *
                250,

            size:
                18 +
                Math.random() *
                12,

            hit: false
        });
    }
}


// ==========================================
// VEHICLE UI
// ==========================================

function updateVehicleUI() {

    const cards =
        document.querySelectorAll(
            ".vehicle-card"
        );

    cards.forEach(card => {

        const type =
            card.dataset.vehicle;

        const vehicle =
            vehicles[type];

        const unlocked =
            unlockedVehicles.includes(
                type
            );


        card.classList.toggle(
            "selected",
            type === selectedVehicle &&
            unlocked
        );


        card.classList.toggle(
            "locked",
            !unlocked
        );


        const status =
            card.querySelector(
                ".vehicle-status"
            );


        if (!unlocked) {

            status.textContent =
                `🔒 ${vehicle.price} COINS`;

        } else if (
            type === selectedVehicle
        ) {

            status.textContent =
                "✓ SELECTED";

        } else {

            status.textContent =
                "SELECT";
        }
    });


    menuCoins.textContent =
        totalCoins;
}


// ==========================================
// VEHICLE CLICK
// ==========================================

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


                // ALREADY UNLOCKED

                if (
                    unlockedVehicles
                    .includes(type)
                ) {

                    selectedVehicle =
                        type;

                    localStorage.setItem(
                        "priyanshuHillVehicle",
                        type
                    );

                    updateVehicleUI();

                    return;
                }


                // BUY VEHICLE

                if (
                    totalCoins >=
                    vehicle.price
                ) {

                    totalCoins -=
                        vehicle.price;

                    unlockedVehicles.push(
                        type
                    );

                    selectedVehicle =
                        type;


                    localStorage.setItem(
                        "priyanshuHillCoins",
                        totalCoins
                    );

                    localStorage.setItem(
                        "priyanshuHillUnlocked",
                        JSON.stringify(
                            unlockedVehicles
                        )
                    );

                    localStorage.setItem(
                        "priyanshuHillVehicle",
                        selectedVehicle
                    );

                    updateVehicleUI();

                } else {

                    alert(
                        `You need ${vehicle.price - totalCoins} more coins!`
                    );
                }
            }
        );
    });


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


    const vehicle =
        vehicles[selectedVehicle];


    car.width =
        vehicle.width;

    car.height =
        vehicle.height;


    car.x = 180;


    car.y =
        getGroundY(
            car.x
        ) -
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
// START
// ==========================================

function startGame() {

    resetGame();

    gameRunning = true;

    gameOver = false;

    menu.style.display =
        "none";

    hud.style.display =
        "flex";

    controls.style.display =
        "flex";

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );
}


startBtn.addEventListener(
    "click",
    startGame
);


// ==========================================
// KEYBOARD
// ==========================================

window.addEventListener(
    "keydown",
    e => {

        if (
            e.code ===
                "ArrowRight" ||

            e.code ===
                "KeyD" ||

            e.code ===
                "Space"
        ) {

            gasPressed = true;
        }


        if (
            e.code ===
                "ArrowLeft" ||

            e.code ===
                "KeyA"
        ) {

            brakePressed = true;
        }


        if (
            (
                e.code === "Enter" ||
                e.code === "Space"
            ) &&
            gameOver
        ) {

            startGame();
        }
    }
);


window.addEventListener(
    "keyup",
    e => {

        if (
            e.code ===
                "ArrowRight" ||

            e.code ===
                "KeyD" ||

            e.code ===
                "Space"
        ) {

            gasPressed = false;
        }


        if (
            e.code ===
                "ArrowLeft" ||

            e.code ===
                "KeyA"
        ) {

            brakePressed = false;
        }
    }
);


// ==========================================
// MOBILE CONTROLS
// ==========================================

function pressButton(
    button,
    action
) {

    button.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            action(true);
        }
    );


    button.addEventListener(
        "pointerup",
        e => {

            e.preventDefault();

            action(false);
        }
    );


    button.addEventListener(
        "pointercancel",
        () => {

            action(false);
        }
    );


    button.addEventListener(
        "pointerleave",
        () => {

            action(false);
        }
    );
}


pressButton(
    gasBtn,
    value => {

        gasPressed =
            value;
    }
);


pressButton(
    brakeBtn,
    value => {

        brakePressed =
            value;
    }
);


// ==========================================
// PHYSICS
// ==========================================

function updatePhysics(dt) {

    const vehicle =
        vehicles[selectedVehicle];


    const gravity =
        1450;


    // ACCELERATION

    if (
        gasPressed &&
        fuel > 0
    ) {

        car.vx +=
            vehicle.acceleration *
            dt;

        fuel -=
            vehicle.fuelUsage *
            dt;
    }


    // BRAKE

    if (brakePressed) {

        car.vx -=
            650 *
            dt;
    }


    // FRICTION

    car.vx *=
        Math.pow(
            0.985,
            dt * 60
        );


    // MAX SPEED

    const maxSpeed =

        vehicle.maxSpeed +

        Math.min(
            distance * 0.4,
            300
        );


    if (
        car.vx >
        maxSpeed
    ) {

        car.vx =
            maxSpeed;
    }


    if (
        car.vx <
        -180
    ) {

        car.vx =
            -180;
    }


    // GRAVITY

    car.vy +=
        gravity *
        dt;


    car.x +=
        car.vx *
        dt;

    car.y +=
        car.vy *
        dt;


    // GROUND

    const groundY =
        getGroundY(
            car.x
        );


    const targetY =

        groundY -
        car.height -
        15;


    if (
        car.y >=
        targetY
    ) {

        car.y =
            targetY;


        if (
            car.vy >
            250
        ) {

            car.bounce =
                Math.min(
                    car.vy / 1200,
                    0.7
                );
        }


        car.vy =
            -car.bounce *
            500;


        car.bounce *=
            0.4;


        car.onGround =
            true;

    } else {

        car.onGround =
            false;
    }


    // ANGLE

    const groundAngle =
        getGroundAngle(
            car.x
        );


    car.angle +=

        (
            groundAngle -
            car.angle
        ) *

        Math.min(
            dt * 9,
            1
        );


    // WHEEL

    car.wheelRotation +=

        car.vx *
        dt *
        0.05;


    // CAMERA

    const targetCamera =
        car.x -
        W * 0.28;


    cameraX +=

        (
            targetCamera -
            cameraX
        ) *

        Math.min(
            dt * 4,
            1
        );


    if (
        cameraX < 0
    ) {

        cameraX = 0;
    }


    // DISTANCE

    distance =

        Math.max(
            distance,
            Math.floor(
                (car.x - 180) /
                10
            )
        );


    // INVINCIBILITY

    if (
        car.invincible
    ) {

        car.invincibleTimer -=
            dt;


        if (
            car.invincibleTimer <= 0
        ) {

            car.invincible =
                false;
        }
    }


    // FUEL

    if (
        fuel <= 0
    ) {

        fuel = 0;

        car.vx *=
            0.985;


        if (
            Math.abs(
                car.vx
            ) < 10
        ) {

            endGame();
        }
    }


    checkCoins();

    checkFuel();

    checkObstacles();

    updateHUD();
}


// ==========================================
// COINS
// ==========================================

function checkCoins() {

    for (
        const coin of coinItems
    ) {

        if (
            coin.collected
        ) {
            continue;
        }


        const coinY =

            getGroundY(
                coin.x
            ) +
            coin.yOffset;


        const dx =
            Math.abs(
                car.x -
                coin.x
            );


        const dy =

            Math.abs(
                (
                    car.y +
                    car.height / 2
                ) -
                coinY
            );


        if (
            dx < 50 &&
            dy < 60
        ) {

            coin.collected =
                true;

            coins++;

            totalCoins++;


            localStorage.setItem(
                "priyanshuHillCoins",
                totalCoins
            );
        }
    }
}


// ==========================================
// FUEL
// ==========================================

function checkFuel() {

    for (
        const item of fuelItems
    ) {

        if (
            item.collected
        ) {
            continue;
        }


        const fuelY =
            getGroundY(
                item.x
            ) - 55;


        const dx =
            Math.abs(
                car.x -
                item.x
            );


        const dy =
            Math.abs(
                car.y -
                fuelY
            );


        if (
            dx < 55 &&
            dy < 65
        ) {

            item.collected =
                true;

            fuel += 30;


            if (
                fuel > 100
            ) {

                fuel = 100;
            }
        }
    }
}


// ==========================================
// OBSTACLES
// ==========================================

function checkObstacles() {

    for (
        const rock of obstacles
    ) {

        if (
            rock.hit
        ) {
            continue;
        }


        const rockY =

            getGroundY(
                rock.x
            ) -
            rock.size;


        const dx =
            Math.abs(
                car.x -
                rock.x
            );


        const dy =

            Math.abs(
                car.y +
                car.height -
                rockY
            );


        if (
            dx < 50 &&
            dy < 45 &&
            !car.invincible
        ) {

            rock.hit =
                true;

            crash();
        }
    }
}


// ==========================================
// CRASH
// ==========================================

function crash() {

    lives--;

    car.invincible =
        true;

    car.invincibleTimer =
        2;

    car.vx *=
        0.45;

    car.vy =
        -450;

    car.bounce =
        0.7;


    if (
        lives <= 0
    ) {

        setTimeout(
            () => {
                endGame();
            },
            700
        );
    }
}


// ==========================================
// HUD
// ==========================================

function updateHUD() {

    distanceText.textContent =
        Math.max(
            0,
            distance
        );


    coinsText.textContent =
        coins;


    fuelText.textContent =
        Math.max(
            0,
            Math.floor(fuel)
        );


    if (
        fuel < 20
    ) {

        fuelText.style.color =
            "#ff5252";

    } else {

        fuelText.style.color =
            "";
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


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    // SUN

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

function drawCloud(
    x,
    y,
    scale = 1
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
        "rgba(255,255,255,0.85)";


    ctx.beginPath();

    ctx.arc(
        0,
        10,
        25,
        0,
        Math.PI * 2
    );


    ctx.arc(
        30,
        0,
        32,
        0,
        Math.PI * 2
    );


    ctx.arc(
        65,
        12,
        25,
        0,
        Math.PI * 2
    );


    ctx.fill();

    ctx.restore();
}


function drawClouds() {

    drawCloud(
        120 -
        cameraX * 0.08,
        100,
        1
    );


    drawCloud(
        500 -
        cameraX * 0.05,
        170,
        0.8
    );


    drawCloud(
        850 -
        cameraX * 0.04,
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

    ctx.moveTo(
        0,
        H * 0.62
    );


    for (
        let x = -100;
        x <= W + 100;
        x += 100
    ) {

        const worldX =
            x +
            cameraX *
            0.15;


        const y =

            H * 0.55 +

            Math.sin(
                worldX *
                0.004
            ) *
            55;


        ctx.lineTo(
            x,
            y
        );
    }


    ctx.lineTo(
        W,
        H
    );

    ctx.lineTo(
        0,
        H
    );

    ctx.closePath();

    ctx.fill();
}


// ==========================================
// TERRAIN
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
            x +
            cameraX;


        const y =
            getGroundY(
                worldX
            );


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


    // GRASS

    ctx.beginPath();


    for (
        let x = -20;
        x <= W + 20;
        x += 20
    ) {

        const worldX =
            x +
            cameraX;


        const y =
            getGroundY(
                worldX
            );


        if (
            x === -20
        ) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );
        }
    }


    ctx.strokeStyle =
        "#43a047";

    ctx.lineWidth =
        12;

    ctx.stroke();
}


// ==========================================
// COIN DRAW
// ==========================================

function drawCoins() {

    for (
        const coin of coinItems
    ) {

        if (
            coin.collected
        ) {
            continue;
        }


        const screenX =
            coin.x -
            cameraX;


        if (
            screenX < -50 ||
            screenX > W + 50
        ) {

            continue;
        }


        const y =

            getGroundY(
                coin.x
            ) +
            coin.yOffset;


        coin.rotation +=
            0.05;


        const scale =

            Math.abs(
                Math.sin(
                    coin.rotation
                )
            ) *
            0.7 +
            0.3;


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

        ctx.lineWidth =
            3;

        ctx.stroke();


        ctx.restore();
    }
}


// ==========================================
// FUEL DRAW
// ==========================================

function drawFuelItems() {

    for (
        const item of fuelItems
    ) {

        if (
            item.collected
        ) {
            continue;
        }


        const screenX =
            item.x -
            cameraX;


        if (
            screenX < -80 ||
            screenX > W + 80
        ) {

            continue;
        }


        const y =
            getGroundY(
                item.x
            ) - 50;


        ctx.save();


        ctx.translate(
            screenX,
            y
        );


        ctx.fillStyle =
            "#e53935";


        ctx.fillRect(
            -16,
            -20,
            32,
            40
        );


        ctx.fillStyle =
            "#263238";


        ctx.fillRect(
            -8,
            -27,
            16,
            8
        );


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
// OBSTACLES DRAW
// ==========================================

function drawObstacles() {

    for (
        const rock of obstacles
    ) {

        if (
            rock.hit
        ) {
            continue;
        }


        const screenX =
            rock.x -
            cameraX;


        if (
            screenX < -60 ||
            screenX > W + 60
        ) {

            continue;
        }


        const y =
            getGroundY(
                rock.x
            );


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
// DRAW CAR
// ==========================================

function drawCar() {

    const screenX =
        car.x -
        cameraX;

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


    // FLASH AFTER CRASH

    if (
        car.invincible &&
        Math.floor(
            performance.now() /
            120
        ) % 2 === 0
    ) {

        ctx.globalAlpha =
            0.35;
    }


    const vehicle =
        selectedVehicle;


    // ======================================
    // RED CAR
    // ======================================

    if (
        vehicle === "car"
    ) {

        drawRedCar();

    }


    // ======================================
    // BLUE SUV
    // ======================================

    if (
        vehicle === "suv"
    ) {

        drawBlueSUV();

    }


    // ======================================
    // BIKE
    // ======================================

    if (
        vehicle === "bike"
    ) {

        drawBike();
    }


    ctx.restore();
}


// ==========================================
// RED CAR
// ==========================================

function drawRedCar() {

    // SHADOW

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


    // BODY

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


    // CABIN

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


    // WINDOW

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


    drawWheel(
        -27,
        5
    );


    drawWheel(
        27,
        5
    );
}


// ==========================================
// BLUE SUV
// ==========================================

function drawBlueSUV() {

    // BODY

    ctx.fillStyle =
        "#1565c0";


    ctx.beginPath();


    ctx.roundRect(
        -48,
        -34,
        96,
        39,
        9
    );


    ctx.fill();


    // ROOF

    ctx.fillStyle =
        "#0d47a1";


    ctx.beginPath();


    ctx.moveTo(
        -28,
        -34
    );


    ctx.lineTo(
        -12,
        -55
    );


    ctx.lineTo(
        25,
        -55
    );


    ctx.lineTo(
        39,
        -34
    );


    ctx.closePath();


    ctx.fill();


    // WINDOWS

    ctx.fillStyle =
        "#90caf9";


    ctx.fillRect(
        -9,
        -49,
        17,
        14
    );


    ctx.fillRect(
        11,
        -49,
        13,
        14
    );


    // BUMPER

    ctx.fillStyle =
        "#263238";


    ctx.fillRect(
        40,
        -5,
        12,
        10
    );


    drawWheel(
        -31,
        6
    );


    drawWheel(
        31,
        6
    );
}


// ==========================================
// BIKE
// ==========================================

function drawBike() {

    // REAR WHEEL

    drawBikeWheel(
        -25,
        8
    );


    // FRONT WHEEL

    drawBikeWheel(
        28,
        8
    );


    // FRAME

    ctx.strokeStyle =
        "#ff1744";

    ctx.lineWidth =
        5;


    ctx.beginPath();


    ctx.moveTo(
        -25,
        8
    );


    ctx.lineTo(
        0,
        -18
    );


    ctx.lineTo(
        28,
        8
    );


    ctx.lineTo(
        -25,
        8
    );


    ctx.stroke();


    // SEAT

    ctx.fillStyle =
        "#212121";


    ctx.fillRect(
        -8,
        -24,
        18,
        5
    );


    // HANDLE

    ctx.strokeStyle =
        "#212121";


    ctx.lineWidth =
        4;


    ctx.beginPath();


    ctx.moveTo(
        20,
        -10
    );


    ctx.lineTo(
        31,
        -20
    );


    ctx.stroke();


    // RIDER

    ctx.fillStyle =
        "#ffcc80";


    ctx.beginPath();


    ctx.arc(
        2,
        -38,
        9,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.fillStyle =
        "#212121";


    ctx.fillRect(
        -7,
        -30,
        18,
        18
    );
}


// ==========================================
// BIKE WHEEL
// ==========================================

function drawBikeWheel(
    x,
    y
) {

    ctx.beginPath();


    ctx.arc(
        x,
        y,
        12,
        0,
        Math.PI * 2
    );


    ctx.strokeStyle =
        "#151515";


    ctx.lineWidth =
        4;


    ctx.stroke();
}


// ==========================================
// NORMAL WHEEL
// ==========================================

function drawWheel(
    x,
    y
) {

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

    ctx.lineWidth =
        3;

    ctx.stroke();


    ctx.strokeStyle =
        "#bbb";

    ctx.lineWidth =
        2;


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const a =
            i *
            Math.PI /
            2;


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
// LIVES
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
        "❤️".repeat(
            lives
        ),
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

function gameLoop(
    time
) {

    if (
        !gameRunning
    ) {

        return;
    }


    let dt =

        (
            time -
            lastTime
        ) /
        1000;


    lastTime =
        time;


    dt =
        Math.min(
            dt,
            0.033
        );


    updatePhysics(
        dt
    );


    drawGame();


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    if (
        !gameRunning
    ) {

        return;
    }


    gameRunning =
        false;

    gameOver =
        true;


    if (
        distance >
        bestDistance
    ) {

        bestDistance =
            distance;


        localStorage.setItem(
            "priyanshuHillBest",
            bestDistance
        );
    }


    hud.style.display =
        "none";


    controls.style.display =
        "none";


    showGameOverScreen();
}


// ==========================================
// GAME OVER SCREEN
// ==========================================

function showGameOverScreen() {

    menu.style.display =
        "flex";


    const card =
        menu.querySelector(
            ".menu-card"
        );


    if (!card) {
        return;
    }


    card.innerHTML = `

        <div class="game-icon">
            💥
        </div>

        <h1>
            GAME OVER
        </h1>

        <h2>
            ${vehicles[selectedVehicle].emoji}
            ${vehicles[selectedVehicle].name}
        </h2>

        <p class="developer">
            Nice driving!
            Keep improving 🚗🔥
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

            ⌨️ Arrow Keys / D = GAS
            <br>

            ⬅️ Arrow Left / A = BRAKE

        </p>
    `;


    document
        .getElementById(
            "startBtn"
        )
        .addEventListener(
            "click",
            startGame
        );
}


// ==========================================
// INITIAL UI
// ==========================================

menuBestScore.textContent =
    bestDistance;


menuCoins.textContent =
    totalCoins;


updateVehicleUI();


updateHUD();
