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
    const x2 = 200;
    const y2 = window.innerHeight;
    const fillStyle = "red";
    return { id, x1, y1, x2, y2 };
}

function makeCircles(len) {
  const circles = [];
  let count = len;
  while (count--) {
    const id = count;
    const radius = getRandom(100);
    const x = getRandomX(radius);
    const y = getRandomY(radius);
    const dx = getRandomArbitrary(-1, 1);
    const dy = getRandomArbitrary(-1, 1);
    const xRange = getXRange(radius);
    const yRange = getYRange(radius);
    circles.push({ id, radius, x, y, dx, dy, xRange, yRange });
  }

  circles.push(createArrowObject(len + 1));
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
  if (circle.lineWidth) {
    ctx.lineWidth = circle.lineWidth;
  }
  ctx.fill();
}

function drawArrow(ctx, circles) {
  circles.forEach(function(arrow) {
    const { x1, y1, x2, y2 } = arrow;
    if (x1 && y1 && x2 && y2) {
      ctx.fillStyle = arrow.fillStyle;
      ctx.fillRect(x1, y1, x2, y2);
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

function applyGravityStyle({ circle, circles }) {
  const c = Object.assign({}, circle);
  if (c.y + c.radius > window.innerHeight) {
    c.dy = -c.dy;
  } else {
    c.dy += 1;
  }
  c.y += c.dy;
  return { circle: c, circles };
}

function stopCircle({ circle, circles }) {
  const c = Object.assign({}, circle);
  if (isRange(mouse.x, { min: c.x - c.radius, max: c.x + c.radius }) && isRange(mouse.y, { min: c.y - c.radius, max: c.y + c.radius})) {
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

const gravityStyle = compose(stopCircle, applyGravityStyle);
const freeStyle = compose(stopCircle, applyFreeStyle);

function updateCircles(circles) {
  return circles.map(function(circle) {
    const { circle: c } = gravityStyle({ circle, circles });
    return c;
  });
}

function startAnimation(ctx) {
  let circles = makeCircles(CIRCLES);
  function animate() {
    requestAnimationFrame(animate);
    clearScreen(ctx);
    drawCircles(ctx, circles);
    drawArrow(ctx, circles);
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
o
