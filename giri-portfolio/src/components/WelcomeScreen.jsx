import { useEffect, useRef, useState } from 'react';

/* ════════════════════════════════════════════════════
   BOAT CANVAS  –  sailing boat + diver dive sequence
════════════════════════════════════════════════════ */
function BoatCanvas({ onDiveStart, diveTriggered }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    boatX: -500,
    boatY: 0,
    targetX: null,
    sailing: true,
    diving: false,
    divePhase: 0,
    diverVisible: false,
    splashParticles: [],
    wakes: [],
    ripples: [],
    waveT: 0,
  });

  useEffect(() => {
    if (diveTriggered) stateRef.current.targetX = 'center';
  }, [diveTriggered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    const S = stateRef.current;
    const BOAT_SCALE = 2.2;   // ← large ship

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      if (S.boatX < 0) S.boatX = -500;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── Wave height at x ─────────────────────────────── */
    const waveAt = (x) => {
      const t = S.waveT;
      return (
        Math.sin(x * 0.006 + t) * 22 +
        Math.sin(x * 0.012 + t * 1.4) * 12 +
        Math.sin(x * 0.003 + t * 0.55) * 9
      );
    };

    /* ══ REALISTIC SHIP drawing ════════════════════════ */
    const drawBoat = (x, y, sc = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);

      // ── Shadow beneath hull ──
      ctx.shadowColor  = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur   = 22;
      ctx.shadowOffsetY = 8;

      // ── Main hull (deep keel shape) ──
      const hullGrad = ctx.createLinearGradient(-90, -28, 90, 28);
      hullGrad.addColorStop(0,   '#6B2F0A');
      hullGrad.addColorStop(0.25,'#8B4513');
      hullGrad.addColorStop(0.55,'#A0522D');
      hullGrad.addColorStop(0.8, '#7A3410');
      hullGrad.addColorStop(1,   '#4A1E06');
      ctx.fillStyle = hullGrad;
      ctx.beginPath();
      ctx.moveTo(-90, 5);
      ctx.bezierCurveTo(-88, -28, -42, -36, 0, -36);
      ctx.bezierCurveTo(42, -36, 88, -28, 95, 5);
      ctx.bezierCurveTo(85, 22, 42, 30, 0, 30);
      ctx.bezierCurveTo(-42, 30, -85, 22, -90, 5);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      // ── Hull waterline stripe ──
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-88, 2);
      ctx.bezierCurveTo(-50, -8, 50, -8, 88, 2);
      ctx.stroke();

      // ── Red keel accent ──
      ctx.strokeStyle = '#CC2200';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-85, 10);
      ctx.bezierCurveTo(-50, 18, 50, 18, 85, 10);
      ctx.stroke();

      // ── Deck planks ──
      const deckGrad = ctx.createLinearGradient(-78, -38, 78, -48);
      deckGrad.addColorStop(0,   '#B8732A');
      deckGrad.addColorStop(0.5, '#D4894A');
      deckGrad.addColorStop(1,   '#966028');
      ctx.fillStyle = deckGrad;
      ctx.beginPath();
      ctx.moveTo(-78, -36);
      ctx.lineTo(78,  -36);
      ctx.lineTo(72,  -47);
      ctx.lineTo(-72, -47);
      ctx.closePath();
      ctx.fill();

      // Deck plank lines
      ctx.strokeStyle = 'rgba(80,40,10,0.4)';
      ctx.lineWidth = 1.5;
      for (let px = -65; px <= 65; px += 18) {
        ctx.beginPath();
        ctx.moveTo(px, -47); ctx.lineTo(px, -36);
        ctx.stroke();
      }

      // ── Cabin / wheelhouse ──
      const cabinGrad = ctx.createLinearGradient(-28, -75, 28, -47);
      cabinGrad.addColorStop(0, '#C8A060');
      cabinGrad.addColorStop(1, '#8B6030');
      ctx.fillStyle = cabinGrad;
      ctx.beginPath();
      ctx.roundRect(-28, -75, 56, 28, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,220,150,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cabin windows
      const windowPositions = [-18, 0, 18];
      windowPositions.forEach(wx => {
        // Window frame
        ctx.fillStyle = '#334';
        ctx.beginPath(); ctx.roundRect(wx - 7, -68, 12, 10, 2); ctx.fill();
        // Glass
        const wGrad = ctx.createLinearGradient(wx-7, -68, wx+5, -58);
        wGrad.addColorStop(0, 'rgba(180,240,255,0.7)');
        wGrad.addColorStop(1, 'rgba(80,140,200,0.5)');
        ctx.fillStyle = wGrad;
        ctx.beginPath(); ctx.roundRect(wx-6, -67, 10, 8, 2); ctx.fill();
        // Window reflection
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath(); ctx.roundRect(wx-5, -66, 3, 3, 1); ctx.fill();
      });

      // ── Railing ──
      ctx.strokeStyle = 'rgba(200,180,140,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-76, -47); ctx.lineTo(76, -47);
      ctx.stroke();
      for (let rx = -76; rx <= 76; rx += 14) {
        ctx.beginPath();
        ctx.moveTo(rx, -47); ctx.lineTo(rx, -36);
        ctx.stroke();
      }

      // ── Forward mast ──
      const mastGrad = ctx.createLinearGradient(-2, -47, 3, -180);
      mastGrad.addColorStop(0, '#7A5C3A');
      mastGrad.addColorStop(0.5, '#9A7C5A');
      mastGrad.addColorStop(1, '#6A4C2A');
      ctx.strokeStyle = mastGrad;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, -47); ctx.lineTo(-12, -195);
      ctx.stroke();

      // ── Rear mast (shorter) ──
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(45, -47); ctx.lineTo(44, -155);
      ctx.stroke();

      // ── Main sail (large billowing) ──
      const ms = ctx.createLinearGradient(-75, -185, 40, -50);
      ms.addColorStop(0,   'rgba(248,252,255,0.97)');
      ms.addColorStop(0.3, 'rgba(215,235,255,0.92)');
      ms.addColorStop(0.7, 'rgba(185,215,245,0.85)');
      ms.addColorStop(1,   'rgba(155,190,230,0.78)');
      ctx.fillStyle = ms;
      ctx.beginPath();
      ctx.moveTo(-12, -192);
      ctx.bezierCurveTo(-18, -155, -88, -120, -78, -52);
      ctx.lineTo(-8, -52);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,170,220,0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Sail highlight sheen
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, -178);
      ctx.bezierCurveTo(-28, -145, -52, -110, -45, -65);
      ctx.stroke();
      // Horizontal boom at bottom of sail
      ctx.strokeStyle = '#7A5C3A';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-12, -52); ctx.lineTo(-82, -52);
      ctx.stroke();

      // ── Fore sail ──
      const fs = ctx.createLinearGradient(-12, -185, 44, -52);
      fs.addColorStop(0,   'rgba(240,250,255,0.93)');
      fs.addColorStop(0.5, 'rgba(200,228,255,0.85)');
      fs.addColorStop(1,   'rgba(170,205,245,0.78)');
      ctx.fillStyle = fs;
      ctx.beginPath();
      ctx.moveTo(-12, -186);
      ctx.bezierCurveTo(-6, -148, 65, -115, 58, -52);
      ctx.lineTo(-8, -52);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,170,220,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Rear sail ──
      const rs = ctx.createLinearGradient(44, -150, 90, -52);
      rs.addColorStop(0,   'rgba(230,245,255,0.9)');
      rs.addColorStop(1,   'rgba(160,200,240,0.78)');
      ctx.fillStyle = rs;
      ctx.beginPath();
      ctx.moveTo(44, -150);
      ctx.bezierCurveTo(48, -115, 96, -90, 88, -52);
      ctx.lineTo(42, -52);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,160,210,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Rigging lines ──
      ctx.strokeStyle = 'rgba(160,130,80,0.5)';
      ctx.lineWidth = 1.2;
      [
        [[-12,-190],[-82,-52]], [[-12,-190],[60,-52]],
        [[-12,-190],[90,-30]], [[44,-150],[90,-30]],
        [[-12,-190],[-12,-52]],
      ].forEach(([[x1,y1],[x2,y2]]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });

      // ── Masthead flag ──
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(-12, -196);
      ctx.lineTo(14, -188);
      ctx.lineTo(-12, -180);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,229,255,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Anchor chain ──
      ctx.strokeStyle = 'rgba(150,130,100,0.45)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(-80, 5); ctx.lineTo(-90, 25);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Crew silhouette (2 figures on deck) ──
      const drawCrewFigure = (fx) => {
        ctx.fillStyle = 'rgba(30,20,10,0.75)';
        // Body
        ctx.beginPath(); ctx.ellipse(fx, -58, 4, 8, 0, 0, Math.PI*2); ctx.fill();
        // Head
        ctx.beginPath(); ctx.arc(fx, -68, 4, 0, Math.PI*2); ctx.fill();
        // Arm 1
        ctx.strokeStyle = 'rgba(30,20,10,0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(fx-4,-60); ctx.lineTo(fx-12,-56); ctx.stroke();
        // Arm 2 (raised, pointing)
        ctx.beginPath(); ctx.moveTo(fx+4,-62); ctx.lineTo(fx+10,-56); ctx.stroke();
      };
      drawCrewFigure(-42);
      drawCrewFigure(22);

      ctx.restore();
    };

    /* ── Diver figure (falling / pike-dive) ───────────── */
    const drawFallingDiver = (x, y, angle, phase) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const s = 52;
      const kickL = Math.sin(phase * 3.5) * 0.15;
      const kickR = -kickL;
      const armL = Math.sin(phase * 3.5 + 0.4) * 0.1;

      // Body (wetsuit)
      const bg = ctx.createLinearGradient(-s*0.09, -s*0.32, s*0.09, s*0.18);
      bg.addColorStop(0, '#1a4a6b');
      bg.addColorStop(0.4, '#0d2d45');
      bg.addColorStop(1, '#081a2e');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(0, -s*0.07, s*0.09, s*0.3, 0, 0, Math.PI*2);
      ctx.fill();

      // Wetsuit cyan stripe
      ctx.strokeStyle = 'rgba(0,229,255,0.5)';
      ctx.lineWidth = s*0.013;
      ctx.beginPath();
      ctx.moveTo(-s*0.07, -s*0.28);
      ctx.lineTo(-s*0.07,  s*0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo( s*0.07, -s*0.28);
      ctx.lineTo( s*0.07,  s*0.1);
      ctx.stroke();

      // Oxygen tank
      const tg = ctx.createLinearGradient(-s*0.13,-s*0.25, -s*0.06,-s*0.25);
      tg.addColorStop(0,'#c0c8d0'); tg.addColorStop(0.5,'#8898aa'); tg.addColorStop(1,'#5a6878');
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.roundRect(-s*0.14,-s*0.27, s*0.07,s*0.22, s*0.015); ctx.fill();

      // Head + mask
      const hg = ctx.createRadialGradient(-s*0.01,-s*0.47,0, 0,-s*0.45,s*0.11);
      hg.addColorStop(0,'#3a6a8a'); hg.addColorStop(0.6,'#1a3a55'); hg.addColorStop(1,'#0d2030');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(0,-s*0.46,s*0.09,s*0.11,0,0,Math.PI*2); ctx.fill();

      const vg = ctx.createLinearGradient(-s*0.07,-s*0.52, s*0.07,-s*0.38);
      vg.addColorStop(0,'rgba(0,200,255,0.55)'); vg.addColorStop(1,'rgba(0,100,200,0.75)');
      ctx.fillStyle = vg; ctx.beginPath(); ctx.ellipse(s*0.01,-s*0.46,s*0.07,s*0.08,0,0,Math.PI*2); ctx.fill();
      // Visor reflection
      ctx.fillStyle='rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.ellipse(-s*0.01,-s*0.5,s*0.026,s*0.02,-0.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(0,229,255,0.8)'; ctx.lineWidth=1.8;
      ctx.beginPath(); ctx.ellipse(s*0.01,-s*0.46,s*0.075,s*0.088,0,0,Math.PI*2); ctx.stroke();

      // Regulator hose
      ctx.strokeStyle='#2a4a60'; ctx.lineWidth=s*0.022;
      ctx.beginPath(); ctx.moveTo(s*0.065,-s*0.43);
      ctx.bezierCurveTo(s*0.13,-s*0.39,s*0.11,-s*0.3,s*0.07,-s*0.23); ctx.stroke();

      // Arms – stretched forward in pike pose, animate the left arm
      ctx.save();
      ctx.translate(-s*0.09,-s*0.25); ctx.rotate(-0.5 + armL*0.4);
      ctx.fillStyle='#1a4a6b';
      ctx.beginPath(); ctx.roundRect(-s*0.03,0,s*0.06,s*0.34,s*0.022); ctx.fill();
      ctx.fillStyle='#0a1e30';
      ctx.beginPath(); ctx.ellipse(0,s*0.36,s*0.042,s*0.036,0,0,Math.PI*2); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(s*0.09,-s*0.25); ctx.rotate(0.5 - armL*0.4);
      ctx.fillStyle='#1a4a6b';
      ctx.beginPath(); ctx.roundRect(-s*0.03,0,s*0.06,s*0.34,s*0.022); ctx.fill();
      ctx.fillStyle='#0a1e30';
      ctx.beginPath(); ctx.ellipse(0,s*0.36,s*0.042,s*0.036,0,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // Legs
      [[{tx:-s*0.045,rot:kickL},{tx:s*0.045,rot:kickR}]].flat().forEach(({tx,rot}) => {
        ctx.save(); ctx.translate(tx,s*0.18); ctx.rotate(rot);
        ctx.fillStyle='#0d2d45';
        ctx.beginPath(); ctx.roundRect(-s*0.033,0,s*0.066,s*0.36,s*0.022); ctx.fill();
        // Fins
        ctx.fillStyle='#00b8d4';
        ctx.beginPath();
        ctx.moveTo(-s*0.04,s*0.36);
        ctx.bezierCurveTo(-s*0.15,s*0.39,-s*0.17,s*0.5,-s*0.08,s*0.52);
        ctx.bezierCurveTo(-s*0.01,s*0.54,s*0.03,s*0.44,s*0.02,s*0.36);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      });

      // Glow
      const gl = ctx.createRadialGradient(0,0,0,0,0,s*0.65);
      gl.addColorStop(0,'rgba(0,229,255,0.1)'); gl.addColorStop(1,'rgba(0,100,200,0)');
      ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(0,0,s*0.65,0,Math.PI*2); ctx.fill();

      ctx.restore();
    };

    /* ── Splash particles ───────────────────────────── */
    const spawnSplash = (x, y) => {
      for (let i = 0; i < 35; i++) {
        const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
        const speed = Math.random() * 8 + 2.5;
        S.splashParticles.push({
          x, y,
          vx: Math.cos(angle) * speed * (0.5 + Math.random()),
          vy: Math.sin(angle) * speed - Math.random() * 3,
          r: Math.random() * 5 + 1.5,
          al: Math.random() * 0.8 + 0.2,
          life: 1,
          decay: Math.random() * 0.02 + 0.012,
        });
      }
      S.ripples.push({ x, y, r: 4, maxR: 150, life: 1 });
      S.ripples.push({ x, y: y+14, r: 2, maxR: 90, life: 1 });
    };

    /* ── Ocean waves ────────────────────────────────── */
    const drawWaves = () => {
      const wY = H * 0.72;

      const og = ctx.createLinearGradient(0, wY, 0, H);
      og.addColorStop(0,   'rgba(0,90,220,0.88)');
      og.addColorStop(0.25,'rgba(0,60,175,0.92)');
      og.addColorStop(0.6, 'rgba(0,35,130,0.95)');
      og.addColorStop(1,   'rgba(0,15,75,0.98)');
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.moveTo(0, wY);
      for (let x = 0; x <= W; x += 5) ctx.lineTo(x, wY + waveAt(x));
      ctx.lineTo(W, H); ctx.lineTo(0, H);
      ctx.closePath(); ctx.fill();

      // Surface gloss
      ctx.strokeStyle='rgba(140,230,255,0.55)'; ctx.lineWidth=2.2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 5) {
        if (x===0) ctx.moveTo(x, wY + waveAt(x));
        else       ctx.lineTo(x, wY + waveAt(x));
      }
      ctx.stroke();

      // Second wave layer
      ctx.strokeStyle='rgba(90,180,255,0.28)'; ctx.lineWidth=1.8;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 5) {
        const y2 = wY + Math.sin(x*0.009 + S.waveT*0.75 + 1.2)*15 + Math.sin(x*0.018 + S.waveT)*7;
        if (x===0) ctx.moveTo(x, y2); else ctx.lineTo(x, y2);
      }
      ctx.stroke();

      // Foam flecks
      ctx.fillStyle='rgba(220,245,255,0.4)';
      for (let i=0; i<12; i++) {
        const fx = (i/12)*W + Math.sin(S.waveT*0.5 + i*0.8)*30;
        const fy = wY + waveAt(fx) + Math.random()*4-2;
        ctx.beginPath(); ctx.ellipse(fx, fy, Math.random()*12+4, 2, 0, 0, Math.PI*2); ctx.fill();
      }
    };

    /* ── Boat wake ──────────────────────────────────── */
    const drawWake = (x, y) => {
      if (!S.sailing && !S.targetX) return;
      ctx.save(); ctx.globalAlpha = 0.28;
      for (let i = 1; i <= 6; i++) {
        ctx.strokeStyle = `rgba(200,240,255,${0.28 - i*0.04})`;
        ctx.lineWidth = i * 2.5;
        ctx.beginPath();
        ctx.moveTo(x - 88, y + 8);
        ctx.bezierCurveTo(x-140-i*22, y+8, x-170-i*24, y+18+i*4, x-240-i*32, y+28+i*6);
        ctx.stroke();
      }
      ctx.restore();
    };

    let animId;
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      S.waveT += 0.016;

      const wY = H * 0.72;
      // Boat sits on water – hull bottom at wY
      // Hull bottom (in boat local) at +30*sc, so: boatY + 30*sc = wY + waveAt
      const sc = BOAT_SCALE;
      const wH = waveAt(S.boatX);
      S.boatY = wY + wH - 30 * sc;

      /* ── Sail to center ── */
      if (S.targetX === 'center') {
        const cx = W / 2;
        if (S.boatX < cx - 15) {
          S.boatX += 4.5;
        } else {
          // Arrived → launch diver
          S.targetX = null;
          S.sailing  = false;
          S.diving   = true;
          S.divePhase = 0;
          S.diverVisible = true;
          spawnSplash(S.boatX, wY + waveAt(S.boatX));
          setTimeout(() => onDiveStart(), 1600);
        }
      }

      /* ── Normal sailing ── */
      if (!S.diving && S.targetX !== 'center') {
        S.boatX += 1.6;
        if (S.boatX > W + 600) S.boatX = -500;
      }

      /* ── Draw scene ── */
      drawWaves();
      drawWake(S.boatX, S.boatY);

      // Boat (behind diver splash)
      drawBoat(S.boatX, S.boatY, sc);

      /* ── Diver arc ── */
      if (S.diverVisible) {
        S.divePhase += 1;
        const t = S.divePhase;

        if (t < 130) {
          const p = t / 130;
          const startX = S.boatX + 15;
          const startY = S.boatY - 48 * sc; // from deck level
          const endX   = S.boatX + 35;
          const endY   = wY + waveAt(S.boatX + 35) + 18;
          const ctrlX  = S.boatX + 95;
          const ctrlY  = S.boatY - 260;

          const bx = (1-p)**2 * startX + 2*(1-p)*p*ctrlX + p**2 * endX;
          const by = (1-p)**2 * startY + 2*(1-p)*p*ctrlY + p**2 * endY;

          // Tangent = direction of travel
          const tdx = 2*(1-p)*(ctrlX-startX) + 2*p*(endX-ctrlX);
          const tdy = 2*(1-p)*(ctrlY-startY) + 2*p*(endY-ctrlY);
          const ang = Math.atan2(tdy, tdx) + Math.PI / 2;

          drawFallingDiver(bx, by, ang, t);

          if (t === 105) spawnSplash(bx, wY + waveAt(bx));
        } else {
          S.diverVisible = false;
        }
      }

      /* ── Splash particles ── */
      S.splashParticles = S.splashParticles.filter(p => p.life > 0);
      S.splashParticles.forEach(p => {
        p.x  += p.vx * 0.86;
        p.vy += 0.22;
        p.y  += p.vy * 0.86;
        p.life -= p.decay;
        const col = `rgba(120,220,255,${p.al * p.life})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = col; ctx.fill();
        // droplet highlight
        ctx.fillStyle = `rgba(255,255,255,${p.al*p.life*0.4})`;
        ctx.beginPath(); ctx.arc(p.x-p.r*0.3, p.y-p.r*0.3, p.r*0.4, 0, Math.PI*2); ctx.fill();
      });

      /* ── Ripples ── */
      S.ripples = S.ripples.filter(r => r.life > 0);
      S.ripples.forEach(r => {
        r.r   += (r.maxR - r.r) * 0.04;
        r.life -= 0.013;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(140,230,255,${r.life * 0.55})`;
        ctx.lineWidth = 2.5; ctx.stroke();
      });

      animId = requestAnimationFrame(frame);
    };

    frame();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [onDiveStart]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 5,
      }}
    />
  );
}

