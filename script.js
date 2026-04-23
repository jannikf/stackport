// Watercolor effect
const canvas = document.getElementById('watercolor');
const ctx = canvas.getContext('2d');

let width, height;
let drops = [];
let mouse = { x: -1000, y: -1000, moving: false };
let lastMouse = { x: 0, y: 0 };

// Pastel colors
const colors = [
  { r: 255, g: 182, b: 193 }, // pink
  { r: 255, g: 218, b: 185 }, // peach
  { r: 173, g: 216, b: 230 }, // light blue
  { r: 176, g: 224, b: 176 }, // soft green
  { r: 221, g: 160, b: 221 }, // plum
  { r: 255, g: 239, b: 169 }, // pale yellow
  { r: 176, g: 196, b: 222 }, // steel blue
  { r: 255, g: 192, b: 150 }, // light coral
];

let colorIndex = 0;

class Drop {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = 20 + Math.random() * 40;
    this.opacity = 0.15 + Math.random() * 0.1;
    this.life = 1;
    this.decay = 0.003 + Math.random() * 0.002;

    // Slight drift
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;

    // Organic shape variation
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.02 + Math.random() * 0.02;
  }

  update() {
    this.life -= this.decay;
    this.x += this.vx;
    this.y += this.vy;
    this.wobble += this.wobbleSpeed;

    // Slow down drift
    this.vx *= 0.99;
    this.vy *= 0.99;
  }

  draw() {
    if (this.life <= 0) return;

    const { r, g, b } = this.color;
    const alpha = this.opacity * this.life;

    // Create soft, organic watercolor blob
    ctx.save();
    ctx.translate(this.x, this.y);

    // Multiple overlapping circles for organic feel
    for (let i = 0; i < 3; i++) {
      const offsetX = Math.sin(this.wobble + i * 2) * this.size * 0.15;
      const offsetY = Math.cos(this.wobble + i * 2.5) * this.size * 0.15;
      const sizeVar = this.size * (0.7 + i * 0.15);

      const gradient = ctx.createRadialGradient(
        offsetX, offsetY, 0,
        offsetX, offsetY, sizeVar
      );

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
      gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
      gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.1})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.beginPath();
      ctx.arc(offsetX, offsetY, sizeVar, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.restore();
  }
}

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  // Fill with background color
  ctx.fillStyle = '#faf9f7';
  ctx.fillRect(0, 0, width, height);
}

function addDrop(x, y) {
  // Cycle through colors
  const color = colors[colorIndex % colors.length];
  colorIndex++;

  // Add some position variance
  const spread = 15;
  const dropX = x + (Math.random() - 0.5) * spread;
  const dropY = y + (Math.random() - 0.5) * spread;

  drops.push(new Drop(dropX, dropY, color));

  // Occasionally add a second drop nearby
  if (Math.random() > 0.6) {
    const nearColor = colors[(colorIndex + 1) % colors.length];
    drops.push(new Drop(
      dropX + (Math.random() - 0.5) * 30,
      dropY + (Math.random() - 0.5) * 30,
      nearColor
    ));
  }
}

function animate() {
  // Subtle fade to restore background
  ctx.fillStyle = 'rgba(250, 249, 247, 0.01)';
  ctx.fillRect(0, 0, width, height);

  // Update and draw drops
  for (let i = drops.length - 1; i >= 0; i--) {
    const drop = drops[i];
    drop.update();
    drop.draw();

    if (drop.life <= 0) {
      drops.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

function handleMouseMove(e) {
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  mouse.x = e.clientX;
  mouse.y = e.clientY;

  // Add drops based on movement speed
  if (dist > 8) {
    addDrop(mouse.x, mouse.y);
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
  }
}

function handleTouchMove(e) {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }
}

function handleResize() {
  init();
  drops = [];
}

window.addEventListener('resize', handleResize);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('touchmove', handleTouchMove);

init();
animate();
