/* =========================================================
   PRIYANSHU HILL DRIVE
   STEP 9
   MISSIONS + ACHIEVEMENTS + DAILY REWARDS
========================================================= */


/* =========================================================
   ELEMENTS
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


const toast =
    document.getElementById("toast");

const toastIcon =
    document.getElementById("toastIcon");

const toastText =
    document.getElementById("toastText");


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
        Math.floor(W * dpr);

    canvas.height =
        Math.floor(H * dpr);


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


let selectedVehicle =
    localStorage.getItem(
        "phd_selectedVehicle"
    ) || "car";


/* =========================================================
   SAVE DATA
========================================================= */

let unlockedVehicles;


try {

    unlockedVehicles =
        JSON.parse(
            localStorage.getItem(
                "phd_unlockedVehicles"
            ) || '["car"]'
        );

} catch (e) {

    unlockedVehicles =
        ["car"];

}


if (!Array.isArray(unlockedVehicles)) {

    unlockedVehicles =
        ["car"];

}


if (!unlockedVehicles.includes("car")) {

    unlockedVehicles.unshift("car");

}


/* =========================================================
   UPGRADES
========================================================= */

let upgrades;


try {

    upgrades =
        JSON.parse(
            localStorage.getItem(
                "phd_upgrades"
            ) ||
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


upgrades.engine =
    Math.max(
        1,
        Math.min(
            5,
            Number(upgrades.engine) || 1
        )
    );


upgrades.tire =
    Math.max(
        1,
        Math.min(
            5,
            Number(upgrades.tire) || 1
        )
    );


upgrades.fuel =
    Math.max(
        1,
        Math.min(
            5,
            Number(upgrades.fuel) || 1
        )
    );


upgrades.speed =
    Math.max(
        1,
        Math.min(
            5,
            Number(upgrades.speed) || 1
        )
    );


function saveUpgrades() {

    localStorage.setItem(
        "phd_upgrades",
        JSON.stringify(upgrades)
    );

}


/* =========================================================
   COINS
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


menuCoins.textContent =
    totalCoins;


menuBestScore.textContent =
    bestDistance;


/* =========================================================
   STEP 9 MISSIONS
========================================================= */

let missionData;


try {

    missionData =
        JSON.parse(
            localStorage.getItem(
                "phd_missions"
            ) ||
            '{"distance":0,"coins":0,"fuel":0,"survivor":0}'
        );

} catch (e) {

    missionData = {

        distance: 0,

        coins: 0,

        fuel: 0,

        survivor: 0

    };

}


missionData.distance =
    Number(missionData.distance) || 0;

missionData.coins =
    Number(missionData.coins) || 0;

missionData.fuel =
    Number(missionData.fuel) || 0;

missionData.survivor =
    Number(missionData.survivor) || 0;


let missionClaimed;


try {

    missionClaimed =
        JSON.parse(
            localStorage.getItem(
                "phd_missionClaimed"
            ) ||
            '{"distance":false,"coins":false,"fuel":false,"survivor":false}'
        );

} catch (e) {

    missionClaimed = {

        distance: false,

        coins: false,

        fuel: false,

        survivor: false

    };

}


function saveMissions() {

    localStorage.setItem(
        "phd_missions",
        JSON.stringify(
            missionData
        )
    );


    localStorage.setItem(
        "phd_missionClaimed",
        JSON.stringify(
            missionClaimed
        )
    );

}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

let achievements;


try {

    achievements =
        JSON.parse(
            localStorage.getItem(
                "phd_achievements"
            ) ||
            "{}"
        );

} catch (e) {

    achievements = {};

}


const achievementRewards = {

    firstDrive: 20,

    distance1000: 40,

    coins100: 50,

    vehicle: 50,

    upgrade: 75

};


function saveAchievements() {

    localStorage.setItem(
        "phd_achievements",
        JSON.stringify(
            achievements
        )
    );

}


/* =========================================================
   DAILY REWARD
========================================================= */

const rewardAmounts = [

    25,

    35,

    50,

    65,

    80,

    100,

    150

];


let rewardDay =
    Number(
        localStorage.getItem(
            "phd_rewardDay"
        ) || 1
    );


let lastRewardDate =
    localStorage.getItem(
        "phd_lastRewardDate"
    ) || "";


function getTodayKey() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


function getYesterdayKey() {

    const date =
        new Date();


    date.setDate(
        date.getDate() - 1
    );


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/* Reset streak if a day was missed */

if (
    lastRewardDate &&
    lastRewardDate !== getTodayKey() &&
    lastRewardDate !== getYesterdayKey()
) {

    rewardDay = 1;

    localStorage.setItem(
        "phd_rewardDay",
        rewardDay
    );

}


/* =========================================================
   SOUND
========================================================= */

let soundEnabled =
    localStorage.getItem(
        "phd_sound"
    ) !== "false";


let audioCtx =
    null;

let engineOscillator =
    null;

let engineGain =
    null;


function initAudio() {

    if (!soundEnabled) {
        return;
    }


    if (!audioCtx) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (AudioContext) {

            audioCtx =
                new AudioContext();

        }

    }


    if (
        audioCtx &&
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

    if (!soundEnabled) {
        return;
    }


    initAudio();


    if (!audioCtx) {
        return;
    }


    try {

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


        oscillator.connect(gain);

        gain.connect(
            audioCtx.destination
        );


        oscillator.start();


        oscillator.stop(
            audioCtx.currentTime +
            duration
        );

    } catch (e) {}

}


function startEngineSound() {

    if (!soundEnabled) {
        return;
    }


    initAudio();


    if (
        !audioCtx ||
        engineOscillator
    ) {
        return;
    }


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

        engineOscillator.frequency.linearRampToValueAtTime(

            60 +
            Math.abs(speed) * 18,

            audioCtx.currentTime +
            0.08

        );

    } catch (e) {}

}


function stopEngineSound() {

    if (engineOscillator) {

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


updateSoundButton();


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

            if (
                running &&
                !paused
            ) {

                startEngineSound();

            }

        } else {

            stopEngineSound();

        }

    }
);


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

let runFuelCollected =
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


let lastTime =
    0;


let terrain =
    [];

let coinItems =
    [];

let fuelItems =
    [];

let obstacles =
    [];


/* =========================================================
   TOAST
========================================================= */

let toastTimer =
    null;


function showToast(
    icon,
    message
) {

    toastIcon.textContent =
        icon;

    toastText.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   MENU TABS
========================================================= */

document
    .querySelectorAll(".menu-tab")
    .forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function () {

                    const target =
                        tab.dataset.panel;


                    document
                        .querySelectorAll(
                            ".menu-tab"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    document
                        .querySelectorAll(
                            ".menu-panel"
                        )
                        .forEach(
                            function (panel) {

                                panel.classList.remove(
                                    "active"
                                );

                            }
                        );


                    tab.classList.add(
                        "active"
                    );


                    const panel =
                        document.getElementById(
                            target
                        );


                    if (panel) {

                        panel.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   GARAGE
========================================================= */

function getUpgradeCost(
    type
) {

    return (
        20 *
        Number(upgrades[type])
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
        function (type) {

            const level =
                Math.max(
                    1,
                    Math.min(
                        5,
                        Number(
                            upgrades[type]
                        ) || 1
                    )
                );


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


            const levelEl =
                document.getElementById(
                    levelId
                );


            const progressEl =
                document.getElementById(
                    progressId
                );


            const button =
                document.getElementById(
                    buttonId
                );


            if (levelEl) {

                levelEl.textContent =
                    level;

            }


            if (progressEl) {

                progressEl.style.width =
                    (
                        level /
                        5 *
                        100
                    ) +
                    "%";

            }


            if (button) {

                if (level >= 5) {

                    button.textContent =
                        "MAX";

                    button.classList.add(
                        "maxed"
                    );

                    button.disabled =
                        true;

                } else {

                    button.innerHTML =
                        "🪙 <span>" +
                        getUpgradeCost(type) +
                        "</span>";

                    button.classList.remove(
                        "maxed"
                    );

                    button.disabled =
                        false;

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


    document.getElementById(
        "garageLevel"
    ).textContent =
        garageLevel;


    checkAchievements();

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


        showToast(
            "❌",
            "Not enough coins! Need " +
            cost
        );


        return;

    }


    totalCoins -=
        cost;


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


    checkAchievements();

}


document
    .getElementById(
        "engineUpgrade"
    )
    .addEventListener(
        "click",
        function () {

            purchaseUpgrade(
                "engine"
            );

        }
    );


document
    .getElementById(
        "tireUpgrade"
    )
    .addEventListener(
        "click",
        function () {

            purchaseUpgrade(
                "tire"
            );

        }
    );


document
    .getElementById(
        "fuelUpgrade"
    )
    .addEventListener(
        "click",
        function () {

            purchaseUpgrade(
                "fuel"
            );

        }
    );


document
    .getElementById(
        "speedUpgrade"
    )
    .addEventListener(
        "click",
        function () {

            purchaseUpgrade(
                "speed"
            );

        }
    );


/* =========================================================
   VEHICLES
========================================================= */

function updateVehicleUI() {

    document
        .querySelectorAll(
            ".vehicle-card"
        )
        .forEach(
            function (card) {

                const type =
                    card.dataset.vehicle;


                if (!vehicles[type]) {
                    return;
                }


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


                if (status) {

                    if (!unlocked) {

                        status.textContent =
                            "🔒 " +
                            vehicles[type].price +
                            " COINS";

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

            }
        );

}


document
    .querySelectorAll(
        ".vehicle-card"
    )
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

                            showToast(
                                "🔒",
                                "Need " +
                                vehicle.price +
                                " coins"
                            );

                            return;

                        }


                        const confirmed =
                            confirm(
                                "Unlock " +
                                vehicle.name +
                                " for " +
                                vehicle.price +
                                " coins?"
                            );


                        if (!confirmed) {
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


                        showToast(
                            "🚙",
                            vehicle.name +
                            " unlocked!"
                        );


                        checkAchievements();

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


/* =========================================================
   MISSIONS UI
========================================================= */

function updateMissionsUI() {

    const distanceProgress =
        Math.min(
            500,
            missionData.distance
        );


    const coinsProgress =
        Math.min(
            10,
            missionData.coins
        );


    const fuelProgress =
        Math.min(
            2,
            missionData.fuel
        );


    const survivorProgress =
        Math.min(
            1000,
            missionData.survivor
        );


    document.getElementById(
        "missionDistanceBar"
    ).style.width =
        (
            distanceProgress /
            500 *
            100
        ) +
        "%";


    document.getElementById(
        "missionCoinsBar"
    ).style.width =
        (
            coinsProgress /
            10 *
            100
        ) +
        "%";


    document.getElementById(
        "missionFuelBar"
    ).style.width =
        (
            fuelProgress /
            2 *
            100
        ) +
        "%";


    document.getElementById(
        "missionSurvivorBar"
    ).style.width =
        (
            survivorProgress /
            1000 *
            100
        ) +
        "%";


    document.getElementById(
        "missionDistanceText"
    ).textContent =
        distanceProgress +
        " / 500 m";


    document.getElementById(
        "missionCoinsText"
    ).textContent =
        coinsProgress +
        " / 10";


    document.getElementById(
        "missionFuelText"
    ).textContent =
        fuelProgress +
        " / 2";


    document.getElementById(
        "missionSurvivorText"
    ).textContent =
        survivorProgress +
        " / 1000 m";

}


/* =========================================================
   COMPLETE MISSION
========================================================= */

function completeMission(
    type,
    reward,
    message
) {

    if (
        missionClaimed[type]
    ) {
        return;
    }


    missionClaimed[type] =
        true;


    totalCoins +=
        reward;


    localStorage.setItem(
        "phd_totalCoins",
        totalCoins
    );


    saveMissions();


    menuCoins.textContent =
        totalCoins;


    playTone(
        1000,
        0.1,
        "triangle",
        0.06
    );


    setTimeout(
        function () {

            playTone(
                1400,
                0.15,
                "triangle",
                0.06
            );

        },
        100
    );


    showToast(
        "🎯",
        message +
        " +" +
        reward +
        " coins"
    );


    updateMissionsUI();

}


/* =========================================================
   CHECK MISSIONS
========================================================= */

function checkMissions() {

    if (
        missionData.distance >=
        500
    ) {

        completeMission(
            "distance",
            25,
            "500m Mission Complete!"
        );

    }


    if (
        missionData.coins >=
        10
    ) {

        completeMission(
            "coins",
            30,
            "Coin Hunter Complete!"
        );

    }


    if (
        missionData.fuel >=
        2
    ) {

        completeMission(
            "fuel",
            25,
            "Fuel Saver Complete!"
        );

    }


    if (
        missionData.survivor >=
        1000
    ) {

        completeMission(
            "survivor",
            50,
            "Survivor Mission Complete!"
        );

    }


    updateMissionsUI();

}


/* =========================================================
   ACHIEVEMENT UNLOCK
========================================================= */

function unlockAchievement(
    key,
    icon,
    name
) {

    if (
        achievements[key]
    ) {
        return;
    }


    achievements[key] =
        true;


    const reward =
        achievementRewards[key] ||
        0;


    totalCoins +=
        reward;


    localStorage.setItem(
        "phd_totalCoins",
        totalCoins
    );


    saveAchievements();


    menuCoins.textContent =
        totalCoins;


    playTone(
        800,
        0.1,
        "triangle",
        0.06
    );


    setTimeout(
        function () {

            playTone(
                1200,
                0.1,
                "triangle",
                0.06
            );

        },
        100
    );


    showToast(
        icon,
        name +
        " +" +
        reward +
        " coins"
    );


    updateAchievementUI();

}


/* =========================================================
   CHECK ACHIEVEMENTS
========================================================= */

function checkAchievements() {

    if (
        Number(
            localStorage.getItem(
                "phd_hasPlayed"
            ) || 0
        ) === 1
    ) {

        unlockAchievement(
            "firstDrive",
            "🚀",
            "First Drive!"
        );

    }


    if (
        bestDistance >=
        1000
    ) {

        unlockAchievement(
            "distance1000",
            "🏔️",
            "Mountain Master!"
        );

    }


    if (
        totalCoins >=
        100
    ) {

        unlockAchievement(
            "coins100",
            "💰",
            "Coin Collector!"
        );

    }


    if (
        unlockedVehicles.length >=
        2
    ) {

        unlockAchievement(
            "vehicle",
            "🚙",
            "Garage Owner!"
        );

    }


    if (
        upgrades.engine >= 5 ||
        upgrades.tire >= 5 ||
        upgrades.fuel >= 5 ||
        upgrades.speed >= 5
    ) {

        unlockAchievement(
            "upgrade",
            "⚡",
            "Max Power!"
        );

    }


    updateAchievementUI();

}


function updateAchievementUI() {

    const map = {

        firstDrive:
            "achievementFirstDrive",

        distance1000:
            "achievement1000",

        coins100:
            "achievement100Coins",

        vehicle:
            "achievementVehicle",

        upgrade:
            "achievementUpgrade"

    };


    Object.keys(map).forEach(
        function (key) {

            const element =
                document.getElementById(
                    map[key]
                );


            if (!element) {
                return;
            }


            if (
                achievements[key]
            ) {

                element.textContent =
                    "🏆";

                element.classList.add(
                    "unlocked"
                );

            } else {

                element.textContent =
                    "🔒";

                element.classList.remove(
                    "unlocked"
                );

            }

        }
    );

}


/* =========================================================
   DAILY REWARD UI
========================================================= */

function updateRewardUI() {

    const today =
        getTodayKey();


    const alreadyClaimed =
        lastRewardDate ===
        today;


    document.getElementById(
        "rewardDay"
    ).textContent =
        rewardDay;


    for (
        let i = 1;
        i <= 7;
        i++
    ) {

        const element =
            document.getElementById(
                "reward" + i
            );


        if (!element) {
            continue;
        }


        element.classList.remove(
            "today"
        );


        element.classList.remove(
            "claimed"
        );


        if (
            i < rewardDay
        ) {

            element.classList.add(
                "claimed"
            );

        }


        if (
            i === rewardDay &&
            !alreadyClaimed
        ) {

            element.classList.add(
                "today"
            );

        }

    }


    const claimButton =
        document.getElementById(
            "claimRewardBtn"
        );


    const message =
        document.getElementById(
            "rewardMessage"
        );


    if (
        alreadyClaimed
    ) {

        claimButton.disabled =
            true;


        claimButton.textContent =
            "✅ REWARD CLAIMED";


        message.textContent =
            "Come back tomorrow for your next reward.";

    } else {

        claimButton.disabled =
            false;


        claimButton.textContent =
            "🎁 CLAIM " +
            rewardAmounts[
                rewardDay - 1
            ] +
            " COINS";


        message.textContent =
            "Your daily reward is waiting!";

    }

}


/* =========================================================
   CLAIM DAILY REWARD
========================================================= */

document
    .getElementById(
        "claimRewardBtn"
    )
    .addEventListener(
        "click",
        function () {

            const today =
                getTodayKey();


            if (
                lastRewardDate ===
                today
            ) {

                return;

            }


            const reward =
                rewardAmounts[
                    rewardDay - 1
                ];


            totalCoins +=
                reward;


            lastRewardDate =
                today;


            localStorage.setItem(
                "phd_totalCoins",
                totalCoins
            );


            localStorage.setItem(
                "phd_lastRewardDate",
                lastRewardDate
            );


            if (
                rewardDay >= 7
            ) {

                rewardDay = 1;

            } else {

                rewardDay++;

            }


            localStorage.setItem(
                "phd_rewardDay",
                rewardDay
            );


            menuCoins.textContent =
                totalCoins;


            playTone(
                700,
                0.1,
                "triangle",
                0.06
            );


            setTimeout(
                function () {

                    playTone(
                        1100,
                        0.1,
                        "triangle",
                        0.06
                    );

                },
                100
            );


            showToast(
                "🎁",
                "Daily Reward +" +
                reward +
                " coins!"
            );


            updateRewardUI();

        }
    );


/* =========================================================
   TERRAIN
========================================================= */

function generateTerrain() {

    terrain = [];


    const step =
        70;


    let y =
        H * 0.67;


    let slope =
        0;


    for (
        let x = -500;
        x <= 30000;
        x += step
    ) {

        slope +=
            (
                Math.random() -
                0.5
            ) *
            0.18;


        slope *=
            0.91;


        slope =
            Math.max(
                -0.55,
                Math.min(
                    0.55,
                    slope
                )
            );


        y +=
            slope *
            15;


        y +=
            Math.sin(
                x *
                0.006
            ) *
            2;


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


function getGroundY(x) {

    if (
        !terrain.length
    ) {

        return H * 0.67;

    }


    if (
        x <=
        terrain[0].x
    ) {

        return terrain[0].y;

    }


    const step =
        70;


    let index =
        Math.floor(
            (x + 500) /
            step
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


    if (
        !a ||
        !b
    ) {

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
        (b.y - a.y) *
        t
    );

}


function getGroundAngle(x) {

    const delta =
        8;


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

    coinItems = [];

    fuelItems = [];

    obstacles = [];


    for (
        let x = 650;
        x < 28000;
        x +=
            350 +
            Math.random() *
            450
    ) {

        const coinX =
            x +
            Math.random() *
            120;


        coinItems.push({

            x: coinX,

            y:
                getGroundY(
                    coinX
                ) - 65,

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
            Math.random() *
            700
    ) {

        const fuelX =
            x +
            Math.random() *
            200;


        fuelItems.push({

            x: fuelX,

            y:
                getGroundY(
                    fuelX
                ) - 58,

            radius: 16,

            collected: false

        });

    }


    for (
        let x = 950;
        x < 28000;
        x +=
            650 +
            Math.random() *
            700
    ) {

        const obstacleX =
            x +
            Math.random() *
            180;


        obstacles.push({

            x: obstacleX,

            y:
                getGroundY(
                    obstacleX
                ),

            width:
                25 +
                Math.random() *
                22,

            height:
                20 +
                Math.random() *
                18,

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


    generateTerrain();

    generateItems();


    distance =
        0;

    runCoins =
        0;

    runFuelCollected =
        0;


    const maxFuel =
        100 +
        (
            upgrades.fuel - 1
        ) *
        20;


    fuel =
        maxFuel;


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


    carY =
        getGroundY(
            carX
        ) -
        vehicles[
            selectedVehicle
        ].height;


    carAngle =
        getGroundAngle(
            carX
        );


    gasPressed =
        false;


    brakePressed =
        false;


    paused =
        false;


    gameOver =
        false;


    countdownRunning =
        false;


    running =
        true;


    localStorage.setItem(
        "phd_hasPlayed",
        "1"
    );


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


    checkAchievements();


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
   INPUT
========================================================= */

window.addEventListener(
    "keydown",
    function (e) {

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
    function (e) {

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

    }
);


/* =========================================================
   MOBILE CONTROLS
========================================================= */

function setupHoldButton(
    button,
    setter
) {

    if (!button) {
        return;
    }


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

        gasPressed =
            value;

    }
);


setupHoldButton(
    brakeBtn,
    function (value) {

        brakePressed =
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
    function () {

        paused =
            false;


        pauseScreen.style.display =
            "none";


        startEngineSound();

    }
);


quitBtn.addEventListener(
    "click",
    function () {

        running =
            false;


        paused =
            false;


        gasPressed =
            false;


        brakePressed =
            false;


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
        vehicles[
            selectedVehicle
        ];


    const enginePower =
        1 +
        (
            upgrades.engine - 1
        ) *
        0.16;


    const speedPower =
        1 +
        (
            upgrades.speed - 1
        ) *
        0.13;


    const tireGrip =
        vehicle.grip +
        (
            upgrades.tire - 1
        ) *
        0.012;


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
            acceleration *
            dt;


        const efficiency =
            1 -
            (
                upgrades.fuel - 1
            ) *
            0.025;


        fuel -=
            vehicle.fuelUsage *
            dt *
            efficiency;

    } else {

        speed *=
            Math.pow(
                0.985,
                dt
            );

    }


    if (brakePressed) {

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


    carVelocityY +=
        0.45 *
        dt;


    carY +=
        carVelocityY *
        dt;


    carX +=
        speed *
        dt *
        2.2;


    if (
        carX < 100
    ) {

        carX =
            100;

    }


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


    const targetAngle =
        getGroundAngle(
            carX
        );


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


    const maxFuel =
        100 +
        (
            upgrades.fuel - 1
        ) *
        20;


    distanceEl.textContent =
        distance;


    coinsEl.textContent =
        runCoins;


    fuelEl.textContent =
        Math.round(
            (
                fuel /
                maxFuel
            ) *
            100
        );


    livesEl.textContent =
        lives;


    checkItems();

    checkObstacles();


    /* UPDATE MISSION PROGRESS */

    missionData.distance =
        Math.max(
            missionData.distance,
            distance
        );


    missionData.survivor =
        Math.max(
            missionData.survivor,
            distance
        );


    saveMissions();


    checkMissions();


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
   ITEMS
========================================================= */

function checkItems() {

    coinItems.forEach(
        function (coin) {

            if (
                coin.collected
            ) {
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


            if (
                d < 55
            ) {

                coin.collected =
                    true;


                runCoins++;

                totalCoins++;


                missionData.coins++;


                localStorage.setItem(
                    "phd_totalCoins",
                    totalCoins
                );


                saveMissions();


                menuCoins.textContent =
                    totalCoins;


                coinsEl.textContent =
                    runCoins;


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


                checkMissions();

                checkAchievements();

            }

        }
    );


    fuelItems.forEach(
        function (item) {

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


                runFuelCollected++;


                missionData.fuel++;


                const maxFuel =
                    100 +
                    (
                        upgrades.fuel - 1
                    ) *
                    20;


                fuel =
                    Math.min(
                        maxFuel,
                        fuel + 35
                    );


                saveMissions();


                playTone(
                    600,
                    0.1,
                    "sine",
                    0.05
                );


                checkMissions();

            }

        }
    );

}


/* =========================================================
   OBSTACLES
========================================================= */

function checkObstacles() {

    const vehicle =
        vehicles[
            selectedVehicle
        ];


    obstacles.forEach(
        function (obstacle) {

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
                0.6 +
                obstacle.height *
                0.6
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


    missionData.distance =
        Math.max(
            missionData.distance,
            distance
        );


    missionData.survivor =
        Math.max(
            missionData.survivor,
            distance
        );


    saveMissions();


    checkMissions();

    checkAchievements();


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

        <div
            style="
                margin-top:15px;
                padding:12px;
                border-radius:12px;
                background:rgba(255,255,255,0.08);
                color:white;
            "
        >
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
            🪙 Total Coins:
            ${totalCoins}
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


    document
        .getElementById(
            "restartBtn"
        )
        .addEventListener(
            "click",
            function () {

                location.reload();

            }
        );


    document
        .getElementById(
            "menuBtn"
        )
        .addEventListener(
            "click",
            function () {

                location.reload();

            }
        );

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
        x <
        W +
        cameraX +
        1000;
        x += 180
    ) {

        const peak =
            H * 0.37 +
            Math.sin(
                x * 0.01
            ) *
            55;


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
                "#e53935";


            ctx.fillRect(
                -12,
                -17,
                24,
                32
            );


            ctx.fillStyle =
                "#b71c1c";


            ctx.fillRect(
                -6,
                -21,
                12,
                5
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
        function (obstacle) {

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
   SAFE ROUNDED RECT
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
        vehicles[
            selectedVehicle
        ];


    if (!vehicle) {
        return;
    }


    ctx.save();


    ctx.translate(
        carX -
        cameraX,
        carY
    );


    ctx.rotate(
        carAngle
    );


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
        selectedVehicle ===
        "bike"
    ) {

        drawBike();

    } else {

        const color =
            selectedVehicle ===
            "suv"
                ? "#1565c0"
                : "#e53935";


        drawCarBody(
            color,
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
   DRAW
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
   MENU STATS
========================================================= */

function updateMenuStats() {

    menuCoins.textContent =
        totalCoins;


    menuBestScore.textContent =
        bestDistance;


    updateGarageUI();

    updateVehicleUI();

    updateMissionsUI();

    updateAchievementUI();

    updateRewardUI();

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (!lastTime) {

        lastTime =
            timestamp;

    }


    let dt =
        (
            timestamp -
            lastTime
        ) /
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
   INITIALIZE
========================================================= */

updateMenuStats();


checkAchievements();


updateMissionsUI();


updateRewardUI();


requestAnimationFrame(
    gameLoop
);
