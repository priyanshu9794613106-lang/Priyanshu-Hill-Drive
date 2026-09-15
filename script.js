/* =========================================================
   PRIYANSHU HILL DRIVE
   STEP 8
   POWER-UPS + GARAGE + MISSIONS + ACHIEVEMENTS
========================================================= */


/* =========================================================
   DOM
========================================================= */

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

const distanceEl =
    document.getElementById("distance");

const coinsEl =
    document.getElementById("coins");

const fuelEl =
    document.getElementById("fuel");

const livesEl =
    document.getElementById("lives");

const menuBestScore =
    document.getElementById("menuBestScore");

const menuCoins =
    document.getElementById("menuCoins");

const countdownEl =
    document.getElementById("countdown");

const controls =
    document.getElementById("controls");

const gasBtn =
    document.getElementById("gasBtn");

const brakeBtn =
    document.getElementById("brakeBtn");

const nitroBtn =
    document.getElementById("nitroBtn");

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

const powerStatus =
    document.getElementById("powerStatus");


/* =========================================================
   CANVAS
========================================================= */

let W =
    window.innerWidth;

let H =
    window.innerHeight;


function resizeCanvas() {

    W =
        window.innerWidth;

    H =
        window.innerHeight;


    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        W * dpr;

    canvas.height =
        H * dpr;


    canvas.style.width =
        W + "px";

    canvas.style.height =
        H + "px";


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
        maxSpeed: 9,
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
    localStorage.getItem(
        "phd_selectedVehicle"
    ) || "car";


let unlockedVehicles =
    JSON.parse(
        localStorage.getItem(
            "phd_unlockedVehicles"
        ) ||
        '["car"]'
    );


/* =========================================================
   GARAGE
========================================================= */

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
        JSON.stringify(
            upgrades
        )
    );

}


function getUpgradeCost(
    type
) {

    return (
        20 *
        upgrades[type]
    );

}


