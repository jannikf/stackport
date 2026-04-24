'use strict';

const canvas  = document.getElementById('canvas');
const ctx     = canvas.getContext('2d');
const dotEl   = document.getElementById('cursor-dot');
const ringEl  = document.getElementById('cursor-ring');
const content = document.querySelector('.content');

// ── Mouse ─────────────────────────────────────────────────────────────────────

let mx = -9999, my = -9999; // cursor position (off-screen until first move)
let rx = -9999, ry = -9999; // ring position (springs toward cursor)
let firstMove = true;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  if (firstMove) {
    // Snap ring on first appearance so it doesn't fly in from off-screen
    rx = mx;
    ry = my;
    firstMove = false;
  }
});

document.addEventListener('mouseleave', () => {
  mx = -9999;
  my = -9999;
});

// ── Dot grid ──────────────────────────────────────────────────────────────────

const SPACING = 36;   // px between dots
const BASE_R  = 1.2;  // resting dot radius
const MAX_R   = 5.8;  // max radius near cursor
const GLOW_D  = 190;  // glow influence radius (px)
const REPEL_D = 105;  // repulsion influence radius (px)
const REPEL_F = 20;   // max repulsion displacement (px)
const SPRING  = 0.12; // spring stiffness (0–1)

let W, H, N;
let dotBX, dotBY; // base positions
let dotCX, dotCY; // current positions (spring)
let dotR;         // current radii (spring)

function buildGrid() {
  const cols = Math.floor(W / SPACING) + 2;
  const rows = Math.floor(H / SPACING) + 2;
  const ox   = (W - (cols - 1) * SPACING) / 2;
  const oy   = (H - (rows - 1) * SPACING) / 2;

  N     = cols * rows;
  dotBX = new Float32Array(N);
  dotBY = new Float32Array(N);
  dotCX = new Float32Array(N);
  dotCY = new Float32Array(N);
  dotR  = new Float32Array(N).fill(BASE_R);

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++, i++) {
      const x = ox + c * SPACING;
      const y = oy + r * SPACING;
      dotBX[i] = dotCX[i] = x;
      dotBY[i] = dotCY[i] = y;
    }
  }
}

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildGrid();
}

// ── Draw frame ────────────────────────────────────────────────────────────────

function draw() {
  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i < N; i++) {
    const bx = dotBX[i];
    const by = dotBY[i];
    const dx = bx - mx;
    const dy = by - my;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Repulsion — push dot away from cursor
    let tx = bx, ty = by;
    if (dist < REPEL_D && dist > 0.01) {
      const f = (1 - dist / REPEL_D) * REPEL_F;
      tx = bx + (dx / dist) * f;
      ty = by + (dy / dist) * f;
    }
    dotCX[i] += (tx - dotCX[i]) * SPRING;
    dotCY[i] += (ty - dotCY[i]) * SPRING;

    // Radius — grow toward cursor
    const ratio   = dist < GLOW_D ? 1 - dist / GLOW_D : 0;
    const targetR = BASE_R + ratio * (MAX_R - BASE_R);
    dotR[i] += (targetR - dotR[i]) * SPRING;

    // Color — dim white → bright blue-white
    const alpha = 0.07 + ratio * 0.83;
    const r = (ratio * 80)       | 0;
    const g = (70  + ratio * 170) | 0;
    const b = (200 + ratio * 55)  | 0;

    ctx.beginPath();
    ctx.arc(dotCX[i], dotCY[i], dotR[i], 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
    ctx.fill();
  }
}

// ── Animation loop ────────────────────────────────────────────────────────────

function animate() {
  requestAnimationFrame(animate);

  // Cursor ring springs toward cursor
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;

  dotEl.style.transform  = `translate(${mx}px,${my}px)`;
  ringEl.style.transform = `translate(${rx}px,${ry}px)`;

  // Subtle 3D tilt of text based on mouse position
  if (mx > -100) {
    const tiltX = ((my / H) - 0.5) * -7;
    const tiltY = ((mx / W) - 0.5) *  9;
    content.style.transform =
      `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
  }

  draw();
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(animate);
