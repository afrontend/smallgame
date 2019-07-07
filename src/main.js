let c = null; // canvas
let ctx = null; // context

function drawScreen(ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, 100, 100);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(500,500);
  ctx.stroke();
}

let x = Math.random() * window.innerWidth;
let y = Math.random() * window.innerHeight;
let dx = Math.random() * 100
let dy = Math.random() * 100
let radius = Math.random() * 200;
function drawCircle(ctx) {
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2, false);
    ctx.stroke();
    if( x + radius > innerWidth || x - radius < 0 ) dx = -dx;
    x += dx;
    if( y + radius > innerHeight || y - radius < 0 ) dy = -dy;
    y += dy;
  }

  animate();
}

function activate() {
  c = document.querySelector("canvas");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  ctx = c.getContext("2d");
  //drawScreen(ctx);
  drawCircle(ctx);
}

function processEventKey(e) {
  const letterPressed = String.fromCharCode(e.keyCode)
  console.log(letterPressed.toLowerCase());
}

window.addEventListener('load', activate);
window.addEventListener('keyup', processEventKey, true);
