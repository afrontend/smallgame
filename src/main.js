const CIRCLES  = 99;
const GRAVITY  = 0.1;
const FRICTION = 0.7;
const LEFT     = 37;
const UP       = 38;
const RIGHT    = 39;
const DOWN     = 40;
const global   = {};
global.mouse   = {};
global.key     = null;
global.prevKey = null;

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

function getXRange(min) {
  return { min: min, max: window.innerWidth - min };
}

function getYRange(min) {
  return { min: min, max: window.innerHeight - min };
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
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

function getRadians(angle) {
  return angle * Math.PI/180;
}

function getDxDy(angle, speed) {
  const dx = Math.cos(getRadians(angle)) * speed;
  const dy = Math.sin(getRadians(angle)) * speed;
  return { dx, dy };
}

function createCircle(count) {
  const id = count;
  const radius = getRandomArbitrary(5, 100);
  const x = getRandomX(radius);
  const y = getRandomY(radius);
  const angle = getRandom(360);
  const speed = Math.abs(radius-100)/4;
  const { dx, dy } = getDxDy(angle, speed);
  const xRange = getXRange(radius);
  const yRange = getYRange(radius);
  return { id, radius, x, y, angle, speed, dx, dy, xRange, yRange };
}

function isCircle(item) {
  if (!item) return false;
  const { x, y, radius } = item;
  if (x && y && radius) {
    return true;
  }
  return false;
}

function createPerson(count = 0) {
  const id = count;
  const width = 20;
  const height = 50;
  const x = (window.innerWidth / 2) - (width / 2);
  const y = window.innerHeight - height;
  const fillStyle = 'blue'
  const xRange = getXRange(0);
  return { id, x, y, width, height, fillStyle, xRange };
}

function isPerson(item) {
  if (!item) return false;
  const { x, y, width, height, fillStyle } = item;
  if (x && y && width && height && fillStyle === 'blue') {
    return true;
  }
  return false;
}

function createRope(person) {
  const rope = createPerson();
  rope.x = person.x;
  rope.y = person.y;
  rope.height = person.height / 2;
  rope.yRange = getYRange(0);
  rope.fillStyle = 'yellow';
  rope.id = person.id ? person.id : 0;
  return rope;
}

function isRope(item) {
  if (!item) return false;
  const { x, y, width, height, fillStyle } = item;
  if (x && y && width, height, fillStyle === 'yellow') {
    return true;
  }
  return false;
}

function makeCircles(len) {
  const circles = [];
  let count = len;
  while (count--) {
    const c = createCircle(count);
    if (circles.every(circle => !isOverlap(c, circle))) {
      circles.push(c);
    }
  }
  circles.push(createPerson(++len));
  return circles;
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

const drawCircles = ctx => {
  return circles => {
    circles.forEach(function(circle) {
      if (isCircle(circle)) {
        drawCircle(ctx, circle)
      }
    });
    return circles;
  }
}

const drawPerson = ctx => {
  return circles => {
    circles.forEach(function(item) {
      if(isPerson(item)) {
        ctx.fillStyle = item.fillStyle;
        ctx.fillRect(item.x, item.y, item.width, item.height);
      }
    });
    return circles;
  }
}

const drawRope = ctx => {
  return circles => {
    circles.forEach(function(item) {
      if(isRope(item)) {
        ctx.fillStyle = item.fillStyle;
        ctx.fillRect(item.x, item.y, item.width, item.height);
      }
    });
    return circles;
  }
}

function distance(x1, y1, x2, y2) {
  return Math.floor(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
}

function isOverlap(a, b) {
  if (isPerson(a) || isRope(a)) {
    if (distance(a.x, a.y, b.x, b.y) <= b.radius ||
      distance(a.x + a.width, a.y, b.x, b.y) <= b.radius ||
      distance(a.x, a.y + a.height, b.x, b.y) <= b.radius ||
      distance(a.x + a.width, a.y + a.height, b.x, b.y) <= b.radius
    ) {
      return true;
    }
  }

  if (isCircle(a)) {
    return distance(a.x, a.y, b.x, b.y) <= (a.radius + b.radius);
  }

  return false;
}

function isSomeOverlap(circles, circle) {
  return circles.some(aCircle => isOverlap(aCircle, circle));
}

function isInRange(value, range) {
  return value ? (value >= range.min && value <= range.max) : false;
}

const applyMoveFreely = compose(
  applyMoveLeftOrRight,
  applyMoveUpOrDown
);

function applyMoveLeftOrRight(circle) {
  if (circle.dx === undefined) return circle;
  const c = clone(circle);
  if (isInRange(c.x + c.dx, c.xRange)) {
    c.x += c.dx;
  } else {
    c.angle = 180 - c.angle;
    const { dx } = getDxDy(c.angle, c.speed);
    c.dx = dx;
  }
  return c;
}

function applyMoveUpOrDown(circle) {
  if (circle.dy === undefined) return circle;
  const c = clone(circle);
  if (isInRange(c.y + c.dy, c.yRange)) {
    c.y += c.dy;
  } else {
    c.angle = 360 - c.angle;
    const { dy } = getDxDy(c.angle, c.speed);
    c.dy = dy;
  }
  return c;
}

function applyGravity(circle) {
  const c = clone(circle);
  if (!isInRange(c.y + c.dy, c.yRange)) {
    c.dy = -c.dy * FRICTION;
  } else {
    c.dy += GRAVITY;
  }
  c.y += c.dy;
  return c;
}

function movePerson(person) {
  const p = clone(person);
  if (global.key === RIGHT) {
    if (isInRange(p.x + 3, p.xRange)) {
      p.x += 3;
    }
  } else if (global.key === LEFT) {
    if (isInRange(p.x - 3, p.xRange)) {
      p.x -= 3;
    }
  }
  global.key = null;
  return p;
}

function moveRope(rope) {
  const r = clone(rope);
    r.y -= 10;
  return r;
}

function isRed(item) {
  return item && item.fillStyle === 'red';
}

const checkRope = rope => (
  isInRange(rope.y, rope.yRange) ? moveRope(rope) : {}
);

const applyStyle = filter => styleCb => circles => {
  return circles.map((circle, index, circles) =>
    filter(circle, circles) ? styleCb(circle, circles) : circle
  );
}

const not = f => {
  return (...args) => !f.apply(null, args);
}

const gravity = applyStyle(isRed)(applyGravity);
const moveLeftOrRight = applyStyle(isRed)(applyMoveLeftOrRight);
const moveFreely = applyStyle(not(isRed))(applyMoveFreely);
const updatePerson = applyStyle(isPerson)(movePerson);
const updateRope = applyStyle(isRope)(checkRope);

function findPerson(circles) {
  return circles.find(item => {
    return isPerson(item);
  });
}

function addRope(circles) {
  if (global.key === UP) {
    const p = findPerson(circles);
    if (p) {
      p.id = circles.length;
      circles.push(createRope(p));
    }
    global.key = null;
    // if (global.prevKey === LEFT || global.prevKey === RIGHT) {
      // global.key = global.prevKey;
    // }
  }
  return circles;
}

function checkOverlapPersonItem(circles, changeItem) {
  const p = circles.find(item => isPerson(item));
  if (p) {
    return circles.map(function(item) {
      return isOverlap(p, item) ? changeItem(item) : item;
    });
  }
  return circles;
}

const checkCollision = filter => fn => circles => {
  const filteredItems = circles.filter(item => filter(item));
  if (Array.isArray(filteredItems) && filteredItems.length > 0) {
    return circles.map(circle => {
      return isSomeOverlap(filteredItems, circle) ? fn(circle) : circle;
    });
  }
  return circles;
}


const changeColor = color => item => {
  const newItem = clone(item);
  newItem.fillStyle = color;
  return newItem;
}

const changeRadius = limit => fn => item => {
  const newItem = clone(item);
  if (newItem.radius > limit) {
    newItem.radius = fn(newItem.radius);
  }
  return newItem;
}

const checkPerson = circles => {
  return checkOverlapPersonItem(circles, () => ({}));
};

const checkCollisionRope = checkCollision(isRope)(changeColor('red'))

function isBottom(item) {
  if ((item.y + item.radius) >= window.innerHeight) {
    return true;
  } else {
    return false;
  }
}

function isTop(item) {
  if (item.y <= item.radius) {
    return true;
  } else {
    return false;
  }
}

function countDown(item) {
  if (!item) return item;
  const newItem = clone(item);
  if (newItem.timeoutCount === undefined) {
    newItem.timeoutCount = 100;
  }
  newItem.timeoutCount--;
  return newItem.timeoutCount === 0 ? {} : newItem;
}

const isCircleAndRed = item => (isCircle(item) && isRed(item));
const checkTopOrBottom = item => (isBottom(item) || isTop(item)) ? countDown(item) : item;
const checkItemOnTheBottom = applyStyle(isCircleAndRed)(checkTopOrBottom);
const checkTimeout = checkItemOnTheBottom;

const checkCollideCircle = (circle, circles) => {
  return true;
}
const hitTestCircle = applyStyle(checkCollideCircle)((circle, circles) => circle);

function startAnimation(ctx) {
  let circles = makeCircles(CIRCLES);
  const update = compose(
    moveLeftOrRight,
    gravity,
    moveFreely,
    updatePerson,
    addRope,
    updateRope,
    checkPerson,
    checkCollisionRope,
    checkTimeout,
    hitTestCircle
  );
  const draw = compose(
    drawCircles(ctx),
    drawPerson(ctx),
    drawRope(ctx)
  );
  function animate() {
    requestAnimationFrame(animate);
    circles = update(circles);
    clearScreen(ctx);
    circles = draw(circles);
  }
  animate();
}

function processKeyEvent(e) {
  // global.prevKey = global.key;
  global.key = e.keyCode;
  const letterPressed = String.fromCharCode(global.key)
  console.log(global.key, letterPressed.toLowerCase());
}

function processMouseEvent(e) {
  global.mouse = {x: e.x, y: e.y};
}

function activate() {
  const c = document.querySelector("canvas");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext("2d");
  startAnimation(ctx);
}

window.addEventListener('load', activate);
window.addEventListener('keydown', processKeyEvent, true);
window.addEventListener('mousemove', processMouseEvent, true);
