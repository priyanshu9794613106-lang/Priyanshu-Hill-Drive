const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const menu = document.getElementById('menu');
const hud = document.getElementById('hud');
const controls = document.getElementById('controls');
const startBtn = document.getElementById('startBtn');

let vehicle = 'car';
function selectVehicle(v){ vehicle = v; }

let running = false;
let speed = 0;
let distance = 0;
let coins = 0;
let fuel = 100;
let accel = false;
let brake = false;

const player = { x: 150, y: 0, vy: 0 };

const coinList = [];
const fuelList = [];

for(let i=300;i<6000;i+=250){
  coinList.push({x:i, taken:false});
}
for(let i=800;i<6000;i+=900){
  fuelList.push({x:i, taken:false});
}

function ground(x){
  return canvas.height - 120 - Math.sin(x/180)*40 - Math.sin(x/70)*18;
}

startBtn.onclick = () => {
  menu.style.display = 'none';
  hud.style.display = 'block';
  controls.style.display = 'flex';
  running = true;
  player.y = ground(player.x);
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

function update(){
  if(accel && fuel>0){
    speed += 0.12;
    fuel -= 0.04;
  }
  if(brake) speed -= 0.18;

  speed *= 0.99;
  speed = Math.max(0, Math.min(speed, 8));

  distance += speed;

  const gy = ground(distance + player.x);
  player.vy += 0.5;
  player.y += player.vy;

  if(player.y > gy){
    player.y = gy;
    player.vy = 0;
  }

  coinList.forEach(c=>{
    if(!c.taken && Math.abs(c.x-distance-player.x)<25){
      c.taken = true;
      coins++;
    }
  });

  fuelList.forEach(f=>{
    if(!f.taken && Math.abs(f.x-distance-player.x)<25){
      f.taken = true;
      fuel = Math.min(100, fuel+30);
    }
  });

  document.getElementById('distance').textContent = Math.floor(distance);
  document.getElementById('coins').textContent = coins;
  document.getElementById('fuel').textContent = Math.floor(fuel);
}

function drawDriver(){
  ctx.fillStyle = '#f1c27d';
  ctx.beginPath();
  ctx.arc(5,-42,8,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(5,-46,8,Math.PI,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#1565c0';
  ctx.fillRect(0,-34,10,16);
}

function drawVehicle(){
  ctx.save();
  ctx.translate(player.x, player.y-10);

  if(vehicle==='car'){
    ctx.fillStyle = '#e53935';
    ctx.fillRect(-35,-18,70,24);

    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.moveTo(-15,-18);
    ctx.lineTo(0,-34);
    ctx.lineTo(22,-34);
    ctx.lineTo(32,-18);
    ctx.closePath();
    ctx.fill();

    drawDriver();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-22,10,11,0,Math.PI*2);
    ctx.arc(22,10,11,0,Math.PI*2);
    ctx.fill();

  }else{
    ctx.fillStyle = '#444';
    ctx.fillRect(-18,-8,36,8);

    drawDriver();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-18,10,10,0,Math.PI*2);
    ctx.arc(18,10,10,0,Math.PI*2);
    ctx.fill();
  }

  ctx.restore();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = '#7cb342';
  ctx.beginPath();
  ctx.moveTo(0,canvas.height);
  for(let i=0;i<=canvas.width;i+=6){
    ctx.lineTo(i, ground(distance+i));
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();

  coinList.forEach(c=>{
    if(c.taken) return;
    const sx = c.x-distance;
    if(sx>-20 && sx<canvas.width+20){
      ctx.fillStyle = 'gold';
      ctx.beginPath();
      ctx.arc(sx, ground(c.x)-35,10,0,Math.PI*2);
      ctx.fill();
    }
  });

  fuelList.forEach(f=>{
    if(f.taken) return;
    const sx = f.x-distance;
    if(sx>-20 && sx<canvas.width+20){
      ctx.fillStyle = 'red';
      ctx.fillRect(sx-8, ground(f.x)-48,16,24);
      ctx.fillStyle = 'white';
      ctx.fillRect(sx-2, ground(f.x)-44,4,16);
    }
  });

  function drawVehicle(){
  ctx.save();
  ctx.translate(player.x, player.y - 10);

  // Wheels
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(-22, 12, 11, 0, Math.PI * 2);
  ctx.arc(22, 12, 11, 0, Math.PI * 2);
  ctx.fill();

  if(vehicle === 'car'){
    // Car body
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(-38, -16, 76, 24);

    // Car roof
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.moveTo(-15,-16);
    ctx.lineTo(0,-34);
    ctx.lineTo(24,-34);
    ctx.lineTo(34,-16);
    ctx.closePath();
    ctx.fill();
  }else{
    // Bike frame
    ctx.fillStyle = '#444';
    ctx.fillRect(-18, -6, 36, 6);

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10,-6);
    ctx.lineTo(8,-18);
    ctx.lineTo(18,-6);
    ctx.stroke();
  }

  // ===== Original fat rider =====

  // Head
  ctx.fillStyle = '#f2c28b';
  ctx.beginPath();
  ctx.arc(6,-42,11,0,Math.PI*2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(6,-48,10,Math.PI,Math.PI*2);
  ctx.fill();

  // Mustache
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2,-39);
  ctx.lineTo(14,-39);
  ctx.stroke();

  // Fat body
  ctx.fillStyle = '#d32f2f';
  ctx.beginPath();
  ctx.ellipse(6,-18,18,22,0,0,Math.PI*2);
  ctx.fill();

  // Arms
  ctx.strokeStyle = '#f2c28b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4,-24);
  ctx.lineTo(-20,-10);
  ctx.moveTo(16,-24);
  ctx.lineTo(28,-10);
  ctx.stroke();

  // Legs
  ctx.strokeStyle = '#ffcc66';
  ctx.beginPath();
  ctx.moveTo(0,2);
  ctx.lineTo(-8,16);
  ctx.moveTo(12,2);
  ctx.lineTo(22,16);
  ctx.stroke();

  ctx.restore();
}


