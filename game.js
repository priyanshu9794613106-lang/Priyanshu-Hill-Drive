const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

const menu=document.getElementById('menu');
const hud=document.getElementById('hud');
const controls=document.getElementById('controls');
const startBtn=document.getElementById('startBtn');

let running=false;
let speed=0;
let distance=0;
let coins=0;
let fuel=100;
let accel=false;
let brake=false;

const car={x:150,y:0,vy:0};

const coinList=[];
const fuelList=[];

for(let i=300;i<5000;i+=300){
  coinList.push({x:i});
}
for(let i=800;i<5000;i+=900){
  fuelList.push({x:i});
}

function ground(x){
  return canvas.height-120-Math.sin(x/180)*45-Math.sin(x/70)*18;
}

startBtn.onclick=()=>{
  menu.style.display='none';
  hud.style.display='block';
  controls.style.display='flex';
  running=true;
  car.y=ground(car.x);
  requestAnimationFrame(loop);
};

document.getElementById('gas').onmousedown=()=>accel=true;
document.getElementById('gas').onmouseup=()=>accel=false;
document.getElementById('brake').onmousedown=()=>brake=true;
document.getElementById('brake').onmouseup=()=>brake=false;

document.getElementById('gas').ontouchstart=()=>accel=true;
document.getElementById('gas').ontouchend=()=>accel=false;
document.getElementById('brake').ontouchstart=()=>brake=true;
document.getElementById('brake').ontouchend=()=>brake=false;

function update(){
  if(accel&&fuel>0){
    speed+=0.15;
    fuel-=0.04;
  }
  if(brake) speed-=0.2;

  speed*=0.99;
  speed=Math.max(0,Math.min(speed,8));
  distance+=speed;

  const gy=ground(distance+car.x);
  car.vy+=0.5;
  car.y+=car.vy;
  if(car.y>gy){
    car.y=gy;
    car.vy=0;
  }

  coinList.forEach(c=>{
    if(!c.taken&&Math.abs(c.x-distance-car.x)<25){
      c.taken=true;
      coins++;
    }
  });

  fuelList.forEach(f=>{
    if(!f.taken&&Math.abs(f.x-distance-car.x)<25){
      f.taken=true;
      fuel=Math.min(100,fuel+30);
    }
  });

  document.getElementById('distance').textContent=Math.floor(distance);
  document.getElementById('coins').textContent=coins;
  document.getElementById('fuel').textContent=Math.floor(fuel);
}

function drawCar(){
  ctx.save();
  ctx.translate(car.x,car.y-10);

  ctx.fillStyle='#ff5722';
  ctx.fillRect(-35,-18,70,24);

  ctx.fillStyle='#ffd54f';
  ctx.beginPath();
  ctx.arc(0,-25,8,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle='black';
  ctx.beginPath();
  ctx.arc(-22,10,11,0,Math.PI*2);
  ctx.arc(22,10,11,0,Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle='#7cb342';
  ctx.beginPath();
  ctx.moveTo(0,canvas.height);
  for(let i=0;i<=canvas.width;i+=6){
    ctx.lineTo(i,ground(distance+i));
  }
  ctx.lineTo(canvas.width,canvas.height);
  ctx.closePath();
  ctx.fill();

  coinList.forEach(c=>{
    if(c.taken) return;
    const sx=c.x-distance;
    if(sx>-20&&sx<canvas.width+20){
      ctx.fillStyle='gold';
      ctx.beginPath();
      ctx.arc(sx,ground(c.x)-35,10,0,Math.PI*2);
      ctx.fill();
    }
  });

  fuelList.forEach(f=>{
    if(f.taken) return;
    const sx=f.x-distance;
    if(sx>-20&&sx<canvas.width+20){
      ctx.fillStyle='red';
      ctx.fillRect(sx-8,ground(f.x)-48,16,24);
      ctx.fillStyle='white';
      ctx.fillRect(sx-2,ground(f.x)-44,4,16);
    }
  });

  drawCar();
}

function loop(){
  if(!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}
