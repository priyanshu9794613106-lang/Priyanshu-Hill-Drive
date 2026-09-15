/* =====================================================
   PRIYANSHU HILL DRIVE
   Step 1 - Complete Game System
===================================================== */


/* =========================
   CANVAS
========================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


/* =========================
   UI
========================= */

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");

const hud = document.getElementById("hud");
const controls = document.getElementById("controls");

const distanceText = document.getElementById("distance");
const coinsText = document.getElementById("coins");
const fuelText = document.getElementById("fuel");

const menuBestScore =
  document.getElementById("menuBestScore");

const gasBtn =
  document.getElementById("gasBtn");

const brakeBtn =
  document.getElementById("brakeBtn");


/* =========================
   GAME VARIABLES
========================= */

let gameRunning = false;

let animationId = null;

let distance = 0;

let coins = 0;

let fuel = 100;

let speed = 0;

let carX = 180;

let cameraX = 0;

let gasPressed = false;

let brakePressed = false;


/* =========================
   SETTINGS
========================= */

const MAX_SPEED = 9;

const ACCELERATION = 0.14;

const BRAKE_POWER = 0.22;

const FRICTION = 0.035;

const GRAVITY = 0.45;


/* =========================
   BEST SCORE
========================= */

let bestScore =
  Number(
    localStorage.getItem(
      "priyanshuHillBestScore"
    )
  ) || 0;

menuBestScore.textContent = bestScore;


/* =========================
   TERRAIN
========================= */

let terrain = [];

let coinItems = [];

let fuelItems = [];

const WORLD_WIDTH = 8000;

const TERRAIN_STEP = 20;


/* =========================
   RESIZE
========================= */