function updateGarageUI() {

    const types = [
        "engine",
        "tire",
        "fuel",
        "speed"
    ];


    types.forEach(
        type => {

            const level =
                upgrades[type];


            const levelId =
                type === "tire"
                    ? "tireLevel"
                    : type + "Level";


            const progressId =
                type === "tire"
                    ? "tireProgress"
                    : type + "Progress";


            const buttonId =
                type === "tire"
                    ? "tireUpgrade"
                    : type + "Upgrade";


            document.getElementById(
                levelId
            ).textContent =
                level;


            document.getElementById(
                progressId
            ).style.width =
                (
                    level /
                    5 *
                    100
                ) + "%";


            const button =
                document.getElementById(
                    buttonId
                );


            if (
                level >= 5
            ) {

                button.textContent =
                    "MAX";

                button.classList.add(
                    "maxed"
                );

                button.disabled =
                    true;

            } else {

                button.innerHTML =
                    `🪙 ${getUpgradeCost(type)}`;

                button.classList.remove(
                    "maxed"
                );

                button.disabled =
                    false;

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


function purchaseUpgrade(
    type
) {

    if (
        upgrades[type] >= 5
    ) {
        return;
    }


    const cost =
        getUpgradeCost(type);


    if (
        totalCoins < cost
    ) {

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


    totalCoins -=
        cost;


    upgrades[type]++;


    saveAll();


    updateMenuStats();

    updateAchievements();


    playTone(
        800,
        0.08,
        "triangle",
        0.06
    );


    setTimeout(
        () => playTone(
            1100,
            0.12,
            "triangle",
            0.05
        ),
        100
    );

}


document.getElementById(
    "engineUpgrade"
).addEventListener(
    "click",
    () => purchaseUpgrade("engine")
);


document.getElementById(
    "tireUpgrade"
).addEventListener(
    "click",
    () => purchaseUpgrade("tire")
);


document.getElementById(
    "fuelUpgrade"
).addEventListener(
    "click",
    () => purchaseUpgrade("fuel")
);


document.getElementById(
    "speedUpgrade"
).addEventListener(
    "click",
    () => purchaseUpgrade("speed")
);


/* =========================================================
   COINS / SCORE
========================================================= */

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


/* =========================================================
   MISSIONS
========================================================= */

let missionData =
    JSON.parse(
        localStorage.getItem(
            "phd_missions"
        ) ||
        JSON.stringify({

            distance: 0,

            coins: 0,

            fuel: 0,

            survivor: false,

            distanceClaimed: false,

            coinsClaimed: false,

            fuelClaimed: false,

            survivorClaimed: false

        })
    );


const missionRun = {

    coins: 0,

    fuel: 0

};


const missionTargets = {

    distance: 1000,

    coins: 25,

    fuel: 3

};


const missionRewards = {

    distance: 30,

    coins: 40,

    fuel: 35,

    survivor: 50

};


function saveMissions() {

    localStorage.setItem(
        "phd_missions",
        JSON.stringify(
            missionData
        )
    );

}


function updateMissionUI() {

    const distanceProgress =
        Math.min(
            100,
            missionData.distance /
            1000 *
            100
        );


    const coinsProgress =
        Math.min(
            100,
            missionData.coins /
            25 *
            100
        );


    const fuelProgress =
        Math.min(
            100,
            missionData.fuel /
            3 *
            100
        );


    document.getElementById(
        "missionDistanceBar"
    ).style.width =
        distanceProgress + "%";


    document.getElementById(
        "missionCoinsBar"
    ).style.width =
        coinsProgress + "%";


    document.getElementById(
        "missionFuelBar"
    ).style.width =
        fuelProgress + "%";


    document.getElementById(
        "missionDistanceText"
    ).textContent =
        `${Math.min(
            missionData.distance,
            1000
        )} / 1000 m`;


    document.getElementById(
        "missionCoinsText"
    ).textContent =
        `${Math.min(
            missionData.coins,
            25
        )} / 25`;


    document.getElementById(
        "missionFuelText"
    ).textContent =
        `${Math.min(
            missionData.fuel,
            3
        )} / 3`;


    document.getElementById(
        "missionDistanceStatus"
    ).textContent =
        missionData.distance >= 1000
            ? "✓"
            : Math.floor(
                distanceProgress
            ) + "%";


    document.getElementById(
        "missionCoinsStatus"
    ).textContent =
        missionData.coins >= 25
            ? "✓"
            : Math.floor(
                coinsProgress
            ) + "%";


    document.getElementById(
        "missionFuelStatus"
    ).textContent =
        missionData.fuel >= 3
            ? "✓"
            : Math.floor(
                fuelProgress
            ) + "%";


    document.getElementById(
        "missionLivesText"
    ).textContent =
        missionData.survivor
            ? "Completed"
            : "Not completed";


    document.getElementById(
        "missionLivesStatus"
    ).textContent =
        missionData.survivor
            ? "✓"
            : "0%";


    const cards =
        document.querySelectorAll(
            ".mission-card"
        );


    cards[0].classList.toggle(
        "completed",
        missionData.distance >= 1000
    );


    cards[1].classList.toggle(
        "completed",
        missionData.coins >= 25
    );


    cards[2].classList.toggle(
        "completed",
        missionData.fuel >= 3
    );


    cards[3].classList.toggle(
        "completed",
        missionData.survivor
    );


    let completed = 0;


    if (
        missionData.distance >= 1000
    ) completed++;


    if (
        missionData.coins >= 25
    ) completed++;


    if (
        missionData.fuel >= 3
    ) completed++;


    if (
        missionData.survivor
    ) completed++;


    document.getElementById(
        "missionCompleted"
    ).textContent =
        completed;

}


function checkMissionRewards() {

    let rewardGiven =
        false;


    if (
        missionData.distance >= 1000 &&
        !missionData.distanceClaimed
    ) {

        totalCoins += 30;

        missionData.distanceClaimed =
            true;

        rewardGiven =
            true;

    }


    if (
        missionData.coins >= 25 &&
        !missionData.coinsClaimed
    ) {

        totalCoins += 40;

        missionData.coinsClaimed =
            true;

        rewardGiven =
            true;

    }


    if (
        missionData.fuel >= 3 &&
        !missionData.fuelClaimed
    ) {

        totalCoins += 35;

        missionData.fuelClaimed =
            true;

        rewardGiven =
            true;

    }


    if (
        missionData.survivor &&
        !missionData.survivorClaimed
    ) {

        totalCoins += 50;

        missionData.survivorClaimed =
            true;

        rewardGiven =
            true;

    }


    if (
        rewardGiven
    ) {

        localStorage.setItem(
            "phd_totalCoins",
            totalCoins
        );

    }


    saveMissions();

    updateMenuStats();

}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

let achievements =
    JSON.parse(
        localStorage.getItem(
            "phd_achievements"
        ) ||
        JSON.stringify({

            distance1000: false,

            distance5000: false,

            distance10000: false,

            coins100: false,

            vehicles: false,

            upgrade: false

        })
    );


function saveAchievements() {

    localStorage.setItem(
        "phd_achievements",
        JSON.stringify(
            achievements
        )
    );

}


function unlockAchievement(
    key,
    elementId,
    title,
    reward
) {

    if (
        achievements[key]
    ) {
        return;
    }


    achievements[key] =
        true;


    totalCoins +=
        reward;


    saveAll();


    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.classList.add(
            "unlocked"
        );

    }


    playTone(
        700,
        0.1,
        "triangle",
        0.06
    );


    setTimeout(
        () => playTone(
            1000,
            0.1,
            "triangle",
            0.05
        ),
        100
    );


    setTimeout(
        () => playTone(
            1400,
            0.15,
            "triangle",
            0.05
        ),
        200
    );


    alert(
        `🏆 ACHIEVEMENT UNLOCKED!\n\n${title}\n+${reward} Coins`
    );

}


function updateAchievements() {

    if (
        bestDistance >= 1000
    ) {

        unlockAchievement(
            "distance1000",
            "achievement1000",
            "Rookie",
            20
        );

    }


    if (
        bestDistance >= 5000
    ) {

        unlockAchievement(
            "distance5000",
            "achievement5000",
            "Driver",
            50
        );

    }


    if (
        bestDistance >= 10000
    ) {

        unlockAchievement(
            "distance10000",
            "achievement10000",
            "Champion",
            100
        );

    }


    if (
        totalCoins >= 100
    ) {

        unlockAchievement(
            "coins100",
            "achievementCoins100",
            "Collector",
            50
        );

    }


    if (
        unlockedVehicles.length >= 3
    ) {

        unlockAchievement(
            "vehicles",
            "achievementVehicles",
            "Garage King",
            75
        );

    }


    const maxUpgrade =
        Math.max(
            upgrades.engine,
            upgrades.tire,
            upgrades.fuel,
            upgrades.speed
        );


    if (
        maxUpgrade >= 5
    ) {

        unlockAchievement(
            "upgrade",
            "achievementUpgrade",
            "Mechanic",
            75
        );

    }


    let count = 0;


    Object.values(
        achievements
    ).forEach(
        value => {

            if (value) {
                count++;
            }

        }
    );


    document.getElementById(
        "achievementCompleted"
    ).textContent =
        count;


    const map = {

        distance1000:
            "achievement1000",

        distance5000:
            "achievement5000",

        distance10000:
            "achievement10000",

        coins100:
            "achievementCoins100",

        vehicles:
            "achievementVehicles",

        upgrade:
            "achievementUpgrade"

    };


    Object.keys(
        achievements
    ).forEach(
        key => {

            if (
                achievements[key]
            ) {

                document.getElementById(
                    map[key]
                ).classList.add(
                    "unlocked"
                );

            }

        }
    );

}


/* =========================================================
   DAILY REWARD
========================================================= */

const DAILY_REWARD =
    20;


let dailyLastClaim =
    localStorage.getItem(
        "phd_dailyLastClaim"
    ) || "";


let dailyStreak =
    Number(
        localStorage.getItem(
            "phd_dailyStreak"
        ) || 0
    );


const dailyRewardBtn =
    document.getElementById(
        "dailyRewardBtn"
    );


const dailyStatus =
    document.getElementById(
        "dailyStatus"
    );


function getTodayKey() {

    const d =
        new Date();


    return (
        d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            d.getDate()
        ).padStart(2, "0")
    );

}


function getYesterdayKey() {

    const d =
        new Date();


    d.setDate(
        d.getDate() - 1
    );


    return (
        d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            d.getDate()
        ).padStart(2, "0")
    );

}


function updateDailyRewardUI() {

    const today =
        getTodayKey();


    if (
        dailyLastClaim === today
    ) {

        dailyRewardBtn.textContent =
            "CLAIMED";


        dailyRewardBtn.classList.add(
            "claimed"
        );


        dailyRewardBtn.disabled =
            true;


        dailyStatus.textContent =
            `🔥 Day ${dailyStreak} • Come back tomorrow`;

    } else {

        dailyRewardBtn.textContent =
            "CLAIM";


        dailyRewardBtn.classList.remove(
            "claimed"
        );


        dailyRewardBtn.disabled =
            false;


        dailyStatus.textContent =
            `${DAILY_REWARD} Coins Available • Day ${dailyStreak + 1}`;

    }

}


dailyRewardBtn.addEventListener(
    "click",
    () => {

        const today =
            getTodayKey();


        if (
            dailyLastClaim === today
        ) {
            return;
        }


        if (
            dailyLastClaim ===
            getYesterdayKey()
        ) {

            dailyStreak++;

        } else {

            dailyStreak =
                1;

        }


        const reward =
            DAILY_REWARD +
            Math.min(
                (
                    dailyStreak - 1
                ) * 5,
                30
            );


        totalCoins +=
            reward;


        dailyLastClaim =
            today;


        saveAll();


        updateMenuStats();


        playTone(
            800,
            0.08,
            "triangle",
            0.06
        );


        setTimeout(
            () =>
                playTone(
                    1100,
                    0.1,
                    "triangle",
                    0.05
                ),
            100
        );


        alert(
            `🎁 DAILY REWARD!\n\n+${reward} Coins\n🔥 Day ${dailyStreak} Streak`
        );

    }
);


/* =========================================================
   SOUND
========================================================= */

let soundEnabled =
    localStorage.getItem(
        "phd_sound"
    ) !== "false";


let audioCtx = null;

let engineOscillator = null;

let engineGain = null;


function initAudio() {

    if (
        !soundEnabled
    ) {
        return;
    }


    if (
        !audioCtx
    ) {

        audioCtx =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if (
        audioCtx.state ===
        "suspended"
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

    if (
        !soundEnabled
    ) {
        return;
    }


    initAudio();


    if (
        !audioCtx
    ) {
        return;
    }


    const oscillator =
        audioCtx.createOscillator();


    const gain =
        audioCtx.createGain();


    oscillator.type =
        type;


    oscillator.frequency.value =
        frequency;


    gain.gain.setValueAtTime(
        volume,
        audioCtx.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime +
        duration
    );


    oscillator.connect(
        gain
    );


    gain.connect(
        audioCtx.destination
    );


    oscillator.start();


    oscillator.stop(
        audioCtx.currentTime +
        duration
    );

}


function startEngineSound() {

    if (
        !soundEnabled ||
        engineOscillator
    ) {
        return;
    }


    initAudio();


    if (
        !audioCtx
    ) {
        return;
    }


    engineOscillator =
        audioCtx.createOscillator();


    engineGain =
        audioCtx.createGain();


    engineOscillator.type =
        "sawtooth";


    engineOscillator.frequency.value =
        70;


    engineGain.gain.value =
        0.018;


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
    ) {
        return;
    }


    const nitroBonus =
        nitroActive
            ? 35
            : 0;


    engineOscillator.frequency.linearRampToValueAtTime(
        60 +
        Math.abs(speed) * 18 +
        nitroBonus,
        audioCtx.currentTime +
        0.08
    );

}


function stopEngineSound() {

    if (
        engineOscillator
    ) {

        try {

            engineOscillator.stop();

        } catch (e) {}


        engineOscillator =
            null;


        engineGain =
            null;

    }

}


function updateSoundButton() {

    soundBtn.textContent =
        soundEnabled
            ? "🔊"
            : "🔇";

}


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


        if (
            soundEnabled
        ) {

            startEngineSound();

        } else {

            stopEngineSound();

        }

    }
);


updateSoundButton();


/* =========================================================
   GAME STATE
========================================================= */

let running =
    false;

let paused =
    false;

let gameOver =
    false;

let countdownRunning =
    false;


let distance =
    0;

let runCoins =
    0;

let fuel =
    100;

let lives =
    3;


let speed =
    0;

let carX =
    220;

let carY =
    300;

let carVelocityY =
    0;

let carAngle =
    0;

let cameraX =
    0;


let gasPressed =
    false;

let brakePressed =
    false;

let nitroPressed =
    false;


/* =========================================================
   POWER-UP STATE
========================================================= */

let nitroActive =
    false;

let nitroTimer =
    0;


let magnetActive =
    false;

let magnetTimer =
    0;


let shieldActive =
    false;


/* =========================================================
   WORLD
========================================================= */

let terrain = [];

let coins = [];

let fuelItems = [];

let obstacles = [];

let powerUps = [];


/* =========================================================
   POWER-UP TYPES
========================================================= */

const POWER_UP_TYPES = {

    nitro: {
        name: "NITRO",
        emoji: "⚡",
        duration: 5
    },

    magnet: {
        name: "MAGNET",
        emoji: "🧲",
        duration: 8
    },

    shield: {
        name: "SHIELD",
        emoji: "🛡️",
        duration: 0
    }

};


/* =========================================================
   TERRAIN
========================================================= */

function generateTerrain() {

    terrain = [];


    const step =
        70;


    let y =
        H * 0.68;


    let slope =
        0;


    for (
        let x = -500;
        x < 30000;
        x += step
    ) {

        slope +=
            (
                Math.random() -
                0.5
            ) * 0.22;


        slope *=
            0.92;


        slope =
            Math.max(
                -0.65,
                Math.min(
                    0.65,
                    slope
                )
            );


        y +=
            slope * 15;


        y +=
            Math.sin(
                x * 0.006
            ) * 2;


        y =
            Math.max(
                H * 0.42,
                Math.min(
                    H * 0.82,
                    y
                )
            );


        terrain.push({
            x: x,
            y: y
        });

    }

}


function getGroundY(
    x
) {

    if (
        !terrain.length
    ) {
        return H * 0.68;
    }


    if (
        x <= terrain[0].x
    ) {

        return terrain[0].y;

    }


    for (
        let i = 0;
        i <
        terrain.length - 1;
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
                (
                    x - a.x
                ) /
                (
                    b.x - a.x
                );


            return (
                a.y +
                (
                    b.y - a.y
                ) * t
            );

        }

    }


    return terrain[
        terrain.length - 1
    ].y;

}


