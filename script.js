// Bouncing balls with collision physics
const canvas = document.getElementById('balls');
const ctx = canvas.getContext('2d');

let width, height;
let balls = [];

// Pastel colors
const colors = [
  '#FFB5BA', // pink
  '#B5DEFF', // light blue
  '#BFFCC6', // mint green
  '#FFDFBA', // peach
  '#E2C2FF', // lavender
  '#FFF5BA', // pale yellow
  '#C2F0FF', // sky blue
  '#FFD1DC', // blush
  '#D4F0F0', // teal
  '#FCE4EC', // rose
];

class Ball {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.mass = radius;

    // Random initial velocity
    const speed = 2 + Math.random() * 2;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Subtle shadow/depth
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  update() {
    // Gravity (subtle)
    this.vy += 0.05;

    // Air friction
    this.vx *= 0.999;
    this.vy *= 0.999;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Wall collisions
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -0.9;
    }
    if (this.x + this.radius > width) {
      this.x = width - this.radius;
      this.vx *= -0.9;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -0.9;
    }
    if (this.y + this.radius > height) {
      this.y = height - this.radius;
      this.vy *= -0.9;

      // Add some random bounce to keep things moving
      if (Math.abs(this.vy) < 0.5) {
        this.vy = -(2 + Math.random() * 3);
      }
    }
  }
}

function checkCollision(ball1, ball2) {
  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = ball1.radius + ball2.radius;

  if (dist < minDist) {
    // Collision detected - resolve it
    const angle = Math.atan2(dy, dx);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    // Rotate velocities
    const vx1 = ball1.vx * cos + ball1.vy * sin;
    const vy1 = ball1.vy * cos - ball1.vx * sin;
    const vx2 = ball2.vx * cos + ball2.vy * sin;
    const vy2 = ball2.vy * cos - ball2.vx * sin;

    // Elastic collision formulas
    const m1 = ball1.mass;
    const m2 = ball2.mass;

    const newVx1 = ((m1 - m2) * vx1 + 2 * m2 * vx2) / (m1 + m2);
    const newVx2 = ((m2 - m1) * vx2 + 2 * m1 * vx1) / (m1 + m2);

    // Rotate back
    ball1.vx = newVx1 * cos - vy1 * sin;
    ball1.vy = vy1 * cos + newVx1 * sin;
    ball2.vx = newVx2 * cos - vy2 * sin;
    ball2.vy = vy2 * cos + newVx2 * sin;

    // Separate balls to prevent sticking
    const overlap = minDist - dist;
    const separateX = (overlap / 2) * cos;
    const separateY = (overlap / 2) * sin;

    ball1.x -= separateX;
    ball1.y -= separateY;
    ball2.x += separateX;
    ball2.y += separateY;
  }
}

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  balls = [];

  // Create balls of varying sizes
  const numBalls = Math.min(25, Math.floor((width * height) / 40000));

  for (let i = 0; i < numBalls; i++) {
    const radius = 20 + Math.random() * 60;
    const x = radius + Math.random() * (width - radius * 2);
    const y = radius + Math.random() * (height - radius * 2);
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Check for overlap with existing balls
    let overlapping = false;
    for (const ball of balls) {
      const dx = x - ball.x;
      const dy = y - ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius + ball.radius + 10) {
        overlapping = true;
        break;
      }
    }

    if (!overlapping) {
      balls.push(new Ball(x, y, radius, color));
    }
  }
}

function animate() {
  ctx.fillStyle = '#faf9f7';
  ctx.fillRect(0, 0, width, height);

  // Update all balls
  for (const ball of balls) {
    ball.update();
  }

  // Check collisions between all pairs
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      checkCollision(balls[i], balls[j]);
    }
  }

  // Draw all balls
  for (const ball of balls) {
    ball.draw();
  }

  requestAnimationFrame(animate);
}

// Mouse interaction - push balls away
let mouse = { x: -1000, y: -1000 };

function handleMouseMove(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  // Push nearby balls
  for (const ball of balls) {
    const dx = ball.x - mouse.x;
    const dy = ball.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball.radius + 80;

    if (dist < minDist) {
      const force = (minDist - dist) / minDist * 0.5;
      const angle = Math.atan2(dy, dx);
      ball.vx += Math.cos(angle) * force * 3;
      ball.vy += Math.sin(angle) * force * 3;
    }
  }
}

function handleTouchMove(e) {
  if (e.touches.length > 0) {
    handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
  }
}

window.addEventListener('resize', init);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('touchmove', handleTouchMove);

init();
animate();