function resizeCanvas() {

  canvas.width = window.innerWidth;

  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener(
  "resize",
  resizeCanvas
);


/* =========================
   TERRAIN GENERATION
========================= */

function createTerrain() {

  terrain = [];

  for (
    let x = 0;
    x <= WORLD_WIDTH;
    x += TERRAIN_STEP
  ) {

    const y =
      canvas.height * 0.68 +

      Math.sin(x * 0.006) * 65 +

      Math.sin(x * 0.015) * 28 +

      Math.sin(x * 0.002) * 40 +

      Math.sin(x * 0.027) * 12;

    terrain.push({
      x: x,
      y: y
    });
  }
}


/* =========================
   GROUND Y
========================= */

function getGroundY(worldX) {

  const index =
    Math.floor(
      worldX / TERRAIN_STEP
    );

  if (
    index < 0 ||
    index >= terrain.length
  ) {

    return canvas.height * 0.68;
  }

  return terrain[index].y;
}


/* =========================
   ITEMS
========================= */

function createItems() {

  coinItems = [];

  fuelItems = [];


  /* COINS */

  for (
    let i = 0;
    i < 100;
    i++
  ) {

    const x =
      350 +
      i * 70 +
      Math.random() * 45;

    const ground =
      getGroundY(x);

    coinItems.push({

      x: x,

      y:
        ground -
        55 -
        Math.random() * 20,

      collected: false

    });
  }


  /* FUEL */

  for (
    let i = 0;
    i < 20;
    i++
  ) {

    const x =
      600 +
      i * 350;

    const ground =
      getGroundY(x);

    fuelItems.push({

      x: x,

      y: ground - 55,

      collected: false

    });
  }
}


/* =========================
   RESET GAME
========================= */

function resetGame() {

  distance = 0;

  coins = 0;

  fuel = 100;

  speed = 0;

  carX = 180;

  cameraX = 0;

  createTerrain();

  createItems();

  updateHUD();
}


/* =========================
   START GAME
========================= */

function startGame() {

  resetGame();

  gameRunning = true;

  menu.style.display = "none";

  hud.style.display = "flex";

  controls.style.display = "flex";

  cancelAnimationFrame(animationId);

  gameLoop();
}


/* =========================
   GAME OVER
========================= */

function gameOver() {

  gameRunning = false;

  cancelAnimationFrame(animationId);


  const finalDistance =
    Math.floor(distance);


  /* UPDATE BEST SCORE */

  if (
    finalDistance >
    bestScore
  ) {

    bestScore =
      finalDistance;

    localStorage.setItem(
      "priyanshuHillBestScore",
      bestScore
    );
  }


  menuBestScore.textContent =
    bestScore;


  /* GAME OVER SCREEN */

  menu.innerHTML = `

    <div class="menu-card">

      <div class="game-icon">
        🏁
      </div>

      <h1>GAME OVER</h1>

      <h2>GOOD DRIVE!</h2>

      <div class="best-box">

        📏 Distance:
        <strong>
          ${finalDistance} m
        </strong>

        <br><br>

        🪙 Coins:
        <strong>
          ${coins}
        </strong>

        <br><br>

        🏆 Best:
        <strong>
          ${bestScore} m
        </strong>

      </div>

      <button id="restartBtn">
        🔄 PLAY AGAIN
      </button>

      <p class="instruction">
        Keep driving and beat your best score!
      </p>

    </div>

  `;


  menu.style.display = "flex";

  hud.style.display = "none";

  controls.style.display = "none";


  document
    .getElementById("restartBtn")
    .addEventListener(
      "click",
      startGame
    );
}


/* =========================
   HUD
========================= */

function updateHUD() {

  distanceText.textContent =
    Math.floor(distance);

  coinsText.textContent =
    coins;

  fuelText.textContent =
    Math.floor(fuel);
}


/* =========================
   GAME UPDATE
========================= */

function updateGame() {

  if (!gameRunning) return;


  /* GAS */

  if (gasPressed) {

    speed += ACCELERATION;

  } else {

    speed -= FRICTION;
  }


  /* BRAKE */

  if (brakePressed) {

    speed -= BRAKE_POWER;
  }


  /* LIMIT SPEED */

  speed =
    Math.max(
      0,
      Math.min(
        speed,
        MAX_SPEED
      )
    );


  /* MOVE */

  carX += speed;


  /* CAMERA */

  cameraX =
    Math.max(
      0,
      carX -
      canvas.width * 0.28
    );


  /* DISTANCE */

  distance =
    carX / 10;


  /* FUEL */

  fuel -=
    speed * 0.004;


  if (fuel <= 0) {

    fuel = 0;

    gameOver();

    return;
  }


  /* COIN COLLECTION */

  coinItems.forEach(
    coin => {

      if (
        !coin.collected &&
        Math.abs(
          coin.x - carX
        ) < 35
      ) {

        coin.collected = true;

        coins++;
      }
    }
  );


  /* FUEL COLLECTION */

  fuelItems.forEach(
    item => {

      if (
        !item.collected &&
        Math.abs(
          item.x - carX
        ) < 35
      ) {

        item.collected = true;

        fuel =
          Math.min(
            100,
            fuel + 25
          );
      }
    }
  );


  /* WORLD END */

  if (
    carX >=
    WORLD_WIDTH - 100
  ) {

    gameOver();

    return;
  }


  updateHUD();
}


/* =========================
   SKY
========================= */

function drawSky() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );


  gradient.addColorStop(
    0,
    "#2196F3"
  );

  gradient.addColorStop(
    1,
    "#E1F5FE"
  );


  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}


/* =========================
   SUN
========================= */

