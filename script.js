// Subtle mouse parallax
const word = document.querySelector('.word');
const letters = document.querySelectorAll('.letter');

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

function handleMouseMove(e) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  mouseX = (e.clientX - centerX) / centerX;
  mouseY = (e.clientY - centerY) / centerY;
}

function animate() {
  // Smooth interpolation
  currentX += (mouseX - currentX) * 0.05;
  currentY += (mouseY - currentY) * 0.05;

  // Very subtle movement
  const moveX = currentX * 8;
  const moveY = currentY * 4;

  word.style.transform = `translate(${moveX}px, ${moveY}px)`;

  requestAnimationFrame(animate);
}

document.addEventListener('mousemove', handleMouseMove);
animate();
