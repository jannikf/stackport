// Interactive dot grid
const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');

let width, height;
let dots = [];
let mouse = { x: -1000, y: -1000 };

const SPACING = 40;
const DOT_SIZE = 1;
const INTERACTION_RADIUS = 120;
const RETURN_SPEED = 0.08;
const PUSH_STRENGTH = 0.4;

class Dot {
  constructor(x, y) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }

  update() {
    // Distance from mouse
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Push away from mouse
    if (dist < INTERACTION_RADIUS) {
      const force = (INTERACTION_RADIUS - dist) / INTERACTION_RADIUS;
      const angle = Math.atan2(dy, dx);
      this.vx -= Math.cos(angle) * force * PUSH_STRENGTH;
      this.vy -= Math.sin(angle) * force * PUSH_STRENGTH;
    }

    // Return to base position
    this.vx += (this.baseX - this.x) * RETURN_SPEED;
    this.vy += (this.baseY - this.y) * RETURN_SPEED;

    // Apply friction
    this.vx *= 0.85;
    this.vy *= 0.85;

    // Update position
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    // Calculate displacement for opacity
    const displacement = Math.sqrt(
      Math.pow(this.x - this.baseX, 2) +
      Math.pow(this.y - this.baseY, 2)
    );

    // Base opacity + boost when displaced
    const opacity = 0.15 + Math.min(displacement / 30, 0.6);

    ctx.beginPath();
    ctx.arc(this.x, this.y, DOT_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fill();
  }
}

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  dots = [];

  // Create grid of dots
  const cols = Math.ceil(width / SPACING) + 1;
  const rows = Math.ceil(height / SPACING) + 1;

  const offsetX = (width - (cols - 1) * SPACING) / 2;
  const offsetY = (height - (rows - 1) * SPACING) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = offsetX + i * SPACING;
      const y = offsetY + j * SPACING;
      dots.push(new Dot(x, y));
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  for (const dot of dots) {
    dot.update();
    dot.draw();
  }

  requestAnimationFrame(animate);
}

function handleMouseMove(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
}

function handleMouseLeave() {
  mouse.x = -1000;
  mouse.y = -1000;
}

function handleResize() {
  init();
}

// Touch support
function handleTouchMove(e) {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
}

function handleTouchEnd() {
  mouse.x = -1000;
  mouse.y = -1000;
}

window.addEventListener('resize', handleResize);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseleave', handleMouseLeave);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchend', handleTouchEnd);

init();
animate();