function drawSun() {

  ctx.save();

  ctx.shadowBlur = 30;

  ctx.shadowColor =
    "rgba(255,200,50,0.7)";

  ctx.fillStyle =
    "#FFD54F";


  ctx.beginPath();

  ctx.arc(
    canvas.width - 100,
    90,
    45,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}


/* =========================
   CLOUDS
========================= */

function drawClouds() {

  const cloudPositions = [

    {
      x: 120,
      y: 110,
      size: 1
    },

    {
      x: 430,
      y: 170,
      size: 0.8
    },

    {
      x: 760,
      y: 100,
      size: 1.2
    }

  ];


  cloudPositions.forEach(
    cloud => {

      const x =
        cloud.x -
        cameraX * 0.15;

      const y =
        cloud.y;

      ctx.fillStyle =
        "rgba(255,255,255,0.8)";


      ctx.beginPath();

      ctx.arc(
        x,
        y,
        25 * cloud.size,
        0,
        Math.PI * 2
      );

      ctx.arc(
        x + 30 * cloud.size,
        y - 10 * cloud.size,
        32 * cloud.size,
        0,
        Math.PI * 2
      );

      ctx.arc(
        x + 65 * cloud.size,
        y,
        25 * cloud.size,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }
  );
}


/* =========================
   BACKGROUND MOUNTAINS
========================= */

function drawMountains() {

  ctx.fillStyle =
    "#7CB342";


  ctx.beginPath();

  ctx.moveTo(
    0,
    canvas.height * 0.7
  );


  for (
    let x = 0;
    x <= canvas.width;
    x += 70
  ) {

    const worldX =
      x +
      cameraX * 0.25;


    const y =
      canvas.height * 0.52 +

      Math.sin(
        worldX * 0.006
      ) * 70;


    ctx.lineTo(
      x,
      y
    );
  }


  ctx.lineTo(
    canvas.width,
    canvas.height
  );

  ctx.lineTo(
    0,
    canvas.height
  );

  ctx.closePath();

  ctx.fill();
}


/* =========================
   TERRAIN
========================= */

function drawTerrain() {

  /* DIRT */

  ctx.fillStyle =
    "#795548";


  ctx.beginPath();


  terrain.forEach(
    (point, index) => {

      const x =
        point.x -
        cameraX;


      if (index === 0) {

        ctx.moveTo(
          x,
          point.y
        );

      } else {

        ctx.lineTo(
          x,
          point.y
        );
      }
    }
  );


  ctx.lineTo(
    WORLD_WIDTH -
    cameraX,
    canvas.height
  );

  ctx.lineTo(
    -cameraX,
    canvas.height
  );

  ctx.closePath();

  ctx.fill();


  /* GRASS TOP */

  ctx.strokeStyle =
    "#43A047";

  ctx.lineWidth = 8;

  ctx.lineJoin = "round";


  ctx.beginPath();


  terrain.forEach(
    (point, index) => {

      const x =
        point.x -
        cameraX;


      if (index === 0) {

        ctx.moveTo(
          x,
          point.y
        );

      } else {

        ctx.lineTo(
          x,
          point.y
        );
      }
    }
  );


  ctx.stroke();
}


/* =========================
   COINS
========================= */

function drawCoins() {

  coinItems.forEach(
    coin => {

      if (
        coin.collected
      ) return;


      const x =
        coin.x -
        cameraX;


      if (
        x < -30 ||
        x >
        canvas.width + 30
      ) return;


      ctx.save();


      ctx.shadowBlur = 10;

      ctx.shadowColor =
        "#FFD700";


      ctx.fillStyle =
        "#FFD700";


      ctx.beginPath();

      ctx.arc(
        x,
        coin.y,
        12,
        0,
        Math.PI * 2
      );

      ctx.fill();


      ctx.strokeStyle =
        "#B8860B";

      ctx.lineWidth = 2;

      ctx.stroke();


      ctx.fillStyle =
        "#8B6508";

      ctx.font =
        "bold 12px Arial";

      ctx.textAlign =
        "center";

      ctx.fillText(
        "$",
        x,
        coin.y + 4
      );


      ctx.restore();
    }
  );
}


/* =========================
   FUEL
========================= */

function drawFuel() {

  fuelItems.forEach(
    item => {

      if (
        item.collected
      ) return;


      const x =
        item.x -
        cameraX;


      if (
        x < -30 ||
        x >
        canvas.width + 30
      ) return;


      ctx.save();


      ctx.shadowBlur = 10;

      ctx.shadowColor =
        "#ff5252";


      /* CAN */

      ctx.fillStyle =
        "#E53935";


      ctx.fillRect(
        x - 13,
        item.y - 18,
        26,
        32
      );


      /* CAP */

      ctx.fillRect(
        x - 7,
        item.y - 24,
        14,
        6
      );


      /* F */

      ctx.fillStyle =
        "#FFFFFF";

      ctx.font =
        "bold 16px Arial";

      ctx.textAlign =
        "center";

      ctx.fillText(
        "F",
        x,
        item.y + 5
      );


      ctx.restore();
    }
  );
}


/* =========================
   CAR
========================= */

function drawCar() {

  const groundY =
    getGroundY(carX);


  const x =
    carX -
    cameraX;


  const y =
    groundY -
    50;


  ctx.save();


  /* CAR BODY */

  ctx.fillStyle =
    "#E53935";


  ctx.beginPath();

  ctx.roundRect(
    x - 38,
    y - 28,
    76,
    28,
    8
  );

  ctx.fill();


  /* CAR ROOF */

  ctx.fillStyle =
    "#C62828";


  ctx.beginPath();

  ctx.moveTo(
    x - 25,
    y - 28
  );

  ctx.lineTo(
    x - 10,
    y - 48
  );

  ctx.lineTo(
    x + 20,
    y - 48
  );

  ctx.lineTo(
    x + 33,
    y - 28
  );

  ctx.closePath();

  ctx.fill();


  /* WINDOWS */

  ctx.fillStyle =
    "#90CAF9";


  ctx.beginPath();

  ctx.moveTo(
    x - 8,
    y - 43
  );

  ctx.lineTo(
    x + 2,
    y - 43
  );

  ctx.lineTo(
    x + 2,
    y - 30
  );

  ctx.lineTo(
    x - 14,
    y - 30
  );

  ctx.closePath();

  ctx.fill();


  ctx.beginPath();

  ctx.moveTo(
    x + 6,
    y - 43
  );

  ctx.lineTo(
    x + 18,
    y - 43
  );

  ctx.lineTo(
    x + 27,
    y - 30
  );

  ctx.lineTo(
    x + 6,
    y - 30
  );

  ctx.closePath();

  ctx.fill();


  /* WHEELS */

  drawWheel(
    x - 24,
    y
  );

  drawWheel(
    x + 24,
    y
  );


  /* HEADLIGHT */

  ctx.fillStyle =
    "#FFF59D";


  ctx.fillRect(
    x + 34,
    y - 18,
    6,
    8
  );


  /* TAIL LIGHT */

  ctx.fillStyle =
    "#7f0000";


  ctx.fillRect(
    x - 40,
    y - 18,
    5,
    8
  );


  ctx.restore();
}


/* =========================
   WHEEL
========================= */

function drawWheel(
  x,
  y
) {

  ctx.fillStyle =
    "#171717";


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    14,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "#BDBDBD";


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    6,
    0,
    Math.PI * 2
  );

  ctx.fill();
}


/* =========================
   DRAW GAME
========================= */

function drawGame() {

  drawSky();

  drawSun();

  drawClouds();

  drawMountains();

  drawTerrain();

  drawCoins();

  drawFuel();

  drawCar();
}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

  if (!gameRunning) return;


  updateGame();

  drawGame();


  animationId =
    requestAnimationFrame(
      gameLoop
    );
}


