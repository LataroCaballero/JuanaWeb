import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

export async function initHeroCanvas(wrapper: HTMLElement): Promise<() => void> {
  // 1. Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0); // Transparent — inherits #131313 from CSS
  const size = wrapper.clientWidth;
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  wrapper.appendChild(renderer.domElement);

  // 2. Lighting (per UI-SPEC)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xb6c4ff, 1.2);
  dirLight.position.set(5, 8, 5);
  scene.add(dirLight);

  // 3. Load SVG and build mesh
  const loader = new SVGLoader();
  const data = await loader.loadAsync('/assets/smiley-logo.svg');

  const group = new THREE.Group();
  group.scale.y *= -1; // Fix SVG Y-axis inversion (CRITICAL — Pitfall 2)

  for (const path of data.paths) {
    const shapes = SVGLoader.createShapes(path); // Preferred over path.toShapes()

    // Determine material per path fill color
    const fillColor = path.color;
    const isEye = fillColor && fillColor.getHex() === 0x131313;

    const material = isEye
      ? new THREE.MeshStandardMaterial({
          color: 0x131313,
          metalness: 0.5,
          roughness: 0.4,
        })
      : new THREE.MeshStandardMaterial({
          color: 0x0055ff,
          metalness: 0.7,
          roughness: 0.2,
        });

    for (const shape of shapes) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 10,
        bevelEnabled: false,
      });
      const mesh = new THREE.Mesh(geometry, material);

      // Position eye meshes slightly forward so they are visible on the circle face
      if (isEye) {
        mesh.position.z = 1;
      }

      group.add(mesh);
    }
  }

  // 4. Center and scale the group
  const box = new THREE.Box3().setFromObject(group);
  const center = new THREE.Vector3();
  box.getCenter(center);
  group.position.sub(center);

  // Auto-fit scale: fit logo to roughly 3 scene units, visible at camera z=5 with FOV 45
  const sizeVec = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
  const fitScale = 3.0 / maxDim;
  group.scale.multiplyScalar(fitScale);

  scene.add(group);

  // 5. Animation loop
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafId: number;

  function animate(timestamp: number) {
    const elapsed = timestamp / 1000;
    group.rotation.y += 0.003;
    group.position.y = Math.sin(elapsed * 0.8) * 0.05;
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  if (!prefersReduced) {
    rafId = requestAnimationFrame(animate);
  } else {
    // Reduced motion: render single static frame only
    renderer.render(scene, camera);
  }

  // 6. Teardown function (HERO-04)
  function teardown() {
    cancelAnimationFrame(rafId);

    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          (mesh.material as THREE.Material).dispose();
        }
      }
    });

    // forceContextLoss BEFORE dispose — per GitHub #27100
    renderer.forceContextLoss();
    renderer.dispose();
  }

  window.addEventListener('pagehide', teardown, { once: true });

  return teardown;
}
