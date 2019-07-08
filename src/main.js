const CIRCLES = 99;

function makeCircles(len) {
  const circles = [];
  let count = len;
  while (count--) {
    const radius = getRandom(100);
    const x = getRandomX(radius);
    const y = getRandomY(radius);
    const dx = getRandomArbitrary(-1, 1);
    const dy = getRandomArbitrary(-1, 1);
    const xRange = getXRange(radius);
    const yRange = getYRange(radius);
    circles.push({ radius, x, y, dx, dy, xRange, yRange });
  }
  return circles;
}

function getXRange(min) {
  return { min: min, max: window.innerWidth - min };
}

function getYRange(min) {
  return { min: min, max: window.innerHeight - min };
}

function getRandomX(min) {
  return getRandomArbitrary(min, window.innerWidth - min);
}

function getRandomY(min) {
  return getRandomArbitrary(min, window.innerHeight - min);
}

function getRandom(max) {
  return Math.random() * max;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function clearScreen(ctx) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawCircle(ctx, circle) {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2, false);
  ctx.stroke();
  if (circle.fillStyle) {
    ctx.fillStyle = circle.fillStyle;
  } else {
    ctx.fillStyle = "rgba(20, 100, 20, 0.1)"
  }
  ctx.fill();
}

function drawCircles(ctx, circles) {
  circles.forEach(function(circle) {
    drawCircle(ctx, circle)
  });
}

function isRange(value, range) {
  return value >= range.min && value <= range.max;
}

function getNextCoord(circle, circles) {
  let x = circle.x;
  let y = circle.y;
  let dx = circle.dx;
  let dy = circle.dy;
  if (isRange(x + dx, circle.xRange)) {
    x += dx;
  } else {
    dx = -dx;
  }
  if (isRange(y + dy, circle.yRange)) {
    y += dy;
  } else {
    dy = -dy;
  }
  return { x, y, dx, dy };
}

function updateCircles(circles) {
  return circles.map(function(circle) {
    const { x, y, dx, dy } = getNextCoord(circle, circles);
    circle.x = x;
    circle.y = y;
    circle.dx = dx;
    circle.dy = dy;
    if (isRange(mouse.x, { min: x - circle.radius, max: x + circle.radius }) && isRange(mouse.y, { min: y - circle.radius, max: y + circle.radius})) {
      circle.fillStyle = 'rgb(100, 100, 200, 0.6)';
    } else {
      circle.fillStyle = null;
    }
    return circle;
  });
}

function startAnimation(ctx) {
  let circles = makeCircles(CIRCLES);
  function animate() {
    requestAnimationFrame(animate);
    clearScreen(ctx);
    drawCircles(ctx, circles);
    circles = updateCircles(circles);
  }
  animate();
}

function activate() {
  const c = document.querySelector("canvas");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext("2d");
  startAnimation(ctx);
}

function processKeyEvent(e) {
  const letterPressed = String.fromCharCode(e.keyCode)
  console.log(letterPressed.toLowerCase());
}

let mouse = {};

function processMouseEvent(e) {
  mouse = {x: e.x, y: e.y};
  console.log(mouse);
}

window.addEventListener('load', activate);
window.addEventListener('keyup', processKeyEvent, true);
window.addEventListener('mousemove', processMouseEvent, true);