function getGroundAngle(
    x
) {

    const delta =
        5;


    const y1 =
        getGroundY(
            x - delta
        );


    const y2 =
        getGroundY(
            x + delta
        );


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

    powerUps = [];


    /* COINS */

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
                Math.random() *
                Math.PI * 2

        });

    }


    /* FUEL */

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


    /* OBSTACLES */

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


    /* POWER-UPS */

    let powerIndex =
        0;


    for (
        let x = 1600;
        x < 28000;
        x +=
            1300 +
            Math.random() * 1300
    ) {

        const types = [
            "nitro",
            "magnet",
            "shield"
        ];


        const type =
            types[
                powerIndex %
                types.length
            ];


        powerIndex++;


        powerUps.push({

            x:
                x +
                Math.random() * 400,

            y:
                getGroundY(x) - 85,

            type:
                type,

            collected:
                false,

            rotation:
                Math.random() *
                Math.PI * 2

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


    distance =
        0;


    runCoins =
        0;


    fuel =
        100 +
        (
            upgrades.fuel - 1
        ) * 20;


    lives =
        3;


    speed =
        0;


    carVelocityY =
        0;


    carX =
        220;


    cameraX =
        0;


    nitroActive =
        false;

    nitroTimer =
        0;

    magnetActive =
        false;

    magnetTimer =
        0;

    shieldActive =
        false;


    missionRun.coins =
        0;

    missionRun.fuel =
        0;


    generateTerrain();

    generateItems();


    carY =
        getGroundY(
            carX
        ) - 45;


    carAngle =
        getGroundAngle(
            carX
        );


    running =
        true;

    paused =
        false;

    gameOver =
        false;


    gasPressed =
        false;

    brakePressed =
        false;

    nitroPressed =
        false;


    menu.style.display =
        "none";


    hud.style.display =
        "flex";


    controls.style.display =
        "flex";


    pauseScreen.style.display =
        "none";


    distanceEl.textContent =
        "0";


    coinsEl.textContent =
        "0";


    fuelEl.textContent =
        Math.round(
            fuel
        );


    livesEl.textContent =
        lives;


    updatePowerStatus();


    startCountdown();

}


/* =========================================================
   COUNTDOWN
========================================================= */

function startCountdown() {

    countdownRunning =
        true;


    countdownEl.style.display =
        "flex";


    const numbers = [
        "3",
        "2",
        "1",
        "GO!"
    ];


    let index =
        0;


    function next() {

        if (
            !running
        ) {

            countdownRunning =
                false;

            countdownEl.style.display =
                "none";

            return;

        }


        countdownEl.textContent =
            numbers[index];


        playTone(
            index === 3
                ? 900
                : 500,
            0.1,
            "square",
            0.05
        );


        index++;


        if (
            index >=
            numbers.length
        ) {

            setTimeout(
                () => {

                    countdownEl.style.display =
                        "none";

                    countdownRunning =
                        false;

                    startEngineSound();

                },
                500
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
   INPUT
========================================================= */

window.addEventListener(
    "keydown",
    e => {

        if (
            e.code ===
            "ArrowRight" ||
            e.code ===
            "KeyD"
        ) {

            gasPressed =
                true;

        }


        if (
            e.code ===
            "ArrowLeft" ||
            e.code ===
            "KeyA"
        ) {

            brakePressed =
                true;

        }


        if (
            e.code ===
            "KeyN"
        ) {

            nitroPressed =
                true;

        }


        if (
            e.code ===
            "KeyP" ||
            e.code ===
            "Escape"
        ) {

            togglePause();

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
            "KeyD"
        ) {

            gasPressed =
                false;

        }


        if (
            e.code ===
            "ArrowLeft" ||
            e.code ===
            "KeyA"
        ) {

            brakePressed =
                false;

        }


        if (
            e.code ===
            "KeyN"
        ) {

            nitroPressed =
                false;

        }

    }
);


/* =========================================================
   MOBILE BUTTON
========================================================= */

function setupHoldButton(
    button,
    setter
) {

    const start =
        e => {

            e.preventDefault();

            setter(true);

        };


    const end =
        e => {

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
        gasPressed =
            value;
    }
);


setupHoldButton(
    brakeBtn,
    value => {
        brakePressed =
            value;
    }
);


setupHoldButton(
    nitroBtn,
    value => {
        nitroPressed =
            value;
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

        paused =
            false;


        pauseScreen.style.display =
            "none";


        startEngineSound();

    }
);


quitBtn.addEventListener(
    "click",
    () => {

        running =
            false;


        paused =
            false;


        stopEngineSound();


        hud.style.display =
            "none";


        controls.style.display =
            "none";


        pauseScreen.style.display =
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


    if (
        paused
    ) {

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
   POWER-UP UPDATE
========================================================= */

function updatePowerUps(
    dt
) {

    /* NITRO */

    if (
        nitroPressed &&
        fuel > 0 &&
        !nitroActive
    ) {

        nitroActive =
            true;

        nitroTimer =
            4;

        playTone(
            350,
            0.1,
            "sawtooth",
            0.05
        );

    }


    if (
        nitroActive
    ) {

        nitroTimer -=
            dt / 60;


        if (
            nitroTimer <= 0
        ) {

            nitroActive =
                false;

            nitroTimer =
                0;

        }

    }


    /* MAGNET */

    if (
        magnetActive
    ) {

        magnetTimer -=
            dt / 60;


        if (
            magnetTimer <= 0
        ) {

            magnetActive =
                false;

            magnetTimer =
                0;

        }

    }


    updatePowerStatus();

}


/* =========================================================
   POWER STATUS
========================================================= */

function updatePowerStatus() {

    const active = [];


    if (
        nitroActive
    ) {

        active.push(
            `⚡ ${nitroTimer.toFixed(1)}s`
        );

    }


    if (
        magnetActive
    ) {

        active.push(
            `🧲 ${magnetTimer.toFixed(1)}s`
        );

    }


    if (
        shieldActive
    ) {

        active.push(
            "🛡️ READY"
        );

    }


    if (
        active.length === 0
    ) {

        powerStatus.textContent =
            "No Power-Up";

    } else {

        powerStatus.textContent =
            active.join(
                "  "
            );

    }

}


/* =========================================================
   PHYSICS
========================================================= */

function updatePhysics(
    dt
) {

    const vehicle =
        vehicles[selectedVehicle];


    updatePowerUps(
        dt
    );


    const enginePower =
        1 +
        (
            upgrades.engine - 1
        ) * 0.16;


    const speedPower =
        1 +
        (
            upgrades.speed - 1
        ) * 0.13;


    const tireGrip =
        vehicle.grip +
        (
            upgrades.tire - 1
        ) * 0.012;


    let maxSpeed =
        vehicle.maxSpeed *
        speedPower;


    const acceleration =
        vehicle.acceleration *
        enginePower;


    /* NITRO */

    if (
        nitroActive
    ) {

        maxSpeed *=
            1.65;

    }


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
            (
                1 -
                (
                    upgrades.fuel - 1
                ) * 0.025
            );

    } else {

        speed *=
            Math.pow(
                0.985,
                dt
            );

    }


    /* NITRO FUEL */

    if (
        nitroActive &&
        fuel > 0
    ) {

        speed +=
            0.18 *
            dt;


        fuel -=
            0.025 *
            dt;

    }


    if (
        brakePressed
    ) {

        speed -=
            0.32 *
            dt;

    }


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


    const groundY =
        getGroundY(
            carX
        );


    const targetY =
        groundY -
        vehicle.height;


    if (
        carY >=
        targetY
    ) {

        carY =
            targetY;

        carVelocityY =
            0;

    }


    /* ANGLE */

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
        ) * 0.08;


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


    /* MISSION */

    if (
        distance >
        missionData.distance
    ) {

        missionData.distance =
            distance;

        saveMissions();

    }


    /* FUEL */

    fuel =
        Math.max(
            0,
            fuel
        );


    distanceEl.textContent =
        distance;


    coinsEl.textContent =
        runCoins;


    const maxFuel =
        100 +
        (
            upgrades.fuel - 1
        ) * 20;


    fuelEl.textContent =
        Math.round(
            fuel /
            maxFuel *
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


    checkMissionRewards();


    updateEngineSound();

}


/* =========================================================
   ITEM COLLISION
========================================================= */

function checkItems() {

    /* COINS */

    coins.forEach(
        coin => {

            if (
                coin.collected
            ) {
                return;
            }


            let dx =
                carX -
                coin.x;


            let dy =
                carY -
                coin.y;


            let d =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            /* MAGNET */

            if (
                magnetActive &&
                d < 180
            ) {

                coin.x +=
                    (
                        carX -
                        coin.x
                    ) * 0.08;


                coin.y +=
                    (
                        carY -
                        coin.y
                    ) * 0.08;


                dx =
                    carX -
                    coin.x;


                dy =
                    carY -
                    coin.y;


                d =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

            }


            if (
                d < 50
            ) {

                coin.collected =
                    true;


                runCoins++;

                missionRun.coins++;


                if (
                    missionRun.coins >
                    missionData.coins
                ) {

                    missionData.coins =
                        missionRun.coins;

                }


                totalCoins++;


                saveAll();


                coinsEl.textContent =
                    runCoins;


                menuCoins.textContent =
                    totalCoins;


                playTone(
                    900,
                    0.07,
                    "triangle",
                    0.06
                );


                setTimeout(
                    () =>
                        playTone(
                            1300,
                            0.08,
                            "triangle",
                            0.05
                        ),
                    60
                );


                updateMissionUI();

                checkMissionRewards();

                updateAchievements();

            }

        }
    );


    /* FUEL */

    fuelItems.forEach(
        item => {

            if (
                item.collected
            ) {
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


            if (
                d < 55
            ) {

                item.collected =
                    true;


                missionRun.fuel++;


                if (
                    missionRun.fuel >
                    missionData.fuel
                ) {

                    missionData.fuel =
                        missionRun.fuel;

                }


                const maxFuel =
                    100 +
                    (
                        upgrades.fuel - 1
                    ) * 20;


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


                saveMissions();

                updateMissionUI();

                checkMissionRewards();

            }

        }
    );


    /* POWER-UPS */

    powerUps.forEach(
        power => {

            if (
                power.collected
            ) {
                return;
            }


            const dx =
                carX -
                power.x;


            const dy =
                carY -
                power.y;


            const d =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                d < 60
            ) {

                collectPowerUp(
                    power
                );

            }

        }
    );

}


/* =========================================================
   COLLECT POWER-UP
========================================================= */

function collectPowerUp(
    power
) {

    power.collected =
        true;


    const type =
        POWER_UP_TYPES[
            power.type
        ];


    if (
        power.type ===
        "nitro"
    ) {

        nitroActive =
            true;

        nitroTimer =
            type.duration;

    }


    if (
        power.type ===
        "magnet"
    ) {

        magnetActive =
            true;

        magnetTimer =
            type.duration;

    }


    if (
        power.type ===
        "shield"
    ) {

        shieldActive =
            true;

    }


    updatePowerStatus();


    playTone(
        700,
        0.1,
        "triangle",
        0.06
    );


    setTimeout(
        () =>
            playTone(
                1200,
                0.12,
                "triangle",
                0.05
            ),
        100
    );

}


/* =========================================================
   OBSTACLES
========================================================= */

function checkObstacles() {

    const vehicle =
        vehicles[selectedVehicle];


    obstacles.forEach(
        obstacle => {

            if (
                obstacle.hit
            ) {
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
                vehicle.width *
                0.45 +
                obstacle.width *
                0.45
                &&
                dy <
                vehicle.height *
                0.55 +
                obstacle.height *
                0.55
            ) {

                obstacle.hit =
                    true;


                if (
                    shieldActive
                ) {

                    shieldActive =
                        false;


                    speed *=
                        0.7;


                    carVelocityY =
                        -3;


                    updatePowerStatus();


                    playTone(
                        450,
                        0.15,
                        "triangle",
                        0.06
                    );


                    return;

                }


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


    speed *=
        0.3;


    carVelocityY =
        -6;


    if (
        lives <= 0
    ) {

        setTimeout(
            endGame,
            500
        );

    }

}


/* =========================================================
   END GAME
========================================================= */

function endGame() {

    if (
        gameOver
    ) {
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


    nitroPressed =
        false;


    stopEngineSound();


    if (
        lives === 3
    ) {

        missionData.survivor =
            true;


        saveMissions();

        updateMissionUI();

    }


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


    checkMissionRewards();

    updateAchievements();


    setTimeout(
        showGameOver,
        450
    );

}


/* =========================================================
   GAME OVER
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

        </div>

        <div class="stat-box">
            🏆 BEST DISTANCE

            <strong>
                ${bestDistance} m
            </strong>
        </div>

        <div class="stat-box"
             style="width:100%;margin-top:10px;">

            🪙 TOTAL COINS

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
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    );
                color:white;
                font-size:15px;
                font-weight:800;
                cursor:pointer;
            "
        >
            🏠 GARAGE
        </button>

    `;


    document.getElementById(
        "restartBtn"
    ).addEventListener(
        "click",
        () => {

            location.reload();

        }
    );


    document.getElementById(
        "menuBtn"
    ).addEventListener(
        "click",
        () => {

            location.reload();

        }
    );

}


/* =========================================================
   VEHICLE UI
========================================================= */

function updateVehicleUI() {

    document
        .querySelectorAll(
            ".vehicle-card"
        )
        .forEach(
            card => {

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
                    type ===
                    selectedVehicle
                );


                card.classList.toggle(
                    "locked",
                    !unlocked
                );


                if (
                    !unlocked
                ) {

                    status.textContent =
                        `🔒 ${vehicles[type].price} COINS`;

                } else if (
                    type ===
                    selectedVehicle
                ) {

                    status.textContent =
                        "SELECTED";

                } else {

                    status.textContent =
                        "SELECT";

                }

            }
        );

}


document
    .querySelectorAll(
        ".vehicle-card"
    )
    .forEach(
        card => {

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
                                `You need ${vehicle.price} coins to unlock ${vehicle.name}.`
                            );


                            return;

                        }


                        const confirmed =
                            confirm(
                                `Unlock ${vehicle.name} for ${vehicle.price} coins?`
                            );


                        if (
                            !confirmed
                        ) {
                            return;
                        }


                        totalCoins -=
                            vehicle.price;


                        unlockedVehicles.push(
                            type
                        );


                        saveAll();

                    }


                    selectedVehicle =
                        type;


                    localStorage.setItem(
                        "phd_selectedVehicle",
                        selectedVehicle
                    );


                    updateMenuStats();

                    updateAchievements();

                }
            );

        }
    );


/* =========================================================
   SAVE ALL
========================================================= */

function saveAll() {

    localStorage.setItem(
        "phd_totalCoins",
        totalCoins
    );


    localStorage.setItem(
        "phd_bestDistance",
        bestDistance
    );


    localStorage.setItem(
        "phd_unlockedVehicles",
        JSON.stringify(
            unlockedVehicles
        )
    );


    localStorage.setItem(
        "phd_selectedVehicle",
        selectedVehicle
    );


    saveUpgrades();

    saveMissions();

    saveAchievements();


    localStorage.setItem(
        "phd_dailyLastClaim",
        dailyLastClaim
    );


    localStorage.setItem(
        "phd_dailyStreak",
        dailyStreak
    );

}


/* =========================================================
   MENU UPDATE
========================================================= */

function updateMenuStats() {

    menuCoins.textContent =
        totalCoins;


    menuBestScore.textContent =
        bestDistance;


    updateGarageUI();

    updateVehicleUI();

    updateDailyRewardUI();

    updateMissionUI();

    updateAchievements();

}


updateMenuStats();


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
        x <
        W +
        cameraX +
        1000;
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
        W +
        cameraX +
        1000,
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

    if (
        !terrain.length
    ) {
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
            H * 0.45,
            0,
            H
        );


    gradient.addColorStop(
        0,
        "#4caf50"
    );


    gradient.addColorStop(
        0.12,
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
        (point, index) => {

            if (
                index === 0
            ) {

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


    ctx.lineWidth =
        8;


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

            if (
                coin.collected
            ) {
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


    /* MAGNET RANGE */

    if (
        magnetActive
    ) {

        ctx.beginPath();


        ctx.arc(
            carX,
            carY,
            180,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "rgba(0,150,255,0.22)";


        ctx.lineWidth =
            3;


        ctx.stroke();

    }


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

            if (
                item.collected
            ) {
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
   POWER-UPS DRAW
========================================================= */

function drawPowerUps() {

    ctx.save();


    ctx.translate(
        -cameraX,
        0
    );


    powerUps.forEach(
        power => {

            if (
                power.collected
            ) {
                return;
            }


            power.rotation +=
                0.04;


            const type =
                POWER_UP_TYPES[
                    power.type
                ];


            ctx.save();


            ctx.translate(
                power.x,
                power.y
            );


            const floatY =
                Math.sin(
                    power.rotation * 2
                ) * 6;


            ctx.translate(
                0,
                floatY
            );


            ctx.beginPath();


            ctx.arc(
                0,
                0,
                23,
                0,
                Math.PI * 2
            );


            if (
                power.type ===
                "nitro"
            ) {

                ctx.fillStyle =
                    "rgba(33,150,243,0.82)";

            }


            if (
                power.type ===
                "magnet"
            ) {

                ctx.fillStyle =
                    "rgba(156,39,176,0.82)";

            }


            if (
                power.type ===
                "shield"
            ) {

                ctx.fillStyle =
                    "rgba(0,200,83,0.82)";

            }


            ctx.fill();


            ctx.strokeStyle =
                "rgba(255,255,255,0.85)";


            ctx.lineWidth =
                3;


            ctx.stroke();


            ctx.font =
                "22px Arial";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillStyle =
                "white";


            ctx.fillText(
                type.emoji,
                0,
                1
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

            if (
                obstacle.hit
            ) {
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


    /* SHIELD */

    if (
        shieldActive
    ) {

        ctx.beginPath();


        ctx.arc(
            0,
            -20,
            vehicle.width * 0.72,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "rgba(0,230,118,0.75)";


        ctx.lineWidth =
            5;


        ctx.stroke();

    }


    /* NITRO GLOW */

    if (
        nitroActive
    ) {

        ctx.beginPath();


        ctx.moveTo(
            -vehicle.width * 0.42,
            -10
        );


        ctx.lineTo(
            -vehicle.width * 0.72,
            -3
        );


        ctx.lineTo(
            -vehicle.width * 0.42,
            5
        );


        ctx.closePath();


        ctx.fillStyle =
            "#ff9800";


        ctx.fill();

    }


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


    let bodyColor =
        "#e53935";


    if (
        selectedVehicle ===
        "suv"
    ) {

        bodyColor =
            "#1565c0";

    }


    if (
        selectedVehicle ===
        "bike"
    ) {

        bodyColor =
            "#212121";


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


    ctx.strokeStyle =
        bodyColor;


    ctx.lineWidth =
        7;


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
   LIVES
========================================================= */

function drawLivesOnCanvas() {

    if (
        !running
    ) {
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
            i < lives
                ? 1
                : 0.25;


        ctx.font =
            "22px Arial";


        ctx.fillText(
            "❤️",
            20 +
            i * 27,
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

    drawPowerUps();

    drawObstacles();

    drawCar();

    drawLivesOnCanvas();

}


/* =========================================================
   GAME LOOP
========================================================= */

let lastTime =
    0;


function gameLoop(
    timestamp
) {

    if (
        !lastTime
    ) {

        lastTime =
            timestamp;

    }


    let dt =
        (
            timestamp -
            lastTime
        ) / 16.67;


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

        updatePhysics(
            dt
        );

    }


    draw();


    requestAnimationFrame(
        gameLoop
    );

}


requestAnimationFrame(
    gameLoop
);
