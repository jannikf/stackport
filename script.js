// Particle system
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: 0, y: 0 };
let portal = document.querySelector('.portal');

// Colors matching the design
const colors = [
  'rgba(245, 158, 11, 0.6)',  // amber
  'rgba(6, 182, 212, 0.5)',   // cyan
  'rgba(217, 70, 239, 0.4)',  // magenta
  'rgba(255, 255, 255, 0.3)', // white
];

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    // Start from edges or center
    const startFromCenter = Math.random() > 0.7;

    if (startFromCenter) {
      // Start from center and move outward
      this.x = width / 2 + (Math.random() - 0.5) * 100;
      this.y = height / 2 + (Math.random() - 0.5) * 100;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
    } else {
      // Start from edges and drift
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: // top
          this.x = Math.random() * width;
          this.y = -10;
          break;
        case 1: // right
          this.x = width + 10;
          this.y = Math.random() * height;
          break;
        case 2: // bottom
          this.x = Math.random() * width;
          this.y = height + 10;
          break;
        case 3: // left
          this.x = -10;
          this.y = Math.random() * height;
          break;
      }
      // Drift toward center
      const dx = width / 2 - this.x;
      const dy = height / 2 - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 0.3 + Math.random() * 0.4;
      this.vx = (dx / dist) * speed + (Math.random() - 0.5) * 0.3;
      this.vy = (dy / dist) * speed + (Math.random() - 0.5) * 0.3;
    }

    this.size = 1 + Math.random() * 2;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.life = 0;
    this.maxLife = 200 + Math.random() * 300;
    this.opacity = 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;

    // Fade in and out
    if (this.life < 50) {
      this.opacity = this.life / 50;
    } else if (this.life > this.maxLife - 50) {
      this.opacity = (this.maxLife - this.life) / 50;
    } else {
      this.opacity = 1;
    }

    // Subtle attraction to center
    const dx = width / 2 - this.x;
    const dy = height / 2 - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 50) {
      this.vx += (dx / dist) * 0.002;
      this.vy += (dy / dist) * 0.002;
    }

    // Speed limit
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 1) {
      this.vx = (this.vx / speed) * 1;
      this.vy = (this.vy / speed) * 1;
    }

    // Reset if dead or too far
    if (this.life > this.maxLife || this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace(/[\d.]+\)$/, (this.opacity * 0.6) + ')');
    ctx.fill();

    // Glow effect
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace(/[\d.]+\)$/, (this.opacity * 0.2) + ')');
    ctx.fill();
  }
}

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function init() {
  resize();

  // Create particles
  const particleCount = Math.min(80, Math.floor((width * height) / 15000));
  for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // Stagger initial states
    particles.push(p);
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  for (const particle of particles) {
    particle.update();
    particle.draw();
  }

  requestAnimationFrame(animate);
}

// Mouse parallax effect
function handleMouseMove(e) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const deltaX = (e.clientX - centerX) / centerX;
  const deltaY = (e.clientY - centerY) / centerY;

  // Subtle parallax on the portal
  portal.style.transform = `translate(${deltaX * 15}px, ${deltaY * 15}px) rotateX(${deltaY * 5}deg) rotateY(${-deltaX * 5}deg)`;
}

function handleMouseLeave() {
  portal.style.transform = 'translate(0, 0) rotateX(0) rotateY(0)';
}

// Touch support
function handleTouchMove(e) {
  if (e.touches.length > 0) {
    handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
  }
}

// Event listeners
window.addEventListener('resize', resize);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseleave', handleMouseLeave);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchend', handleMouseLeave);

// Initialize
init();
animate();
