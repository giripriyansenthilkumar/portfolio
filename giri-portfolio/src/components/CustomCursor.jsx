import { useEffect, useRef } from 'react';

/**
 * CustomCursor
 * - On the welcome screen: shows dot + ring (no 3D diver yet)
 * - After diving: hides the dot but keeps the subtle ring so the
 *   3D diver model IS the cursor — ring provides a gentle targeting
 *   circle around the diver without competing with it visually.
 */
export default function CustomCursor({ isWelcome }) {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let rafId;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot snaps instantly to cursor
      if (dotRef.current) {
        dotRef.current.style.left = mouseX + 'px';
        dotRef.current.style.top  = mouseY + 'px';
      }
    };

    const animate = () => {
      // Ring lags slightly for a "sonar ping" effect around the diver
      ringX += (mouseX - ringX) * 0.13;
      ringY += (mouseY - ringY) * 0.13;
      if (ringRef.current) {
        ringRef.current.style.left = ringX + 'px';
        ringRef.current.style.top  = ringY + 'px';
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Dot: visible on welcome, hidden once 3-D diver takes over */}
      <div
        className="cursor-dot"
        ref={dotRef}
        style={{ opacity: isWelcome ? 1 : 0 }}
      />
      {/* Ring: always shown — acts as sonar ping around the diver */}
      <div
        className="cursor-ring"
        ref={ringRef}
        style={{
          opacity    : isWelcome ? 1 : 0.35,
          width      : isWelcome ? '36px' : '52px',
          height     : isWelcome ? '36px' : '52px',
          borderColor: 'rgba(0,229,255,0.45)',
          transition : 'opacity 0.5s, width 0.5s, height 0.5s',
        }}
      />
    </>
  );
}
