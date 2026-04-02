import * as THREE from 'three';

export async function initHeroCanvas(wrapper: HTMLElement): Promise<() => void> {
  // 1. Scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 4.2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const getSize = () => wrapper.offsetWidth || wrapper.clientWidth || 400;
  renderer.setSize(getSize(), getSize());
  wrapper.appendChild(renderer.domElement);

  const ro = new ResizeObserver(() => {
    const s = getSize();
    renderer.setSize(s, s);
    renderer.render(scene, camera);
  });
  ro.observe(wrapper);

  // 2. Lighting — key from upper-left + fill + rim for metallic depth
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));

  const keyLight = new THREE.DirectionalLight(0xffd0aa, 2.2);
  keyLight.position.set(-3, 5, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xaabbff, 0.7);
  fillLight.position.set(5, 2, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rimLight.position.set(0, -4, -4);
  scene.add(rimLight);

  // 3. Materials
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xD73F18,
    metalness: 0.6,
    roughness: 0.3,
  });

  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x0260F4,
    metalness: 0.6,
    roughness: 0.3,
  });

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xF4F4F4,
    metalness: 0.25,
    roughness: 0.28,
  });

  // 4. Depth constants
  const FACE_DEPTH = 0.13;
  const WHITE_DEPTH = 0.28;
  const WHITE_Z = 0.02;
  const CURVE_SEGS = 64;

  const group = new THREE.Group();

  // ── FRONT FACE (rojo — up-arrows + smile) ───────────────────────────────────

  // Red circle base
  const circleShape = new THREE.Shape();
  circleShape.absarc(0, 0, 1.5, 0, Math.PI * 2, false);
  group.add(
    mesh(circleShape, FACE_DEPTH, redMat, {
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 8,
      curveSegments: CURVE_SEGS,
    })
  );

  // White ring border
  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, 1.38, 0, Math.PI * 2, false);
  const ringHole = new THREE.Path();
  ringHole.absarc(0, 0, 1.20, 0, Math.PI * 2, false);
  ringShape.holes.push(ringHole);
  group.add(mesh(ringShape, WHITE_DEPTH, whiteMat, { curveSegments: CURVE_SEGS }, WHITE_Z));

  // Up-arrow eyes
  function makeArrowUp(cx: number, cy: number): THREE.Mesh {
    const AW = 0.240;
    const SW = 0.140;
    const TIP_Y = cy + 0.34;
    const HEAD_BASE_Y = cy + 0.08;
    const STEM_BOT_Y = cy - 0.27;

    const s = new THREE.Shape();
    s.moveTo(cx - AW, HEAD_BASE_Y);
    s.lineTo(cx, TIP_Y);
    s.lineTo(cx + AW, HEAD_BASE_Y);
    s.lineTo(cx + SW, HEAD_BASE_Y);
    s.lineTo(cx + SW, STEM_BOT_Y);
    s.lineTo(cx - SW, STEM_BOT_Y);
    s.lineTo(cx - SW, HEAD_BASE_Y);
    s.closePath();
    return mesh(s, WHITE_DEPTH, whiteMat, { curveSegments: 4 }, WHITE_Z);
  }

  group.add(makeArrowUp(-0.44, 0.16));
  group.add(makeArrowUp(0.44, 0.16));

  // Smile arc
  const SC_Y = -0.06;
  const smileShape = new THREE.Shape();
  smileShape.absarc(0, SC_Y, 0.68, Math.PI * (7 / 6), Math.PI * (11 / 6), false);
  smileShape.absarc(0, SC_Y, 0.52, Math.PI * (11 / 6), Math.PI * (7 / 6), true);
  smileShape.closePath();
  group.add(mesh(smileShape, WHITE_DEPTH, whiteMat, { curveSegments: 48 }, WHITE_Z));

  // ── BACK FACE (azul — ← ← | ● ) ────────────────────────────────────────────
  // backGroup rotated π on Y → its local +z extrudes BACKWARD in world space
  // Local x/y coordinates map to viewer x/y correctly when viewing the back face

  const backGroup = new THREE.Group();
  backGroup.rotation.y = Math.PI;

  // Blue circle base
  const blueCircleShape = new THREE.Shape();
  blueCircleShape.absarc(0, 0, 1.5, 0, Math.PI * 2, false);
  backGroup.add(
    mesh(blueCircleShape, FACE_DEPTH, blueMat, {
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 8,
      curveSegments: CURVE_SEGS,
    })
  );

  // White ring border
  const backRingShape = new THREE.Shape();
  backRingShape.absarc(0, 0, 1.38, 0, Math.PI * 2, false);
  const backRingHole = new THREE.Path();
  backRingHole.absarc(0, 0, 1.20, 0, Math.PI * 2, false);
  backRingShape.holes.push(backRingHole);
  backGroup.add(mesh(backRingShape, WHITE_DEPTH, whiteMat, { curveSegments: CURVE_SEGS }, WHITE_Z));

  // Eyes: same up-arrows as front face
  backGroup.add(makeArrowUp(-0.44, 0.16));
  backGroup.add(makeArrowUp(0.44, 0.16));

  // Mouth: straight horizontal line
  const MY = -0.40;  // vertical center of mouth
  const MH = 0.085;  // half-height of line
  const MW = 0.56;   // half-width of line
  const mouthShape = new THREE.Shape();
  mouthShape.moveTo(-MW, MY - MH);
  mouthShape.lineTo( MW, MY - MH);
  mouthShape.lineTo( MW, MY + MH);
  mouthShape.lineTo(-MW, MY + MH);
  mouthShape.closePath();
  backGroup.add(mesh(mouthShape, WHITE_DEPTH, whiteMat, {}, WHITE_Z));

  // Tongue: semicircle below-left, flat edge flush with bottom of mouth
  const tongueR  = 0.27;
  const tongueCX = -0.22;      // left-of-center, under the mouth
  const tongueCY = MY - MH;    // top of tongue = bottom edge of mouth
  const tongueShape = new THREE.Shape();
  // counter-clockwise from π to 0 traces the bottom half of the circle
  tongueShape.absarc(tongueCX, tongueCY, tongueR, Math.PI, 0, false);
  tongueShape.closePath();
  backGroup.add(mesh(tongueShape, WHITE_DEPTH, whiteMat, { curveSegments: 32 }, WHITE_Z));

  group.add(backGroup);

  // Center coin on z axis (front 0→+FACE_DEPTH, back 0→-FACE_DEPTH)
  group.position.z = 0;
  scene.add(group);

  // 9. Animation — continuous full rotation + gentle float
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafId: number;

  function animate(ts: number) {
    const t = ts / 1000;
    group.rotation.y = t * 0.65;             // one full spin ~9.7 s
    group.position.y = Math.sin(t * 0.7) * 0.15;
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  if (!prefersReduced) {
    rafId = requestAnimationFrame(animate);
  } else {
    renderer.render(scene, camera);
  }

  // 10. Teardown
  function teardown() {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    group.traverse((obj: THREE.Object3D) => {
      const m = obj as THREE.Mesh;
      if (m.isMesh) {
        m.geometry.dispose();
        if (Array.isArray(m.material)) {
          (m.material as THREE.Material[]).forEach((x) => x.dispose());
        } else {
          (m.material as THREE.Material).dispose();
        }
      }
    });
    renderer.forceContextLoss();
    renderer.dispose();
  }

  window.addEventListener('pagehide', teardown, { once: true });
  return teardown;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function mesh(
  shape: THREE.Shape,
  depth: number,
  mat: THREE.Material,
  extrudeOpts: Partial<THREE.ExtrudeGeometryOptions> = {},
  zOffset = 0
): THREE.Mesh {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    ...extrudeOpts,
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.z = zOffset;
  return m;
}
