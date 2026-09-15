/* =====================================================
   PRIYANSHU HILL DRIVE
   STEP 2 — REALISTIC HILL PHYSICS
===================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");

const hud = document.getElementById("hud");
const controls = document.getElementById("controls");

const distanceText = document.getElementById("distance");
const coinsText = document.getElementById("coins");
const fuelText = document.getElementById("fuel");

const menuBestScore =
  document.getElementById("menuBestScore");

const gasBtn = document.getElementById("gasBtn");
const brakeBtn = document.getElementById("brakeBtn");


/* =====================================================
   CANVAS
===================================================== */

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", () => {
  resizeCanvas();

  if (!gameRunning) {
    createTerrain();
    drawGame();
  }
});


/* =====================================================
   GAME STATE
===================================================== */

let gameRunning = false;
let animationId = null;

let distance = 0;
let coins = 0;
let fuel = 100;

let speed = 0;
let carX = 180;

let cameraX = 0;

let carVelocityY = 0;
let carY = 0;

let carAngle = 0;
let wheelRotation = 0;

let gasPressed = false;
let brakePressed = false;


/* =====================================================
   GAME SETTINGS
===================================================== */

const WORLD_WIDTH = 8000;
const TERRAIN_STEP = 20;

const MAX_SPEED = 10;

const ENGINE_POWER = 0.16;

const BRAKE_POWER = 0.25;

const FRICTION = 0.035;

const GRAVITY = 0.5;

const BOUNCE_POWER = -3.5;


/* =====================================================
   TERRAIN
===================================================== */

let terrain = [];
let coinItems = [];
let fuelItems = [];


/* =====================================================
   BEST SCORE
===================================================== */

let bestScore =
  Number(
    localStorage.getItem(
      "priyanshuHillBestScore"
    )
  ) || 0;

menuBestScore.textContent = bestScore;


/* =====================================================
   CREATE TERRAIN
===================================================== */

function createTerrain() {

  terrain = [];

  for (
    let x = 0;
    x <= WORLD_WIDTH;
    x += TERRAIN_STEP
  ) {

    const y =
      canvas.height * 0.68 +

      Math.sin(x * 0.006) * 70 +

      Math.sin(x * 0.014) * 30 +

      Math.sin(x * 0.0023) * 45 +

      Math.sin(x * 0.029) * 10;

    terrain.push({
      x,
      y
    });
  }
}


/* =====================================================
   GROUND HEIGHT
===================================================== */

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


/* =====================================================
   GROUND SLOPE
===================================================== */

function getGroundSlope(worldX) {

  const y1 =
    getGroundY(worldX - 10);

  const y2 =
    getGroundY(worldX + 10);

  return (
    Math.atan2(
      y2 - y1,
      20
    )
  );
}


/* =====================================================
   CREATE ITEMS
===================================================== */

