const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.8;
}
resize();
window.addEventListener('resize', resize);

let accel = false;
let brake = false;

document.getElementById('accelerate').ontouchstart = ()=> accel = true;
document.getElementById('accelerate').ontouchend = ()=> accel = false;
document.getElementById('brake').ontouchstart = ()=> brake = true;
document.getElementById('brake').ontouchend = ()=> brake = false;

document.getElementById('accelerate').onmousedown = ()=> accel = true;
document.getElementById('accelerate').onmouseup = ()=> accel = false;
document.getElementById('brake').onmousedown = ()=> brake = true;
document.getElementById('brake').onmouseup = ()=> brake = false;

window.addEventListener('keydown', e=>{
  if(e.key==='ArrowRight') accel = true;
  if(e.key==='ArrowLeft') brake = true;
});
window.addEventListener('keyup', e=>{
  if(e.key==='ArrowRight') accel = false;
  if(e.key==='ArrowLeft') brake = false;
});

let speed = 0;
let distance = 0;
let fuel = 100;
let x = 140;
let y = 0;
let vy = 0;
const gravity = 0.5;

function ground(px){
  return canvas.height - 80 - Math.sin(px/120)*35 - Math.sin(px/55)*15;
}

function drawCar(cx, cy){
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#e53935';
  ctx.fillRect(-30, -16, 60, 22);
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(-18, 10, 10, 0, Math.PI*2);
  ctx.arc(18, 10, 10, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function update(){
  if(accel && fuel>0){
    speed += 0.12;
    fuel -= 0.03;
  }
  if(brake) speed -= 0.18;

  speed *= 0.99;
  speed = Math.max(0, Math.min(speed, 8));

  distance += speed;

  const gy = ground(distance + x);
  vy += gravity;
  y += vy;

  if(y > gy){
    y = gy;
    vy = 0;
  }

  document.getElementById('distance').textContent = Math.floor(distance);
  document.getElementById('fuel').textContent = Math.max(0, Math.floor(fuel));
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = '#6ab04c';
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for(let i=0;i<=canvas.width;i+=8){
    ctx.lineTo(i, ground(distance+i));
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();

  drawCar(x, y-10);
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

y = ground(x);
loop();
