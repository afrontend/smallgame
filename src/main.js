const CIRCLES = 9;
const gravity = 0.1;
const friction = 0.7;

function clone(obj) {
  return Object.assign({}, obj);
}

function compose() {
  var fns = arguments;

  return function (result) {
    for (var i = fns.length - 1; i > -1; i--) {
      result = fns[i].call(this, result);
    }

    return result;
  };
};

function createCircle(count) {
  const id = count;
  const radius = getRandom(100);
  const x = getRandomX(radius);
  const y = getRandomY(radius);
  const dx = getRandomArbitrary(-2, 2);
  const dy = getRandomArbitrary(-2, 2);
  const xRange = getXRange(radius);
  const yRange = getYRange(radius);
  return { id, radius, x, y, dx, dy, xRange, yRange };
}

function isCircle(item) {
  if (!item) return false;
  const { x, y, radius } = item;
  if (x && y && radius) {
    return true;
  }
  return false;
}

function createPerson(count) {
  const id = count;
  const width = 20;
  const height = 100;
  const x1 = (window.innerWidth / 2) - (width / 2);
  const y1 = window.innerHeight - height;
  const fillStyle = 'blue'
  return { id, x1, y1, width, height, fillStyle };
}

function isPerson(item) {
  if (!item) return false;
  const { x1, y1, width, height } = item;
  if (x1 && y1 && width && height) {
    return true;
  }
  return false;
}

function makeCircles(len) {
  const circles = [];
  let count = len;
  while (count--) {
    circles.push(createCircle(count));
  }
  circles.push(createPerson(++len));
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

function drawCircles(ctx, circles) {
  circles.forEach(function(circle) {
    if (isCircle(circle)) {
      drawCircle(ctx, circle)
    }
  });
}

function drawPerson(ctx, circles) {
  circles.forEach(function(item) {
    if(isPerson(item)) {
      ctx.fillStyle = item.fillStyle;
      ctx.fillRect(item.x1, item.y1, item.width, item.height);
    }
  });
}

function distance(x1, y1, x2, y2) {
  return Math.floor(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
}

function isOverlap(arrow, circle) {
  if (distance(arrow.x1, arrow.y1, circle.x, circle.y) <= circle.radius ||
    distance(arrow.x1 + arrow.width, arrow.y1, circle.x, circle.y) <= circle.radius ||
    distance(arrow.x1, arrow.y1 + arrow.height, circle.x, circle.y) <= circle.radius ||
    distance(arrow.x1 + arrow.width, arrow.y1 + arrow.height, circle.x, circle.y) <= circle.radius
  ) {
    return true;
  } else {
    return false;
  }
}

function isInRange(value, range) {
  return value ? (value >= range.min && value <= range.max) : false;
}

function applyFreeStyle({ circle, circles }) {
  const c = clone(circle);
  if (c.dx) {
    if (isInRange(c.x + c.dx, c.xRange)) {
      c.x += c.dx;
    } else {
      c.dx = -c.dx;
    }
  }
  if (c.dy) {
    if (isInRange(c.y + c.dy, c.yRange)) {
      c.y += c.dy;
    } else {
      c.dy = -c.dy;
    }
  }
  return { circle: c, circles };
}

function applyGravityStyle({ circle, circles }) {
  const c = clone(circle);

  if (!isInRange(c.y + c.dy, c.yRange)) {
    c.dy = -c.dy * friction;
  } else {
    c.dy += gravity;
  }
  c.y += c.dy;

  return { circle: c, circles };
}

function stopCircle({ circle, circles }) {
  const c = clone(circle);
  if (isInRange(global.mouse.x, { min: c.x - c.radius, max: c.x + c.radius }) && isInRange(global.mouse.y, { min: c.y - c.radius, max: c.y + c.radius})) {
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

function movePerson(key, circle) {
  const c = clone(circle);
  if (key === DOWN) {
    c.y1 += 3;
  } else if (key === UP) {
    c.y1 -= 3;
  } else if (key === RIGHT) {
    c.x1 += 3;
  } else if (key === LEFT) {
    c.x1 -= 3;
  }
  return c;
}

const gravityStyle = compose(applyGravityStyle);
const freeStyle = compose(applyFreeStyle);

function isRed(item) {
  return item && item.fillStyle === 'red';
}

function updateCircles(circles) {
  return circles.map(function(circle) {
    if (isRed(circle)) {
      const { circle: c } = gravityStyle({ circle, circles });
      return c;
    } else {
      const { circle: c } = freeStyle({ circle, circles });
      return c;
    }
  });
}

function updatePerson(key, circles) {
  if (!key) return circles;
  return circles.map(function(item) {
    if (isPerson(item)) {
      return movePerson(key, item);
    }
    return item;
  });
}

function checkOverlapPersonItem(circles, changeItem) {
  const arrow = circles.find(function (item) {
    return isPerson(item);
  });

  if (arrow) {
    return circles.map(function(item) {
      if (isOverlap(arrow, item)) {
        return changeItem(item);
      }
      return item;
    });
  }

  return circles;
}

const LEFT   = 37
const UP     = 38
const RIGHT  = 39
const DOWN   = 40

function setRedColor(item) {
  item.fillStyle = 'red';
  return item;
}

function startAnimation(ctx) {
  let circles = makeCircles(CIRCLES);
  function animate() {
    requestAnimationFrame(animate);
    clearScreen(ctx);
    drawCircles(ctx, circles);
    circles = updateCircles(circles);
    drawPerson(ctx, circles);
    circles = updatePerson(global.key, circles);
    circles = checkOverlapPersonItem(circles, setRedColor);
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
  }, 1000);
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
window.addEventListener('keydown', processKeyEvent, true);
window.addEventListener('mousemove', processMouseEvent, true);
