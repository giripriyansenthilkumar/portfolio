import { useEffect, useRef } from 'react';

const DEPTH_ZONES = [
  { d: 0,    r: 0, g: 70,  b: 155 },
  { d: 0.12, r: 0, g: 58,  b: 135 },
  { d: 0.25, r: 0, g: 42,  b: 110 },
  { d: 0.40, r: 0, g: 28,  b: 85  },
  { d: 0.55, r: 0, g: 18,  b: 62  },
  { d: 0.70, r: 0, g: 10,  b: 42  },
  { d: 0.85, r: 0, g: 5,   b: 26  },
  { d: 1,    r: 0, g: 2,   b: 12  },
];

function getColor(depth) {
  let lo = DEPTH_ZONES[0], hi = DEPTH_ZONES[DEPTH_ZONES.length - 1];
  for (let i = 0; i < DEPTH_ZONES.length - 1; i++) {
    if (depth >= DEPTH_ZONES[i].d && depth <= DEPTH_ZONES[i + 1].d) {
      lo = DEPTH_ZONES[i]; hi = DEPTH_ZONES[i + 1]; break;
    }
  }
  const t = (depth - lo.d) / (hi.d - lo.d || 1);
  return {
    r: Math.round(lo.r + (hi.r - lo.r) * t),
    g: Math.round(lo.g + (hi.g - lo.g) * t),
    b: Math.round(lo.b + (hi.b - lo.b) * t),
  };
}

export default function OceanCanvas({ scrollDepth }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ W: 0, H: 0, bubbles: [], rays: [], parts: [], cT: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    const resize = () => {
      state.W = canvas.width = window.innerWidth;
      state.H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // --- Bubbles ---
    class Bubble {
      constructor(init) {
        this.reset(init);
      }
      reset(init) {
        this.x = Math.random() * state.W;
        this.y = init ? Math.random() * state.H : state.H + 20;
        this.r = Math.random() * 5.5 + 1.2;
        this.vy = -(Math.random() * 0.7 + 0.18);
        this.vx = (Math.random() - 0.5) * 0.28;
        this.osc = Math.random() * Math.PI * 2;
        this.os = Math.random() * 0.045 + 0.01;
        this.oa = Math.random() * 1.6 + 0.3;
        this.al = Math.random() * 0.5 + 0.15;
      }
      update() {
        this.y += this.vy;
        this.osc += this.os;
        this.x += Math.sin(this.osc) * this.oa * 0.28 + this.vx;
        if (this.y + this.r < 0) this.reset(false);
      }
      draw(col) {
        const g = ctx.createRadialGradient(this.x - this.r * 0.3, this.y - this.r * 0.3, 0, this.x, this.y, this.r);
        g.addColorStop(0, `rgba(255,255,255,${this.al * 0.9})`);
        g.addColorStop(0.55, `rgba(${col.r + 55},${col.g + 75},${col.b + 80},${this.al * 0.38})`);
        g.addColorStop(1, `rgba(${col.r},${col.g + 35},${col.b + 55},0)`);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${this.al * 0.45})`; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }

    // --- Rays ---
    class Ray {
      constructor(i, n) {
        this.bx = (i / (n - 1)) * state.W * 1.5 - state.W * 0.25;
        this.angle = (Math.random() - 0.5) * 0.22;
        this.width = Math.random() * 65 + 25;
        this.al = Math.random() * 0.075 + 0.018;
        this.spd = (Math.random() - 0.5) * 0.0005;
        this.wave = Math.random() * Math.PI * 2;
      }
      update() { this.wave += 0.005; this.angle += this.spd; }
      draw(dep) {
        if (dep > 0.78) return;
        const op = Math.max(0, (1 - dep * 1.28));
        const sp = Math.sin(this.wave) * 14;
        const x0 = this.bx + sp, len = state.H * 1.6;
        const x1 = x0 + Math.sin(this.angle) * len;
        const g = ctx.createLinearGradient(x0, 0, x1, len);
        g.addColorStop(0, `rgba(120,230,255,${this.al * op * 2.8})`);
        g.addColorStop(0.3, `rgba(60,180,255,${this.al * op})`);
        g.addColorStop(1, `rgba(0,80,200,0)`);
        const hw = this.width / 2;
        ctx.save(); ctx.beginPath();
        ctx.moveTo(x0 - hw, 0); ctx.lineTo(x0 + hw, 0);
        ctx.lineTo(x1 + hw * 0.14, len); ctx.lineTo(x1 - hw * 0.14, len);
        ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      }
    }

    // --- Particles ---
    class Particle {
      constructor(init) {
        this.reset(init);
      }
      reset(init) {
        this.x = Math.random() * state.W;
        this.y = init ? Math.random() * state.H : state.H + 10;
        this.sz = Math.random() * 1.8 + 0.3;
        this.vy = -(Math.random() * 0.25 + 0.05);
        this.vx = (Math.random() - 0.5) * 0.18;
        this.al = Math.random() * 0.35 + 0.05;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.y < 0) this.reset(false);
      }
      draw(col) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r + 75},${col.g + 100},${col.b + 80},${this.al})`;
        ctx.fill();
      }
    }

    state.bubbles = Array.from({ length: 60 }, () => new Bubble(true));
    state.rays = Array.from({ length: 9 }, (_, i) => new Ray(i, 9));
    state.parts = Array.from({ length: 85 }, () => new Particle(true));

    let animId;
    const drawFrame = () => {
      const dep = scrollDepth.current ?? 0;
      const col = getColor(dep);
      const { W, H } = state;

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, `rgb(${col.r},${col.g},${col.b})`);
      bg.addColorStop(0.42, `rgb(${Math.max(0, col.r - 2)},${Math.max(0, col.g - 9)},${Math.max(0, col.b - 18)})`);
      bg.addColorStop(1, `rgb(0,${Math.max(0, col.g >> 2)},${Math.max(0, col.b >> 1)})`);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Rays
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      state.rays.forEach(r => { r.update(); r.draw(dep); });
      ctx.restore();

      // Caustics
      if (dep < 0.62) {
        const al = Math.max(0, (0.62 - dep) * 0.09);
        state.cT += 0.005;
        ctx.save(); ctx.globalAlpha = al;
        for (let i = 0; i < 20; i++) {
          const cx = (i / 20) * W * 1.5 - W * 0.25 + Math.sin(state.cT * 0.7 + i) * 38;
          const cy = H * 0.58 + Math.cos(state.cT * 0.5 + i * 0.75) * 28;
          const r = 22 + Math.sin(state.cT + i * 0.6) * 14;
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          g.addColorStop(0, `rgba(${col.r + 75},${col.g + 100},${col.b + 100},.65)`);
          g.addColorStop(1, `rgba(0,0,0,0)`);
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        }
        ctx.restore();
      }

      state.parts.forEach(p => { p.update(); p.draw(col); });
      state.bubbles.forEach(b => { b.update(); b.draw(col); });

      // Surface shimmer
      if (dep < 0.32) {
        const a = (1 - dep / 0.32) * 0.17;
        const sg = ctx.createLinearGradient(0, 0, 0, H * 0.15);
        sg.addColorStop(0, `rgba(160,230,255,${a})`); sg.addColorStop(1, `rgba(0,100,200,0)`);
        ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.15);
      }

      // Vignette
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, `rgba(0,0,${Math.max(0, col.b >> 3)},.5)`);
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(drawFrame);
    };

    drawFrame();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="ocean-canvas" />;
}
