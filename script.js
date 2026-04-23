// Retro perspective grid
const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function drawGrid() {
  ctx.clearRect(0, 0, width, height);

  // Horizon position
  const horizon = height * 0.5;
  const vanishX = width / 2;

  // Grid colors
  const gridColor = 'rgba(99, 102, 241, 0.25)';
  const glowColor = 'rgba(139, 92, 246, 0.15)';

  // Draw vertical lines converging to vanishing point
  const verticalLines = 30;
  const spread = width * 1.5;

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  for (let i = -verticalLines; i <= verticalLines; i++) {
    const x = vanishX + (i / verticalLines) * spread;

    ctx.beginPath();
    ctx.moveTo(vanishX, horizon);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal lines with perspective
  const horizontalLines = 20;
  const lineSpacing = 40;

  for (let i = 0; i < horizontalLines; i++) {
    // Animated offset for scrolling effect
    const offset = (time * 0.5) % lineSpacing;
    const baseY = horizon + (i * lineSpacing) + offset;

    if (baseY > height) continue;
    if (baseY < horizon) continue;

    // Perspective scale
    const t = (baseY - horizon) / (height - horizon);
    const perspectiveScale = Math.pow(t, 0.8);

    // Line opacity based on distance
    const opacity = 0.1 + perspectiveScale * 0.3;

    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
    ctx.lineWidth = 0.5 + perspectiveScale * 1.5;

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(width, baseY);
    ctx.stroke();
  }

  // Horizon glow
  const gradient = ctx.createLinearGradient(0, horizon - 50, 0, horizon + 100);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.4, 'rgba(139, 92, 246, 0.1)');
  gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
  gradient.addColorStop(0.6, 'rgba(99, 102, 241, 0.1)');
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, horizon - 50, width, 150);

  // Sun/light source
  const sunGradient = ctx.createRadialGradient(vanishX, horizon, 0, vanishX, horizon, 200);
  sunGradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
  sunGradient.addColorStop(0.3, 'rgba(139, 92, 246, 0.15)');
  sunGradient.addColorStop(0.6, 'rgba(99, 102, 241, 0.05)');
  sunGradient.addColorStop(1, 'transparent');

  ctx.fillStyle = sunGradient;
  ctx.fillRect(0, 0, width, height);

  time++;
}

function animate() {
  drawGrid();
  requestAnimationFrame(animate);
}

// Mouse parallax for letters
const word = document.querySelector('.word');
const letters = document.querySelectorAll('.letter');

function handleMouseMove(e) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const deltaX = (e.clientX - centerX) / centerX;
  const deltaY = (e.clientY - centerY) / centerY;

  // Subtle rotation on the whole word
  word.style.transform = `
    translateY(0)
    rotateX(${5 + deltaY * 5}deg)
    rotateY(${deltaX * 8}deg)
  `;

  // Individual letter depth based on mouse proximity
  letters.forEach((letter, i) => {
    const rect = letter.getBoundingClientRect();
    const letterCenterX = rect.left + rect.width / 2;
    const letterCenterY = rect.top + rect.height / 2;

    const distX = e.clientX - letterCenterX;
    const distY = e.clientY - letterCenterY;
    const dist = Math.sqrt(distX * distX + distY * distY);
    const maxDist = 300;

    const proximity = Math.max(0, 1 - dist / maxDist);
    const lift = proximity * 15;

    letter.style.transform = `translateY(${-lift}px) translateZ(${lift * 2}px)`;
  });
}

function handleMouseLeave() {
  word.style.transform = 'translateY(0) rotateX(5deg) rotateY(0)';
  letters.forEach(letter => {
    letter.style.transform = 'translateY(0) translateZ(0)';
  });
}

// Randomized glitch timing
function randomGlitch() {
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const main = randomLetter.querySelector('.letter-main');

  main.style.animation = 'none';
  main.offsetHeight; // Force reflow
  main.style.animation = 'glitch 0.3s ease-in-out';

  setTimeout(randomGlitch, 2000 + Math.random() * 5000);
}

// Initialize
window.addEventListener('resize', resize);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseleave', handleMouseLeave);

resize();
animate();
setTimeout(randomGlitch, 3000);
