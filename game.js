const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const menu = document.getElementById('menu');
const hud = document.getElementById('hud');
const controls = document.getElementById('controls');
const startBtn = document.getElementById('startBtn');

let running = false;
let speed = 0;
let distance = 0;
let coins = 0;
let fuel = 100;
let accel = false;
let brake = false;

const rider = { x: 160, y: 0, vy: 0 };

const coinList = [];
const fuelList = [];

for (let i = 300; i < 6000; i += 220) {
  coinList.push({ x: i, taken: false });
}
for (let i = 800; i < 6000; i += 900) {
  fuelList.push({ x: i, taken: false });
}

function ground(x) {
  return canvas.height - 130 - Math.sin(x / 180) * 45 - Math.sin(x / 70) * 18;
}

startBtn.onclick = () => {
  menu.style.display = 'none';
  hud.style.display = 'flex';
  controls.style.display = 'flex';
  running = true;
  rider.y = ground(rider.x);
  requestAnimationFrame(loop);
};

document.getElementById('gas').onmousedown = () => accel = true;
document.getElementById('gas').onmouseup = () => accel = false;
document.getElementById('brake').onmousedown = () => brake = true;
document.getElementById('brake').onmouseup = () => brake = false;

document.getElementById('gas').ontouchstart = () => accel = true;
document.getElementById('gas').ontouchend = () => accel = false;
document.getElementById('brake').ontouchstart = () => brake = true;
document.getElementById('brake').ontouchend = () => brake = false;

function update() {
  if (accel && fuel > 0) {
    speed += 0.14;
    fuel -= 0.04;
  }
  if (brake) speed -= 0.18;

  speed *= 0.99;
  speed = Math.max(0, Math.min(speed, 8));
  distance += speed;

  const gy = ground(distance + rider.x);
  rider.vy += 0.5;
  rider.y += rider.vy;
  if (rider.y > gy) {
    rider.y = gy;
    rider.vy = 0;
  }

  coinList.forEach(c => {
    if (!c.taken && Math.abs(c.x - distance - rider.x) < 28) {
      c.taken = true;
      coins++;
    }
  });

  fuelList.forEach(f => {
    if (!f.taken && Math.abs(f.x - distance - rider.x) < 28) {
      f.taken = true;
      fuel = Math.min(100, fuel + 25);
    }
  });

  document.getElementById('distance').textContent = Math.floor(distance);
  document.getElementById('coins').textContent = coins;
  document.getElementById('fuel').textContent = Math.floor(fuel);
}

function drawRiderBike() {
  ctx.save();
  ctx.translate(rider.x, rider.y - 10);

  // Wheels
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(-22, 12, 11, 0, Math.PI * 2);
  ctx.arc(22, 12, 11, 0, Math.PI * 2);
  ctx.fill();

  // Bike
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, 2);
  ctx.lineTo(0, -10);
  ctx.lineTo(18, 2);
  ctx.stroke();

  // Rider body
  ctx.fillStyle = '#d32f2f';
  ctx.beginPath();
  ctx.ellipse(0, -18, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#f2c28b';
  ctx.beginPath();
  ctx.arc(0, -42, 10, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(0, -47, 9, Math.PI, Math.PI * 2);
  ctx.fill();

  // Mustache
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -39);
  ctx.lineTo(6, -39);
  ctx.stroke();

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#8ed6ff');
  sky.addColorStop(1, '#d9f5ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#6ab04c';
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let i = 0; i <= canvas.width; i += 6) {
    ctx.lineTo(i, ground(distance + i));
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();

  coinList.forEach(c => {
    if (c.taken) return;
    const sx = c.x - distance;
    if (sx > -20 && sx < canvas.width + 20) {
      ctx.fillStyle = 'gold';
      ctx.beginPath();
      ctx.arc(sx, ground(c.x) - 40, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  fuelList.forEach(f => {
    if (f.taken) return;
    const sx = f.x - distance;
    if (sx > -20 && sx < canvas.width + 20) {
      ctx.fillStyle = 'red';
      ctx.fillRect(sx - 8, ground(f.x) - 50, 16, 24);
      ctx.fillStyle = 'white';
      ctx.fillRect(sx - 2, ground(f.x) - 44, 4, 12);
    }
  });

  drawRiderBike();
}

function loop() {
  if (!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}