/* =========================
   KEYBOARD
========================= */

window.addEventListener(
  "keydown",
  event => {

    if (
      event.code ===
        "ArrowRight" ||
      event.code ===
        "KeyD"
    ) {

      gasPressed = true;

      event.preventDefault();
    }


    if (
      event.code ===
        "ArrowLeft" ||
      event.code ===
        "KeyA"
    ) {

      brakePressed = true;

      event.preventDefault();
    }
  }
);


window.addEventListener(
  "keyup",
  event => {

    if (
      event.code ===
        "ArrowRight" ||
      event.code ===
        "KeyD"
    ) {

      gasPressed = false;
    }


    if (
      event.code ===
        "ArrowLeft" ||
      event.code ===
        "KeyA"
    ) {

      brakePressed = false;
    }
  }
);


/* =========================
   MOBILE GAS
========================= */

function pressGas(event) {

  event.preventDefault();

  gasPressed = true;
}


function releaseGas(event) {

  event.preventDefault();

  gasPressed = false;
}


gasBtn.addEventListener(
  "pointerdown",
  pressGas
);

gasBtn.addEventListener(
  "pointerup",
  releaseGas
);

gasBtn.addEventListener(
  "pointercancel",
  releaseGas
);

gasBtn.addEventListener(
  "pointerleave",
  releaseGas
);


/* =========================
   MOBILE BRAKE
========================= */

function pressBrake(event) {

  event.preventDefault();

  brakePressed = true;
}


function releaseBrake(event) {

  event.preventDefault();

  brakePressed = false;
}


brakeBtn.addEventListener(
  "pointerdown",
  pressBrake
);

brakeBtn.addEventListener(
  "pointerup",
  releaseBrake
);

brakeBtn.addEventListener(
  "pointercancel",
  releaseBrake
);

brakeBtn.addEventListener(
  "pointerleave",
  releaseBrake
);


/* =========================
   START BUTTON
========================= */

startBtn.addEventListener(
  "click",
  startGame
);


/* =========================
   INITIALIZE
========================= */

createTerrain();

createItems();

updateHUD();
