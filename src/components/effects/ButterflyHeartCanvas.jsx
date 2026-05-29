import { useEffect, useRef } from 'react';
import { getButterflyPerfProfile } from '../../utils/performance';
import styles from './ButterflyHeartCanvas.module.css';

const HEART_POINTS = 720;
const COLORS = ['#4fc3ff', '#38bdf8', '#a5f3ff'];
const INTRO_EMPTY_SEC = 0.85;
const SPRAY_ONLY_SEC = 4.8;
const GATHER_DURATION_SEC = 3.4;

function heartPoint(t, scale, cx, cy, pulse = 1) {
  const s = scale * pulse;
  const x = cx + 16 * Math.pow(Math.sin(t), 3) * s;
  const y =
    cy -
    (13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)) *
      s;
  return { x, y };
}

function sampleHeartParams(count = HEART_POINTS) {
  return Array.from({ length: count }, (_, i) => ((Math.PI * 2) / count) * i);
}

function buildHeartDust(count) {
  return Array.from({ length: count }, () => ({
    t: Math.random() * Math.PI * 2,
    rho: Math.pow(Math.random(), 0.42),
    startAngle: Math.random() * Math.PI * 2,
    startRadius: 220 + Math.random() * 260,
    startYOffset: 120 + Math.random() * 180,
    delay: Math.random() * 0.42,
    twinkle: Math.random() * Math.PI * 2,
    size: 0.9 + Math.random() * 1.9,
    colorIndex: Math.floor(Math.random() * COLORS.length),
  }));
}

function randomScreenPoint(width, height, margin = 0) {
  return {
    x: margin + Math.random() * (width - margin * 2),
    y: margin + Math.random() * (height - margin * 2),
  };
}

function makeFloorButterfly(width, height) {
  const target = randomScreenPoint(width, height, 8);
  return {
    x: Math.random() * width,
    y: height + Math.random() * 100,
    vx: Math.random() * 0.7 - 0.35,
    vy: -(0.8 + Math.random() * 1.6),
    sprayTargetX: target.x,
    sprayTargetY: target.y,
    flapPhase: Math.random() * Math.PI * 2,
    flapSpeed: 3 + Math.random() * 4,
    size: 1 + Math.random() * 2.2,
    alpha: 0.22 + Math.random() * 0.5,
    twinkle: Math.random() * Math.PI * 2,
    colorIndex: Math.floor(Math.random() * COLORS.length),
  };
}

function makeParticle(width, height, heartTs) {
  const spawnEdge = Math.random();
  let x;
  let y;
  if (spawnEdge < 0.12) {
    x = -30 - Math.random() * 40;
    y = Math.random() * height;
  } else if (spawnEdge < 0.24) {
    x = width + 30 + Math.random() * 40;
    y = Math.random() * height;
  } else if (spawnEdge < 0.36) {
    x = Math.random() * width;
    y = -30 - Math.random() * 40;
  } else {
    x = Math.random() * width;
    y = height + Math.random() * 80;
  }
  const target = randomScreenPoint(width, height, 12);
  return {
    x,
    y,
    vx: Math.random() * 0.8 - 0.4,
    vy: -(0.6 + Math.random() * 1.8),
    ax: 0,
    ay: 0,
    tIndex: Math.floor(Math.random() * heartTs.length),
    sprayTargetX: target.x,
    sprayTargetY: target.y,
    gatherReady: false,
    size: 1.8 + Math.random() * 2.6,
    colorIndex: Math.floor(Math.random() * COLORS.length),
    flapPhase: Math.random() * Math.PI * 2,
    flapSpeed: 5 + Math.random() * 6,
    alpha: 0.35 + Math.random() * 0.65,
    life: 0,
    maxLife: 280 + Math.random() * 240,
  };
}

function resetParticle(p, width, height, heartTs) {
  const n = makeParticle(width, height, heartTs);
  Object.assign(p, n);
}

function retargetSpray(p, width, height) {
  const target = randomScreenPoint(width, height, 10);
  p.sprayTargetX = target.x;
  p.sprayTargetY = target.y;
}

function flowField(x, y, time) {
  const nx = x * 0.0052;
  const ny = y * 0.0047;
  const a1 = Math.sin(nx * 1.9 + time * 0.75) + Math.cos(ny * 2.1 - time * 0.5);
  const a2 = Math.sin((nx + ny) * 1.5 - time * 0.35);
  const angle = a1 * 1.2 + a2 * 0.9;
  const mag = 0.018 + 0.012 * (0.5 + 0.5 * Math.sin(time + nx));
  return {
    x: Math.cos(angle) * mag,
    y: Math.sin(angle) * mag * 0.35,
  };
}

