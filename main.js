import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, particles, geometry, material, particleSystem;
let targetPositions = [];

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 500;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const controls = new OrbitControls(camera, renderer.domElement);

  geometry = new THREE.BufferGeometry();
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(800);
    positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(800);
    positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(800);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  material = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Load target peacock shape from image
  loadImageToParticleTargets('./peacock.png');
}

function loadImageToParticleTargets(src) {
  const image = new Image();
  image.src = src;
  image.crossOrigin = 'Anonymous';
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, 256, 256);
    const imageData = ctx.getImageData(0, 0, 256, 256).data;

    for (let y = 0; y < 256; y += 4) {
      for (let x = 0; x < 256; x += 4) {
        const idx = (y * 256 + x) * 4;
        const r = imageData[idx + 0];
        const g = imageData[idx + 1];
        const b = imageData[idx + 2];
        const alpha = imageData[idx + 3];

        if (alpha > 100) {
          const xpos = x - 128;
          const ypos = -(y - 128);
          const zpos = THREE.MathUtils.randFloatSpread(50);
          targetPositions.push(new THREE.Vector3(xpos * 2, ypos * 2, zpos));
        }
      }
    }
  };
}

function animate() {
  requestAnimationFrame(animate);
  const positions = geometry.attributes.position.array;

  // Morph particles toward peacock
  if (targetPositions.length > 0) {
    for (let i = 0; i < targetPositions.length && i < positions.length / 3; i++) {
      const tp = targetPositions[i];
      positions[i * 3 + 0] += (tp.x - positions[i * 3 + 0]) * 0.05;
      positions[i * 3 + 1] += (tp.y - positions[i * 3 + 1]) * 0.05;
      positions[i * 3 + 2] += (tp.z - positions[i * 3 + 2]) * 0.05;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}
