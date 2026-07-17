import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

/* ── Shared mouse state (module-level, no re-renders) ── */
const MS = {
  x:  typeof window !== 'undefined' ? window.innerWidth  / 2 : 400,
  y:  typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
  vx: 0,
  vy: 0,
};

/* ── Spawn DOM bubble particle ── */
function spawnBubble(x, y) {
  const b  = document.createElement('div');
  b.className = 'bubble-particle';
  const sz = Math.random() * 6 + 2;
  b.style.cssText = `left:${x + (Math.random()-0.5)*18}px;top:${y-14}px;width:${sz}px;height:${sz}px;--dur:${(Math.random()*1.2+0.9).toFixed(1)}s;`;
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 2300);
}

/* ══════════════════════════════════════════════════════
   3-D diver model rendered inside R3F Canvas
══════════════════════════════════════════════════════ */
function Diver3D() {
  const groupRef   = useRef();
  const { scene, animations } = useGLTF('/diver.glb');
  const { actions } = useAnimations(animations, groupRef);
  const { size }   = useThree();

  // Smooth lerp refs (no state = no re-renders)
  const smoothX   = useRef(0);
  const smoothY   = useRef(0);
  const yaw       = useRef(Math.PI);
  const pitch     = useRef(0);
  const roll      = useRef(0);
  const lastBub   = useRef(0);
  const fitted    = useRef(false);

  /* ── Scale & orient the GLB once ── */
  useEffect(() => {
    if (!scene || fitted.current) return;
    fitted.current = true;

    const box = new THREE.Box3().setFromObject(scene);
    const sz  = box.getSize(new THREE.Vector3());
    const ctr = box.getCenter(new THREE.Vector3());

    // Target ≈ 140 screen-pixels tall (ortho cam: 1 world unit = 1 px)
    const scl = 140 / Math.max(sz.y, 0.001);
    scene.scale.setScalar(scl);

    // Re-centre pivot around model center
    scene.position.sub(ctr.clone().multiplyScalar(scl));

    // Shift model UP so the cursor sits at the diver's waist/torso
    // (positive Y = upward in world space = the cursor dot hits the body center)
    scene.position.y += sz.y * scl * 0.18;  // move model down so head is near cursor

    // Most GLB divers face –Z; flip to face camera (+Z)
    scene.rotation.y = Math.PI;
  }, [scene]);

  /* ── Start all animations (swim cycle → hand movements) ── */
  useEffect(() => {
    if (!actions) return;
    const clips = Object.values(actions);
    if (!clips.length) return;
    clips.forEach(a => {
      a.reset();
      a.setLoop(THREE.LoopRepeat, Infinity);
      a.timeScale = 1.3;   // slightly faster swim feels more alive
      a.play();
    });
    return () => clips.forEach(a => a.stop());
  }, [actions]);

  /* ── Per-frame update ── */
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    /* Screen → ortho world coords
       In R3F ortho (zoom=1): world(0,0) = screen centre          */
    const wx = MS.x - size.width  / 2;
    const wy = size.height / 2 - MS.y;   // flip Y

    /* Tight follow — high lerp keeps diver close to cursor */
    smoothX.current += (wx - smoothX.current) * 0.18;
    smoothY.current += (wy - smoothY.current) * 0.18;

    const spd = Math.hypot(MS.vx, MS.vy);

    /* Body rotation toward movement direction */
    if (spd > 0.5) {
      // Yaw  – turn toward horizontal movement
      const targetYaw   = Math.PI - MS.vx * 0.048;
      yaw.current      += (targetYaw - yaw.current)   * 0.07;
      // Pitch – nose-down / nose-up
      const targetPitch = MS.vy * 0.035;
      pitch.current    += (targetPitch - pitch.current) * 0.07;
      // Roll  – bank into turns
      const targetRoll  = -MS.vx * 0.022;
      roll.current     += (targetRoll - roll.current)  * 0.07;
    } else {
      // Return to neutral pose
      yaw.current   += (Math.PI - yaw.current)   * 0.03;
      pitch.current += (0 - pitch.current)        * 0.03;
      roll.current  += (0 - roll.current)         * 0.03;
    }

    /* Apply transforms — position locked exactly to cursor */
    groupRef.current.position.set(
      smoothX.current,
      smoothY.current,   // no positional bob – stays on cursor
      0,
    );
    // Subtle idle sway as a rotation (doesn't shift diver away from cursor)
    groupRef.current.rotation.z = roll.current + Math.sin(clock.elapsedTime * 0.7) * 0.04;
    groupRef.current.rotation.y = yaw.current;
    groupRef.current.rotation.x = pitch.current;
    // rotation.z already set above (roll + idle sway)

    /* Bubble trail when moving */
    const now = Date.now();
    if (spd > 0.7 && now - lastBub.current > 210) {
      spawnBubble(MS.x, MS.y);
      lastBub.current = now;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

/* ══════════════════════════════════════════════════════
   Exported component
══════════════════════════════════════════════════════ */
export default function DiverCursor({ isWelcome }) {
  /* Track mouse velocity globally */
  useEffect(() => {
    const onMove = (e) => {
      MS.vx = e.clientX - MS.x;
      MS.vy = e.clientY - MS.y;
      MS.x  = e.clientX;
      MS.y  = e.clientY;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  if (isWelcome) return null;

  return (
    <Canvas
      style={{
        position : 'fixed',
        inset    : 0,
        zIndex   : 8000,
        pointerEvents : 'none',
        width    : '100vw',
        height   : '100vh',
      }}
      orthographic
      camera={{ zoom: 1, near: -2000, far: 2000, position: [0, 0, 100] }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      {/* Underwater-tinted lighting for the 3-D model */}
      <ambientLight      intensity={0.55}  color="#88aacc" />
      <directionalLight  position={[4,10,6]}  intensity={1.9} color="#cceeff" />
      <pointLight        position={[-5,5,8]}   intensity={1.7} color="#00e5ff" distance={500} />
      <pointLight        position={[5,-3,5]}   intensity={0.5} color="#0044bb" distance={400} />
      <hemisphereLight   args={["#002244","#001133", 0.4]} />

      {/* Suspense: shows nothing while GLB loads, then model appears */}
      <Suspense fallback={null}>
        <Diver3D />
      </Suspense>
    </Canvas>
  );
}