/* ── Stars ── */
function Stars() {
  const stars = Array.from({ length: 180 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 75,
    size: Math.random() * 2.2 + 0.8,
    delay: Math.random() * 5,
    dur: Math.random() * 4 + 1.5,
    opacity: Math.random() * 0.75 + 0.2,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: s.left + '%', top: s.top + '%',
          width: s.size + 'px', height: s.size + 'px',
          borderRadius: '50%', background: 'white',
          animation: `winkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          opacity: s.opacity,
        }} />
      ))}
      <style>{`
        @keyframes winkle {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.05; transform: scale(0.4); }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN WelcomeScreen
════════════════════════════════════════════ */
export default function WelcomeScreen({ onEnter }) {
  const [diveTriggered, setDiveTriggered] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleDiveStart = () => {
    setExiting(true);
    setTimeout(() => onEnter(), 1500);
  };

  const handleClick = () => {
    if (diveTriggered) return;
    setDiveTriggered(true);
  };

  useEffect(() => {
    const onKey   = (e) => { if (!diveTriggered && ['Enter',' ','ArrowDown'].includes(e.key)) handleClick(); };
    const onWheel = ()  => { if (!diveTriggered) handleClick(); };
    const onTouch = ()  => { if (!diveTriggered) handleClick(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { once: true, passive: true });
    window.addEventListener('touchstart', onTouch, { once: true, passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouch);
    };
  }, [diveTriggered]);

  return (
    <div
      className={`welcome-screen${exiting ? ' exit' : ''}`}
      style={{ background: 'radial-gradient(ellipse at 50% 35%, #001e48 0%, #00082a 55%, #000510 100%)' }}
    >
      <Stars />
      <BoatCanvas onDiveStart={handleDiveStart} diveTriggered={diveTriggered} />

      <div className="welcome-content" style={{ zIndex: 15 }}>
        <p className="welcome-greeting">Welcome to the deep</p>
        <h1 className="welcome-name">Giripriyan S</h1>
        <p className="welcome-title">AI &amp; Machine Learning Developer</p>
        <p className="welcome-tag">
          Coimbatore, India &nbsp;·&nbsp; B.Tech AIML &nbsp;·&nbsp; Intel® Unnati 2025
        </p>
        <div className="welcome-btn-wrap">
          <button
            className="dive-btn"
            id="dive-btn"
            onClick={handleClick}
            disabled={diveTriggered}
            style={diveTriggered ? { opacity: 0.55, pointerEvents: 'none' } : {}}
          >
            {diveTriggered ? '⬇ DIVING…' : '⬇ DIVE IN ⬇'}
          </button>
          <span className="dive-hint">
            {diveTriggered ? 'Watch the diver leap!' : 'scroll · click · or press Enter to dive'}
          </span>
        </div>
      </div>
    </div>
  );
}
