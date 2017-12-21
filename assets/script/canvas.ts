window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window["mozRequestAnimationFrame"] ||
  window.webkitRequestAnimationFrame ||
  window["msRequestAnimationFrame"] ||
  (cb => window.setTimeout(cb, 1000 / 60));

const flakes = [];
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const flakeCount = 400;
let mX = -100;
let mY = -100;

function resize() {
  canvas.width = canvas.scrollWidth;
  canvas.height = canvas.scrollHeight;
}

function snow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < flakeCount; i++) {
    const flake = flakes[i],
      x = mX,
      y = mY,
      minDist = 150,
      x2 = flake.x,
      y2 = flake.y;

    const dist = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y)),
      dx = x2 - x,
      dy = y2 - y;

    if (dist < minDist) {
      const force = minDist / (dist * dist),
        xcomp = (x - x2) / dist,
        ycomp = (y - y2) / dist,
        deltaV = force / 2;

      flake.velX -= deltaV * xcomp;
      flake.velY -= deltaV * ycomp;
    } else {
      flake.velX *= 0.98;
      if (flake.velY <= flake.speed) {
        flake.velY = flake.speed;
      }
      flake.velX += Math.cos((flake.step += 0.05)) * flake.stepSize;
    }

    ctx.fillStyle = "rgba(255,255,255," + flake.opacity + ")";
    flake.y += flake.velY;
    flake.x += flake.velX;

    if (flake.y >= canvas.height || flake.y <= 0) {
      reset(flake);
    }

    if (flake.x >= canvas.width || flake.x <= 0) {
      reset(flake);
    }

    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(snow);
}

function reset(flake) {
  flake.x = Math.floor(Math.random() * canvas.width);
  flake.y = 0;
  flake.size = Math.random() * 3 + 2;
  flake.speed = Math.random() * 1 + 0.5;
  flake.velY = flake.speed;
  flake.velX = 0;
  flake.opacity = Math.random() * 0.5 + 0.3;
}

function init() {
  for (let i = 0; i < flakeCount; i++) {
    const x = Math.floor(Math.random() * canvas.width),
      y = Math.floor(Math.random() * canvas.height),
      size = Math.random() * 3 + 2,
      speed = Math.random() * 1 + 0.5,
      opacity = Math.random() * 0.5 + 0.3;

    flakes.push({
      speed: speed,
      velY: speed,
      velX: 0,
      x: x,
      y: y,
      size: size,
      stepSize: Math.random() / 30,
      step: 0,
      opacity: opacity
    });
  }

  snow();
}

const splash = document.querySelector(".splash");
if (splash) {
  splash.addEventListener("mousemove", (e: MouseEvent) => {
    (mX = e.clientX), (mY = e.clientY);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("resize", resize);
  resize();
  init();
});
