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

  // Resize observer — keep canvas square with wrapper
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
    color: 0xc13301,
    metalness: 0.6,
    roughness: 0.3,
  });

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.25,
    roughness: 0.28,
  });

  // 4. Depth constants — white always protrudes more than red
  const RED_DEPTH = 0.13;
  const WHITE_DEPTH = 0.28;
  const WHITE_Z = 0.02; // small offset to avoid z-fighting on shared base

  const group = new THREE.Group();
  const CURVE_SEGS = 64;

  // 5. Red circle base (r = 1.5, bevel for soft edge)
  const circleShape = new THREE.Shape();
  circleShape.absarc(0, 0, 1.5, 0, Math.PI * 2, false);
  group.add(
    mesh(circleShape, RED_DEPTH, redMat, {
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 8,
      curveSegments: CURVE_SEGS,
    })
  );

  // 6. White ring border (annulus via evenodd hole)
  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, 1.38, 0, Math.PI * 2, false);
  const ringHole = new THREE.Path();
  ringHole.absarc(0, 0, 1.20, 0, Math.PI * 2, false);
  ringShape.holes.push(ringHole);
  group.add(
    mesh(ringShape, WHITE_DEPTH, whiteMat, { curveSegments: CURVE_SEGS }, WHITE_Z)
  );

  // 7. Up-arrow eyes
  // Each arrow: triangle tip + rectangular stem
  function makeArrow(cx: number, cy: number): THREE.Mesh {
    const AW = 0.175; // arrow head half-width
    const SW = 0.105; // stem half-width
    const TIP_Y = cy + 0.25;
    const HEAD_BASE_Y = cy + 0.06;
    const STEM_BOT_Y = cy - 0.20;

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

  group.add(makeArrow(-0.44, 0.16));
  group.add(makeArrow(0.44, 0.16));

  // 8. Smile — thick U-arc (annular sector)
  const SC_Y = -0.06;
  const S_OUT = 0.56;
  const S_IN = 0.42;
  const ANG_START = Math.PI * (7 / 6); // 210° → lower-left
  const ANG_END = Math.PI * (11 / 6);  // 330° → lower-right

  const smileShape = new THREE.Shape();
  // outer arc CCW from 210° to 330° (curves through bottom = smile curve)
  smileShape.absarc(0, SC_Y, S_OUT, ANG_START, ANG_END, false);
  // inner arc CW from 330° back to 210°
  smileShape.absarc(0, SC_Y, S_IN, ANG_END, ANG_START, true);
  smileShape.closePath();

  group.add(
    mesh(smileShape, WHITE_DEPTH, whiteMat, { curveSegments: 48 }, WHITE_Z)
  );

  // Center group depth so front face is roughly at z=0 for camera
  group.position.z = -(RED_DEPTH / 2);
  scene.add(group);

  // 9. Animation — gentle Y-sway + float
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafId: number;

  function animate(ts: number) {
    const t = ts / 1000;
    group.rotation.y = Math.sin(t * 0.5) * 0.45;
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
