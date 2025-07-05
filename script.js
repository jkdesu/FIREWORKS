let scene, camera, renderer;
let fireworks = [];

const PARTICLE_COUNT = 3000;
const MAX_FIREWORKS = 5;
const shapes = ['sphere', 'ring', 'star'];
const colorPalette = [0xB6E696, 0xA95EA3, 0xdc3a70, 0x1686CD];

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 800;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("scene"), alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  setInterval(spawnFirework, 1000);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function spawnFirework() {
  if (fireworks.length > MAX_FIREWORKS) {
    const old = fireworks.shift();
    scene.remove(old.system);
  }

  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const offsetX = 300 + Math.random() * 300; // Right side
  const offsetY = THREE.MathUtils.randFloatSpread(300) - 100;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let x = 0, y = 0, z = 0;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 100 + 80;

    if (shape === 'sphere') {
      x = Math.sin(angle) * r;
      y = Math.cos(angle) * r;
      z = THREE.MathUtils.randFloatSpread(r);
    } else if (shape === 'ring') {
      x = Math.sin(angle) * r;
      y = Math.cos(angle) * r;
    } else if (shape === 'star') {
      const spikes = 5;
      const outer = r;
      const inner = r * 0.4;
      const radius = (i % 2 === 0) ? outer : inner;
      x = Math.cos(angle * spikes) * radius;
      y = Math.sin(angle * spikes) * radius;
    }

    positions[i * 3] = offsetX;
    positions[i * 3 + 1] = offsetY;
    positions[i * 3 + 2] = 0;

    velocities[i * 3] = x * 0.02;
    velocities[i * 3 + 1] = y * 0.02;
    velocities[i * 3 + 2] = z * 0.02;

    const hex = new THREE.Color(colorPalette[i % colorPalette.length]);
    colors[i * 3] = hex.r;
    colors[i * 3 + 1] = hex.g;
    colors[i * 3 + 2] = hex.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 6.5,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(geometry, material);
  fireworks.push({ system: particleSystem, life: 0 });
  scene.add(particleSystem);
}

function animate() {
  requestAnimationFrame(animate);

  fireworks.forEach(fw => {
    const pos = fw.system.geometry.attributes.position.array;
    const vel = fw.system.geometry.attributes.velocity.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] += vel[i * 3];
      pos[i * 3 + 1] += vel[i * 3 + 1];
      pos[i * 3 + 2] += vel[i * 3 + 2];

      vel[i * 3] *= 0.97;
      vel[i * 3 + 1] *= 0.97;
      vel[i * 3 + 2] *= 0.97;
    }

    fw.system.geometry.attributes.position.needsUpdate = true;
    fw.life += 1;
    if (fw.life > 100) fw.system.material.opacity -= 0.01;
  });

  renderer.render(scene, camera);
}