function createItems() {

  coinItems = [];
  fuelItems = [];


  /* COINS */

  for (
    let i = 0;
    i < 110;
    i++
  ) {

    const x =
      350 +
      i * 65 +
      Math.random() * 40;

    coinItems.push({

      x,

      y:
        getGroundY(x) -
        55 -
        Math.random() * 25,

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

    fuelItems.push({

      x,

      y:
        getGroundY(x) -
        55,

      collected: false

    });
  }
}


/* =====================================================
   RESET GAME
===================================================== */

function resetGame() {

  distance = 0;

  coins = 0;

  fuel = 100;

  speed = 0;

  carX = 180;

  cameraX = 0;

  carVelocityY = 0;

  carAngle = 0;

  wheelRotation = 0;

  createTerrain();

  createItems();

  carY =
    getGroundY(carX) -
    55;

  updateHUD();
}


/* =====================================================
   START GAME
===================================================== */

function startGame() {

  resetGame();

  gameRunning = true;

  menu.style.display = "none";

  hud.style.display = "flex";

  controls.style.display = "flex";

  cancelAnimationFrame(animationId);

  gameLoop();
}


/* =====================================================
   GAME OVER
===================================================== */

function gameOver() {

  gameRunning = false;

  cancelAnimationFrame(animationId);

  const finalDistance =
    Math.floor(distance);


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
        Try to climb farther!
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


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

  distanceText.textContent =
    Math.floor(distance);

  coinsText.textContent =
    coins;

  fuelText.textContent =
    Math.floor(fuel);
}


/* =====================================================
   PHYSICS UPDATE
===================================================== */

function updatePhysics() {

  const slope =
    getGroundSlope(carX);


  /* ENGINE */

  if (gasPressed) {

    speed +=
      ENGINE_POWER *
      (1 - Math.abs(slope) * 0.5);

  } else {

    speed -= FRICTION;
  }


  /* GRAVITY ON HILLS */

  const gravityForce =
    Math.sin(slope) *
    0.18;

  speed -= gravityForce;


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


  /* WHEEL ROTATION */

  wheelRotation +=
    speed * 0.12;


  /* CAR ANGLE */

  const targetAngle =
    slope;


  carAngle +=
    (
      targetAngle -
      carAngle
    ) * 0.12;


  /* VERTICAL PHYSICS */

  const groundY =
    getGroundY(carX);


  const targetY =
    groundY -
    50;


  const difference =
    targetY -
    carY;


  carVelocityY +=
    GRAVITY;


  carY +=
    carVelocityY;


  /* GROUND COLLISION */

  if (
    carY >= targetY
  ) {

    carY = targetY;

    if (
      carVelocityY > 1.5
    ) {

      carVelocityY =
        BOUNCE_POWER;
    } else {

      carVelocityY = 0;
    }
  }


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


  /* COINS */

  coinItems.forEach(
    coin => {

      if (
        !coin.collected &&
        Math.abs(
          coin.x - carX
        ) < 40 &&
        Math.abs(
          coin.y - carY
        ) < 60
      ) {

        coin.collected = true;

        coins++;
      }
    }
  );


  /* FUEL */

  fuelItems.forEach(
    item => {

      if (
        !item.collected &&
        Math.abs(
          item.x - carX
        ) < 40 &&
        Math.abs(
          item.y - carY
        ) < 60
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


/* =====================================================
   SKY
===================================================== */

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


/* =====================================================
   SUN
===================================================== */

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


/* =====================================================
   CLOUDS
===================================================== */

function drawClouds() {

  const clouds = [

    [120, 110, 1],

    [430, 160, 0.8],

    [760, 100, 1.2]

  ];


  clouds.forEach(
    cloud => {

      const x =
        cloud[0] -
        cameraX * 0.15;

      const y =
        cloud[1];

      const size =
        cloud[2];


      ctx.fillStyle =
        "rgba(255,255,255,0.82)";


      ctx.beginPath();

      ctx.arc(
        x,
        y,
        25 * size,
        0,
        Math.PI * 2
      );

      ctx.arc(
        x + 30 * size,
        y - 10 * size,
        32 * size,
        0,
        Math.PI * 2
      );

      ctx.arc(
        x + 65 * size,
        y,
        25 * size,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }
  );
}


/* =====================================================
   BACKGROUND MOUNTAINS
===================================================== */

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


/* =====================================================
   TERRAIN
===================================================== */

function drawTerrain() {

  ctx.fillStyle =
    "#795548";

  ctx.beginPath();


  terrain.forEach(
    (point, index) => {

      const x =
        point.x -
        cameraX;

      if (
        index === 0
      ) {

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


  /* GRASS */

  ctx.strokeStyle =
    "#43A047";

  ctx.lineWidth = 8;

  ctx.lineJoin =
    "round";


  ctx.beginPath();


  terrain.forEach(
    (point, index) => {

      const x =
        point.x -
        cameraX;

      if (
        index === 0
      ) {

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


/* =====================================================
   COINS
===================================================== */

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

      ctx.shadowBlur = 12;

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


/* =====================================================
   FUEL
===================================================== */

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


      ctx.fillStyle =
        "#E53935";


      ctx.fillRect(
        x - 13,
        item.y - 18,
        26,
        32
      );


      ctx.fillRect(
        x - 7,
        item.y - 24,
        14,
        6
      );


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


/* =====================================================
   CAR
===================================================== */

function drawCar() {

  const x =
    carX -
    cameraX;

  const y =
    carY;


  ctx.save();


  /* ROTATE CAR WITH HILL */

  ctx.translate(
    x,
    y
  );

  ctx.rotate(
    carAngle
  );


  /* BODY */

  ctx.fillStyle =
    "#E53935";


  ctx.beginPath();

  ctx.roundRect(
    -38,
    -28,
    76,
    28,
    8
  );

  ctx.fill();


  /* DARK LOWER BODY */

  ctx.fillStyle =
    "#B71C1C";

  ctx.fillRect(
    -37,
    -8,
    74,
    8
  );


  /* ROOF */

  ctx.fillStyle =
    "#C62828";


  ctx.beginPath();

  ctx.moveTo(
    -25,
    -28
  );

  ctx.lineTo(
    -10,
    -48
  );

  ctx.lineTo(
    20,
    -48
  );

  ctx.lineTo(
    33,
    -28
  );

  ctx.closePath();

  ctx.fill();


  /* WINDOWS */

  ctx.fillStyle =
    "#90CAF9";


  ctx.beginPath();

  ctx.moveTo(
    -8,
    -43
  );

  ctx.lineTo(
    2,
    -43
  );

  ctx.lineTo(
    2,
    -30
  );

  ctx.lineTo(
    -14,
    -30
  );

  ctx.closePath();

  ctx.fill();


  ctx.beginPath();

  ctx.moveTo(
    6,
    -43
  );

  ctx.lineTo(
    18,
    -43
  );

  ctx.lineTo(
    27,
    -30
  );

  ctx.lineTo(
    6,
    -30
  );

  ctx.closePath();

  ctx.fill();


  /* HEADLIGHT */

  ctx.fillStyle =
    "#FFF59D";

  ctx.fillRect(
    34,
    -18,
    7,
    8
  );


  /* TAIL LIGHT */

  ctx.fillStyle =
    "#7F0000";

  ctx.fillRect(
    -41,
    -18,
    6,
    8
  );


  /* WHEELS */

  drawWheel(
    -24,
    0
  );

  drawWheel(
    24,
    0
  );


  ctx.restore();
}


/* =====================================================
   WHEEL
===================================================== */

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
    wheelRotation
  );


  /* TYRE */

  ctx.fillStyle =
    "#171717";


  ctx.beginPath();

  ctx.arc(
    0,
    0,
    14,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* RIM */

  ctx.fillStyle =
    "#BDBDBD";


  ctx.beginPath();

  ctx.arc(
    0,
    0,
    6,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* SPOKE */

  ctx.strokeStyle =
    "#757575";

  ctx.lineWidth = 2;


  ctx.beginPath();

  ctx.moveTo(
    -6,
    0
  );

  ctx.lineTo(
    6,
    0
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    0,
    -6
  );

  ctx.lineTo(
    0,
    6
  );

  ctx.stroke();


  ctx.restore();
}


/* =====================================================
   DRAW GAME
===================================================== */

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


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop() {

  if (!gameRunning) return;

  updatePhysics();

  drawGame();

  animationId =
    requestAnimationFrame(
      gameLoop
    );
}


/* =====================================================
   KEYBOARD CONTROLS
===================================================== */

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


/* =====================================================
   MOBILE GAS
===================================================== */

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


/* =====================================================
   MOBILE BRAKE
===================================================== */

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


/* =====================================================
   START BUTTON
===================================================== */

startBtn.addEventListener(
  "click",
  startGame
);


/* =====================================================
   INITIALIZE
===================================================== */

createTerrain();

createItems();

carY =
  getGroundY(carX) -
  50;

updateHUD();

drawGame();
