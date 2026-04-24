import * as THREE from 'three';

// ── Renderer ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(0x020208);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.01, 100
);
camera.position.z = 4.0;

const group = new THREE.Group();
scene.add(group);

// ── Shaders ───────────────────────────────────────────────────────────────────
const vertexShader = `
  uniform float uTime;
  uniform float uSize;
  attribute vec3  aColor;
  attribute float aScale;
  attribute float aPhase;
  varying vec3 vColor;

  void main() {
    vColor = aColor;

    // Subtle breathing displacement along the normal
    float wave = sin(position.x * 3.5 + uTime * 0.55 + aPhase) * 0.022
               + cos(position.y * 2.8 + uTime * 0.40 + aPhase * 1.4) * 0.022;
    vec3 pos = position + normalize(position + vec3(0.0001)) * wave;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * aScale / -mv.z;
    gl_Position  = projectionMatrix * mv;
  }
`;

const fragmentShader = `
  varying vec3 vColor;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float a  = exp(-dot(uv, uv) * 16.0);
    gl_FragColor = vec4(vColor, a);
  }
`;

// ── Helper: make particle ShaderMaterial ──────────────────────────────────────
function makeParticleMat(baseSize) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: baseSize * renderer.getPixelRatio() },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
}

// ── Helper: torus-knot particle geometry ──────────────────────────────────────
// Parametric (p, q) torus knot, t ∈ [0, 2π]
// x = (R + r·cos(q·t))·cos(p·t)
// y = (R + r·cos(q·t))·sin(p·t)
// z = r·sin(q·t)
function makeKnotGeo(count, p, q, R, r, scatter, hueBase, hueSpread) {
  const pos    = new Float32Array(count * 3);
  const col    = new Float32Array(count * 3);
  const scale  = new Float32Array(count);
  const phase  = new Float32Array(count);
  const color  = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const t  = Math.random() * Math.PI * 2;
    const cx = (R + r * Math.cos(q * t)) * Math.cos(p * t);
    const cy = (R + r * Math.cos(q * t)) * Math.sin(p * t);
    const cz = r * Math.sin(q * t);

    pos[i * 3]     = cx + (Math.random() - 0.5) * scatter;
    pos[i * 3 + 1] = cy + (Math.random() - 0.5) * scatter;
    pos[i * 3 + 2] = cz + (Math.random() - 0.5) * scatter;

    color.setHSL((hueBase + Math.random() * hueSpread) % 1.0, 1.0, 0.65);
    col[i * 3]     = color.r;
    col[i * 3 + 1] = color.g;
    col[i * 3 + 2] = color.b;

    scale[i] = 0.35 + Math.random() * 1.3;
    phase[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos,   3));
  geo.setAttribute('aColor',   new THREE.BufferAttribute(col,   3));
  geo.setAttribute('aScale',   new THREE.BufferAttribute(scale, 1));
  geo.setAttribute('aPhase',   new THREE.BufferAttribute(phase, 1));
  return geo;
}

// ── Helper: star-field geometry ───────────────────────────────────────────────
function makeStarGeo(count) {
  const pos   = new Float32Array(count * 3);
  const col   = new Float32Array(count * 3);
  const scale = new Float32Array(count);
  const phase = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const rr    = 7 + Math.random() * 11;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);

    pos[i * 3]     = rr * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = rr * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = rr * Math.cos(phi);

    const b = 0.55 + Math.random() * 0.45;
    col[i * 3]     = b * 0.78;
    col[i * 3 + 1] = b * 0.88;
    col[i * 3 + 2] = b;

    scale[i] = 0.08 + Math.random() * 0.55;
    phase[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos,   3));
  geo.setAttribute('aColor',   new THREE.BufferAttribute(col,   3));
  geo.setAttribute('aScale',   new THREE.BufferAttribute(scale, 1));
  geo.setAttribute('aPhase',   new THREE.BufferAttribute(phase, 1));
  return geo;
}

// ── Particle clouds ───────────────────────────────────────────────────────────

// Outer (2,3) trefoil knot — electric blue / cyan
const outerMat  = makeParticleMat(62);
const outerMesh = new THREE.Points(
  makeKnotGeo(9000, 2, 3, 0.96, 0.33, 0.14, 0.52, 0.24),
  outerMat
);
group.add(outerMesh);

// Inner (3,5) knot — deep violet / indigo
const innerMat  = makeParticleMat(48);
const innerMesh = new THREE.Points(
  makeKnotGeo(4500, 3, 5, 0.56, 0.19, 0.10, 0.72, 0.22),
  innerMat
);
innerMesh.scale.setScalar(0.82);
group.add(innerMesh);

// Stars
const starMat  = makeParticleMat(22);
const starMesh = new THREE.Points(makeStarGeo(1800), starMat);
group.add(starMesh);

// ── Wireframe geometry (central decoration) ───────────────────────────────────
const wireMat = (color, opacity) =>
  new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: false,
  });

const dodec = new THREE.Mesh(
  new THREE.DodecahedronGeometry(0.62, 0),
  wireMat(0x00aaff, 0.13)
);
group.add(dodec);

const icosa = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.40, 1),
  wireMat(0x7733ff, 0.18)
);
group.add(icosa);

// Thin outer ring
const ringGeo = new THREE.TorusGeometry(1.55, 0.003, 4, 120);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0x0066ff,
  transparent: true,
  opacity: 0.25,
  depthWrite: false,
  depthTest: false,
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI * 0.35;
group.add(ring);

// Second ring, slightly tilted the other way
const ring2 = ring.clone();
ring2.rotation.x = -Math.PI * 0.2;
ring2.rotation.z = Math.PI * 0.15;
ring2.material = new THREE.MeshBasicMaterial({
  color: 0x9900ff,
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
  depthTest: false,
});
group.add(ring2);

// ── Mouse parallax ────────────────────────────────────────────────────────────
const mouse  = new THREE.Vector2();
const smooth = new THREE.Vector2();

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Touch support
window.addEventListener('touchmove', e => {
  if (!e.touches[0]) return;
  mouse.x = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const pr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pr);
  outerMat.uniforms.uSize.value = 62 * pr;
  innerMat.uniforms.uSize.value = 48 * pr;
  starMat.uniforms.uSize.value  = 22 * pr;
});

// ── Animation loop ────────────────────────────────────────────────────────────
function animate(ms) {
  requestAnimationFrame(animate);
  const t = ms * 0.001;

  // Update time uniforms
  outerMat.uniforms.uTime.value = t;
  innerMat.uniforms.uTime.value = t;
  starMat.uniforms.uTime.value  = t;

  // Smooth mouse spring
  smooth.x += (mouse.x - smooth.x) * 0.042;
  smooth.y += (mouse.y - smooth.y) * 0.042;

  // Parallax tilt of whole scene
  group.rotation.y =  smooth.x * 0.28;
  group.rotation.x = -smooth.y * 0.20;

  // Independent object rotations
  outerMesh.rotation.z =  t * 0.075;
  innerMesh.rotation.z = -t * 0.115;
  innerMesh.rotation.x =  t * 0.048;

  dodec.rotation.y = t * 0.22;
  dodec.rotation.x = t * 0.14;

  icosa.rotation.y = -t * 0.31;
  icosa.rotation.z =  t * 0.09;

  ring.rotation.z  =  t * 0.06;
  ring2.rotation.z = -t * 0.08;

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