function drawButterfly(ctx, x, y, size, rot, alpha, color, flap, lite) {
  const open = 0.45 + 0.55 * Math.abs(Math.sin(flap));
  const wingW = size * (1.1 + open * 0.5);
  const wingH = size * 0.72;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  if (!lite) {
    ctx.shadowBlur = 7 + size * 1.4;
    ctx.shadowColor = color;
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-size * 0.72 * open, 0, wingW, wingH, -0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(size * 0.72 * open, 0, wingW, wingH, 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(220,245,255,0.95)';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.17, size * 0.66, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function ButterflyHeartCanvas() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const particlesRef = useRef([]);
  const startRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    let perf = getButterflyPerfProfile(
      canvas.clientWidth || window.innerWidth,
      canvas.clientHeight || window.innerHeight,
    );
    let maxParticles = perf.maxParticles;
    let emitPerFrame = perf.emitPerFrame;
    let lite = perf.lite;
    let frameIntervalMs = perf.frameIntervalMs;
    const heartTs = sampleHeartParams();
    let heartDust = buildHeartDust(perf.heartDustCount);
    let floorSwarm = [];
    let width = 0;
    let height = 0;
    let scale = 0;
    let rot = 0;
    let lastTs = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      scale = width < 480 ? 7.5 : width < 768 ? 8.5 : 10.5;
      perf = getButterflyPerfProfile(width, height);
      maxParticles = perf.maxParticles;
      emitPerFrame = perf.emitPerFrame;
      lite = perf.lite;
      frameIntervalMs = perf.frameIntervalMs;
      heartDust = buildHeartDust(perf.heartDustCount);
      const dpr = perf.dpr;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = [];
      startRef.current = null;
      floorSwarm = Array.from({ length: perf.floorSwarm }, () =>
        makeFloorButterfly(width, height),
      );
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (timeMs) => {
      if (frameIntervalMs > 0 && timeMs - lastTs < frameIntervalMs) {
        frameRef.current = requestAnimationFrame(render);
        return;
      }
      lastTs = timeMs;

      if (!startRef.current) startRef.current = timeMs;
      const elapsed = (timeMs - startRef.current) * 0.001;
      if (elapsed < INTRO_EMPTY_SEC) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, width, height);
        frameRef.current = requestAnimationFrame(render);
        return;
      }

      const activeTime = elapsed - INTRO_EMPTY_SEC;
      const gatherRaw = Math.max(0, activeTime - SPRAY_ONLY_SEC);
      const gatherPhase = Math.min(1, gatherRaw / GATHER_DURATION_SEC);
      const gatherStart = 0;
      const gatherLocal = gatherPhase;
      const rotationFactor = gatherPhase <= 0 ? 0 : Math.max(0, 1 - gatherPhase * 1.35);
      rot += 0.00072 * rotationFactor;
      const pulse = 1 + 0.065 * Math.sin(activeTime * 1.7);
      const cx = width / 2;
      const cy = height * 0.5;

      const particles = particlesRef.current;
      for (let i = 0; i < emitPerFrame && particles.length < maxParticles; i += 1) {
        particles.push(makeParticle(width, height, heartTs));
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(0, 0, width, height);

      if (!lite) {
        const bloomR = Math.max(width, height) * 0.85 * pulse;
        const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        bloom.addColorStop(0, 'rgba(70, 180, 255, 0.1)');
        bloom.addColorStop(0.45, 'rgba(40, 110, 220, 0.05)');
        bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalCompositeOperation = lite ? 'source-over' : 'lighter';

      for (let i = 0; i < floorSwarm.length; i += 1) {
        const f = floorSwarm[i];
        const dx = f.sprayTargetX - f.x;
        const dy = f.sprayTargetY - f.y;
        const dist = Math.hypot(dx, dy) || 1;

        // Bottom spray: upward force + mild turbulence + target pull.
        f.vx += (Math.random() * 0.16 - 0.08) + (dx / dist) * 0.02;
        f.vy += -0.035 + (dy / dist) * 0.012;
        f.vx *= 0.965;
        f.vy *= 0.968;
        f.x += f.vx;
        f.y += f.vy;

        if (dist < 26) {
          const next = randomScreenPoint(width, height, 8);
          f.sprayTargetX = next.x;
          f.sprayTargetY = next.y;
        }

        if (f.y < -60 || f.x < -100 || f.x > width + 100 || f.y > height + 80) {
          const n = makeFloorButterfly(width, height);
          Object.assign(f, n);
        }

        const alpha = f.alpha * (0.6 + 0.4 * Math.sin(activeTime * 2 + f.twinkle));
        drawButterfly(
          ctx,
          f.x,
          f.y,
          f.size,
          Math.sin(activeTime + f.twinkle) * 0.1,
          alpha,
          COLORS[f.colorIndex],
          activeTime * f.flapSpeed + f.flapPhase,
          lite,
        );
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        const shouldGather = gatherPhase > 0;
        p.life += 1;
        p.ax = 0;
        p.ay = 0;

        if (!lite || i % 2 === 0) {
          const ff = flowField(p.x, p.y, activeTime);
          p.ax += ff.x;
          p.ay += ff.y;
        }

        const upwardBand = Math.max(0, 1 - Math.min(1, (height - p.y) / height));
        p.ay += (-0.028 - upwardBand * 0.04) * (1 - gatherLocal * 0.92);

        let dx = 0;
        let dy = 0;
        let dist = 1;
        if (!shouldGather && (p.life < 3 || Math.random() < 0.02)) {
          retargetSpray(p, width, height);
        }

        if (shouldGather && !p.gatherReady) {
          p.gatherReady = true;
          p.tIndex = Math.floor(Math.random() * heartTs.length);
        }

        if (shouldGather) {
          const t = heartTs[p.tIndex];
          const target = heartPoint(t, scale, cx, cy, pulse);
          dx = target.x - p.x;
          dy = target.y - p.y;
          dist = Math.hypot(dx, dy) || 1;
          const attract = Math.min(0.55, 24 / dist) * (0.22 + gatherLocal * 0.48);
          p.ax += (dx / dist) * attract;
          p.ay += (dy / dist) * attract;
        } else {
          dx = p.sprayTargetX - p.x;
          dy = p.sprayTargetY - p.y;
          dist = Math.hypot(dx, dy) || 1;
          const sprayAttract = Math.min(0.09, 9 / dist) * 0.08;
          p.ax += (dx / dist) * sprayAttract;
          p.ay += (dy / dist) * sprayAttract;

          if (dist < 24) {
            retargetSpray(p, width, height);
          }
        }

        p.vx += p.ax;
        p.vy += p.ay;
        const damping = gatherPhase > 0.55 ? (lite ? 0.89 : 0.87) : lite ? 0.994 : 0.988;
        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;

        if (rotationFactor > 0.02) {
          const rx = p.x - cx;
          const ry = p.y - cy;
          const rX = rx * Math.cos(rot) - ry * Math.sin(rot) + cx;
          const rY = rx * Math.sin(rot) + ry * Math.cos(rot) + cy;
          p.x = rX;
          p.y = rY;
        }

        const flap = (lite ? activeTime * 4.5 : activeTime * p.flapSpeed) + p.flapPhase;
        const facing = Math.atan2(p.vy, p.vx) + Math.PI / 2;
        drawButterfly(
          ctx,
          p.x,
          p.y,
          p.size,
          facing,
          p.alpha,
          COLORS[p.colorIndex],
          flap,
          lite,
        );

        if (
          (!shouldGather &&
            (p.y < -140 ||
              p.y > height + 140 ||
              p.x < -140 ||
              p.x > width + 140)) ||
          (gatherPhase < 0.8 && p.life > p.maxLife)
        ) {
          resetParticle(p, width, height, heartTs);
        }
      }

      if (gatherPhase > 0.08) {
        const fillProgress = gatherLocal;
        const dustStep = lite ? 2 : 1;
        for (let i = 0; i < heartDust.length; i += dustStep) {
          const d = heartDust[i];
          const local = Math.min(1, Math.max(0, (fillProgress - d.delay) / (1 - d.delay)));
          const base = heartPoint(d.t, scale, cx, cy, pulse);
          const targetX = cx + (base.x - cx) * d.rho;
          const targetY = cy + (base.y - cy) * d.rho;
          const startX = cx + Math.cos(d.startAngle) * d.startRadius;
          const startY = height + d.startYOffset;
          const ease = local * local * (3 - 2 * local);
          const x = startX + (targetX - startX) * ease;
          const y = startY + (targetY - startY) * ease;
          const twinkle = 0.65 + 0.35 * Math.sin(activeTime * 2.3 + d.twinkle);
          const alphaBoost = gatherPhase > 0.8 ? 1.45 : 1.15;
          const alpha = ease * twinkle * (lite ? 0.55 : 0.78) * alphaBoost;
          drawButterfly(
            ctx,
            x,
            y,
            d.size,
            0,
            alpha,
            COLORS[d.colorIndex],
            activeTime * 4 + d.twinkle,
            lite,
          );
        }
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className={styles.wrapper} aria-hidden>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
