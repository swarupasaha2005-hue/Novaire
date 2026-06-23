"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ── Particle canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const NUM = 55;
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; da: number };
    const particles: P[] = Array.from({ length: NUM }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.6,
      da: (Math.random() - 0.5) * 0.003,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < NUM; i++) {
        for (let j = i + 1; j < NUM; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(180,180,180,${(1 - dist / 120) * 0.06})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.da;
        if (p.a < 0.05) p.da = Math.abs(p.da);
        if (p.a > 0.7) p.da = -Math.abs(p.da);
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,210,210,${p.a})`;
        ctx.fill();
      }
      animFrame = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── Config ───────────────────────────────────────────────────────────────────
const CX = 300, CY = 300;
const RX = 260, RY = 240;

const LABEL_CFG = [
  { angle: -100, radius: 0.82, lines: ["01", "GOAL"],                           delay: 0   },
  { angle: -28,  radius: 0.88, lines: ["02", "INTENT ENGINE"],                  delay: 0.4 },
  { angle:  35,  radius: 0.85, lines: ["03", "STRATEGY ENGINE"],                delay: 0.8 },
  { angle:  100, radius: 0.80, lines: ["04", "YIELD LAYER"],                    delay: 1.2 },
  { angle:  158, radius: 0.87, lines: ["05", "SMART ACCOUNT", "AUTOPILOT"],     delay: 1.6 },
  { angle:  220, radius: 0.82, lines: ["06", "GOAL ACHIEVED"],                  delay: 2.0 },
];

const ORBITERS = [
  { duration: 14, orx: RX * 0.82, ory: RY * 0.82, startDeg: 0,   size: 3.5, alpha: 0.9 },
  { duration: 22, orx: RX * 0.82, ory: RY * 0.82, startDeg: 180, size: 2.5, alpha: 0.6 },
  { duration: 18, orx: RX * 0.5,  ory: RY * 0.5,  startDeg: 90,  size: 2,   alpha: 0.7 },
  { duration: 28, orx: RX * 0.5,  ory: RY * 0.5,  startDeg: 270, size: 1.5, alpha: 0.4 },
];

// Round to 2 dp to keep SSR/CSR output identical
function r2(n: number) { return Math.round(n * 100) / 100; }

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: r2(CX + RX * radius * Math.cos(rad)), y: r2(CY + RY * radius * Math.sin(rad)) };
}

// ── Main component ────────────────────────────────────────────────────────────
export function HeroFlow() {
  // Defer computed SVG nodes to client to avoid SSR/CSR floating-point mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none overflow-hidden min-h-[280px]">
      <ParticleCanvas />

      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
            <stop offset="40%"  stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <linearGradient id="tg1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
            <stop offset="40%"  stopColor="rgba(200,200,200,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="tg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
            <stop offset="50%"  stopColor="rgba(160,160,160,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Static orbital rings ── */}
        <ellipse cx={CX} cy={CY} rx={r2(RX*0.92)} ry={r2(RY*0.92)} stroke="rgba(255,255,255,0.035)" strokeWidth="1"/>
        <ellipse cx={CX} cy={CY} rx={r2(RX*0.82)} ry={r2(RY*0.82)} stroke="rgba(255,255,255,0.06)"  strokeWidth="0.8"/>
        <ellipse cx={CX} cy={CY} rx={r2(RX*0.5)}  ry={r2(RY*0.5)}  stroke="rgba(255,255,255,0.05)"  strokeWidth="0.8"/>
        <ellipse cx={CX} cy={CY} rx={r2(RX*0.28)} ry={r2(RY*0.28)} stroke="rgba(255,255,255,0.04)"  strokeWidth="0.6"/>

        {/* ── Static trajectory paths ── */}
        <path d={`M ${CX} ${r2(CY-RY*0.82)} Q ${CX+80} ${r2(CY-RY*0.4)}, ${CX} ${CY}`}
          stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" fill="none"/>
        <path d={`M ${r2(CX+RX*0.6)} ${r2(CY+RY*0.6)} Q ${CX+30} ${CY+40}, ${CX} ${CY}`}
          stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" fill="none"/>
        <path d={`M ${r2(CX-RX*0.7)} ${r2(CY-RY*0.3)} Q ${CX-60} ${CY+20}, ${CX} ${CY}`}
          stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" fill="none"/>

        {/* ── Animated trajectory pulses ── */}
        <motion.path
          d={`M ${CX} ${r2(CY-RY*0.82)} C ${r2(CX+RX*0.5)} ${r2(CY-RY*0.82)}, ${r2(CX+RX*0.82)} ${r2(CY-RY*0.3)}, ${r2(CX+RX*0.82)} ${CY}`}
          stroke="url(#tg1)" strokeWidth="1.5" fill="none" filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0,1,1], opacity: [0,0.9,0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        />
        <motion.path
          d={`M ${r2(CX-RX*0.82)} ${CY} C ${r2(CX-RX*0.82)} ${r2(CY+RY*0.4)}, ${r2(CX-RX*0.4)} ${r2(CY+RY*0.82)}, ${CX} ${r2(CY+RY*0.82)}`}
          stroke="url(#tg2)" strokeWidth="1.2" fill="none" filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0,1,1], opacity: [0,0.7,0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2.5, repeatDelay: 1.5 }}
        />
        <motion.path
          d={`M ${r2(CX+RX*0.82)} ${CY} Q ${CX+40} ${CY-60} ${CX} ${CY}`}
          stroke="rgba(220,220,220,0.6)" strokeWidth="1" fill="none" filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0,1,1], opacity: [0,0.5,0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2, repeatDelay: 3 }}
        />

        {/* ── Central nucleus ── */}
        <circle cx={CX} cy={CY} r={90} fill="url(#coreGlow)"/>
        <circle cx={CX} cy={CY} r={28} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" filter="url(#softGlow)"/>
        <circle cx={CX} cy={CY} r={18} fill="rgba(255,255,255,0.1)"  stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
        <circle cx={CX} cy={CY} r={10} fill="rgba(255,255,255,0.18)"/>
        <motion.circle cx={CX} cy={CY} r={32} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"
          animate={{ r:[32,55,32], opacity:[0.12,0,0.12] }}
          transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}/>
        <motion.circle cx={CX} cy={CY} r={40} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"
          animate={{ r:[40,70,40], opacity:[0.06,0,0.06] }}
          transition={{ duration:4, repeat:Infinity, ease:"easeInOut", delay:1 }}/>

        {/* ── Orbital nodes (client-only to avoid hydration mismatch) ── */}
        {mounted && LABEL_CFG.map((cfg, i) => {
          const pos = polar(cfg.angle, cfg.radius);
          const textX = r2(pos.x + (pos.x > CX ? 14 : -14));
          const anchor = pos.x > CX ? "start" : "end";
          const cx1 = r2(CX + (pos.x - CX) * 0.82);
          const cy1 = r2(CY + (pos.y - CY) * 0.82);
          return (
            <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: cfg.delay + 0.8 }}>
              <line x1={cx1} y1={cy1} x2={pos.x} y2={pos.y}
                stroke="rgba(255,255,255,0.08)" strokeWidth="0.6"/>
              <circle cx={pos.x} cy={pos.y} r={4}
                fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
              <motion.circle cx={pos.x} cy={pos.y} r={4}
                fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6"
                animate={{ r:[4,10,4], opacity:[0.2,0,0.2] }}
                transition={{ duration: 3 + i * 0.4, repeat:Infinity, ease:"easeInOut", delay: i * 0.5 }}/>
              {cfg.lines.map((line, li) => (
                <text key={li}
                  x={textX}
                  y={r2(pos.y + li * 11 - (cfg.lines.length - 1) * 5.5)}
                  textAnchor={anchor}
                  fill="rgba(180,180,180,0.65)"
                  fontSize="8"
                  fontFamily="Inter, sans-serif"
                  letterSpacing="0.08em"
                  fontWeight="500">
                  {line}
                </text>
              ))}
            </motion.g>
          );
        })}

        {/* ── Orbiting capital nodes (client-only) ── */}
        {mounted && ORBITERS.map((orb, i) => (
          <motion.circle key={i} r={orb.size}
            fill={`rgba(255,255,255,${orb.alpha})`}
            filter="url(#glow)"
            animate={{
              x: Array.from({ length: 61 }, (_, k) => {
                const a = (k / 60) * 2 * Math.PI + (orb.startDeg * Math.PI) / 180;
                return r2(CX + orb.orx * Math.cos(a));
              }),
              y: Array.from({ length: 61 }, (_, k) => {
                const a = (k / 60) * 2 * Math.PI + (orb.startDeg * Math.PI) / 180;
                return r2(CY + orb.ory * Math.sin(a));
              }),
            }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>
    </div>
  );
}
