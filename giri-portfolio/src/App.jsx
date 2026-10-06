import { useState, useRef, useEffect, useCallback } from 'react';
import CustomCursor from './components/CustomCursor';
import OceanCanvas from './components/OceanCanvas';
import DiverCursor from './components/DiverCursor';
import WelcomeScreen from './components/WelcomeScreen';
import Navbar from './components/Navbar';
import CardModal from './components/CardModal';
import {
  Hero, Experience, Skills, Projects,
  Education, Achievements, Certifications,
  Publications, Contact, useGlassGlow,
} from './components/Sections';

/* ── Cursor-driven edge scroll ─────────────────────────────────
   When the cursor drifts into the bottom 18% of the viewport the
   page glides downward; top 8% scrolls it back up.
   Speed is proportional to how deep into the zone the cursor is.
────────────────────────────────────────────────────────────── */
function useEdgeScroll(active) {
  const mouseYRef = useRef(window.innerHeight / 2);

  useEffect(() => {
    const onMove = (e) => { mouseYRef.current = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    if (!active) return;

    const BOTTOM_ZONE = 0.82; // bottom 18 %  → scroll down
    const TOP_ZONE    = 0.08; // top 8 %      → scroll up
    const MAX_PX      = 11;   // max scroll px per frame

    let rafId;
    const tick = () => {
      const H     = window.innerHeight;
      const ratio = mouseYRef.current / H;

      if (ratio > BOTTOM_ZONE) {
        const strength = (ratio - BOTTOM_ZONE) / (1 - BOTTOM_ZONE);
        window.scrollBy({ top: strength * MAX_PX, behavior: 'instant' });
      } else if (ratio < TOP_ZONE && window.scrollY > 0) {
        const strength = (TOP_ZONE - ratio) / TOP_ZONE;
        window.scrollBy({ top: -strength * MAX_PX * 0.7, behavior: 'instant' });
      }

      rafId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafId);
  }, [active]);
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const scrollDepthRef = useRef(0);
  const [scrollDepth, setScrollDepth] = useState(0);

  // Glass glow tracking
  useGlassGlow();

  // Edge scroll – only active once portfolio is visible
  useEdgeScroll(hasEntered);

  // Scroll depth for ocean colour / depth meter
  useEffect(() => {
    if (!hasEntered) return;
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const depth = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      scrollDepthRef.current = depth;
      setScrollDepth(depth);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasEntered]);

  const handleEnter = useCallback(() => {
    setHasEntered(true);
    setTimeout(() => setShowWelcome(false), 1500);
  }, []);

  const openModal  = useCallback((card) => setActiveModal(card), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <>
      {/* Custom cursor dot + ring (dot hidden when 3-D diver is active) */}
      <CustomCursor isWelcome={!hasEntered} />

      {/* Animated deep-ocean background (always on) */}
      <OceanCanvas scrollDepth={scrollDepthRef} />

      {/* Welcome – boat + dive sequence */}
      {showWelcome && <WelcomeScreen onEnter={handleEnter} />}

      {/* 3-D diver cursor (hidden on welcome, shown after dive) */}
      <DiverCursor isWelcome={!hasEntered} />

      {/* Main portfolio content */}
      <div
        className={`portfolio${hasEntered ? ' visible' : ''}`}
        id="portfolio"
        style={{ display: hasEntered ? 'block' : 'none' }}
      >
        <Navbar scrollDepth={scrollDepth} />
        <Hero />
        <Experience onCardClick={openModal} />
        <Skills />
        <Projects />
        <Education />
        <Achievements onCardClick={openModal} />
        <Certifications onCardClick={openModal} />
        <Publications />
        <Contact />
      </div>

      {/* Enlarged card modal */}
      {activeModal && <CardModal card={activeModal} onClose={closeModal} />}
    </>
  );
}
