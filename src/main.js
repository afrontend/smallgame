const CIRCLES = 99;

function compose() {
  var fns = arguments;

  return function (result) {
    for (var i = fns.length - 1; i > -1; i--) {
      result = fns[i].call(this, result);
    }

    return result;
  };
};

function createArrowObject(count) {
    const id = count;
    const x1 = window.innerWidth / 2 - 100;
    const y1 = window.innerHeight - 100;
    const width = 200;
    const height = 200;
    return { id, x1, y1, width, height };
}

function makeCircles(len) {
  const circles = [];
  let count = len;
  while (count--) {
    const id = count;
    const radius = getRandom(100);
    const x = getRandomX(radius);
    const y = getRandomY(radius);
    const dx = getRandomArbitrary(-2, 2);
    const dy = getRandomArbitrary(-2, 2);
    const xRange = getXRange(radius);
    const yRange = getYRange(radius);
    circles.push({ id, radius, x, y, dx, dy, xRange, yRange });
  }

  circles.push(createArrowObject(++len));
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
  return Math.floor(Math.random() * max);
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
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
  if (circle.lineWidth) {
    ctx.lineWidth = circle.lineWidth;
  }
  ctx.fill();
}

function drawArrow(ctx, circles) {
  circles.forEach(function(arrow) {
    const { x1, y1, width, height } = arrow;
    if (x1 && y1 && width && height) {
      ctx.fillStyle = arrow.fillStyle;
      ctx.fillRect(x1, y1, width, height);
    }
  });
}

function drawCircles(ctx, circles) {
  circles.forEach(function(circle) {
    drawCircle(ctx, circle)
  });
}

function isRange(value, range) {
  return value ? (value >= range.min && value <= range.max) : false;
}

function applyFreeStyle({ circle, circles }) {
  const c = Object.assign({}, circle);
  if (c.dx) {
    if (isRange(c.x + c.dx, c.xRange)) {
      c.x += c.dx;
    } else {
      c.dx = -c.dx;
    }
  }
  if (c.dy) {
    if (isRange(c.y + c.dy, c.yRange)) {
      c.y += c.dy;
    } else {
      c.dy = -c.dy;
    }
  }
  return { circle: c, circles };
}

const gravity = 1;
const friction = 0.7;

function applyGravityStyle({ circle, circles }) {
  const c = Object.assign({}, circle);
  if (!isRange(c.y + c.dy, c.yRange)) {
    c.dy = -c.dy * friction;
  } else {
    c.dy += gravity;
  }
  c.y += c.dy;
  return { circle: c, circles };
}

function stopCircle({ circle, circles }) {
  const c = Object.assign({}, circle);
  if (isRange(global.mouse.x, { min: c.x - c.radius, max: c.x + c.radius }) && isRange(global.mouse.y, { min: c.y - c.radius, max: c.y + c.radius})) {
    c.fillStyle = 'rgb(100, 100, 200, 0.6)';
    c.dx = null;
    c.dy = null;
  } else {
    c.fillStyle = null;
    if (!c.dx) {
      c.dx = getRandomArbitrary(-1, 1);
      c.dy = getRandomArbitrary(-1, 1);
    }
  }
  return { circle: c, circles };
}

function moveArrow(key, circle) {
  const c = Object.assign({}, circle);
  if (key === DOWN) {
    c.y1 += 1;
  } else if (key === UP) {
    c.y1 -= 1;
  } else if (key === RIGHT) {
    c.x1 += 1;
  } else if (key === LEFT) {
    c.x1 -= 1;
  }
  return c;
}

const gravityStyle = compose(applyGravityStyle);
const freeStyle = compose(applyFreeStyle);

function updateCircles(circles) {
  return circles.map(function(circle) {
    const { circle: c } = gravityStyle({ circle, circles });
    return c;
  });
}

function updateArrow(key, circles) {
  if (!key) return circles;
  return circles.map(function(arrow) {
    const { x1, y1, width, height } = arrow;
    if (x1 && y1 && width && height) {
      return moveArrow(key, arrow);
    }
    return arrow;
  });
}

const LEFT   = 37
const UP     = 38
const RIGHT  = 39
const DOWN   = 40

function startAnimation(ctx) {
  let circles = makeCircles(CIRCLES);
  function animate() {
    requestAnimationFrame(animate);
    clearScreen(ctx);
    drawCircles(ctx, circles);
    circles = updateCircles(circles);
    drawArrow(ctx, circles);
    circles = updateArrow(global.key, circles);
  }
  animate();
}

function activate() {
  const c = document.querySelector("canvas");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  setTimeout(function() {
    console.log(window.innerWidth, window.innerHeight);
    console.log(c.width, c.height);
  }.bind(this), 1000);
  const ctx = c.getContext("2d");
  startAnimation(ctx);
}

const global = {};
global.mouse = {};
global.key = {};

function processKeyEvent(e) {
  const letterPressed = String.fromCharCode(e.keyCode)
  global.key = e.keyCode;
  console.log(e.keyCode, letterPressed.toLowerCase());
}

function processMouseEvent(e) {
  global.mouse = {x: e.x, y: e.y};
  console.log(global.mouse);
}

window.addEventListener('load', activate);
window.addEventListener('keyup', processKeyEvent, true);
window.addEventListener('mousemove', processMouseEvent, true);
