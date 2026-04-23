// Minimal - just cursor glow effect
const wrapper = document.querySelector('.word-wrapper');

let glowEl = null;

function createGlow() {
  glowEl = document.createElement('div');
  glowEl.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
    z-index: -1;
  `;
  document.body.appendChild(glowEl);
}

function handleMouseMove(e) {
  if (!glowEl) return;
  glowEl.style.left = e.clientX + 'px';
  glowEl.style.top = e.clientY + 'px';
  glowEl.style.opacity = '1';
}

function handleMouseLeave() {
  if (!glowEl) return;
  glowEl.style.opacity = '0';
}

createGlow();
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseleave', handleMouseLeave);
