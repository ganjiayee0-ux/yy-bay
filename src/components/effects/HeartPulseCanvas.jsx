import { useEffect, useRef } from 'react';
import {
  createDenseHeartFill,
  createFloorParticles,
  easeOutCubic,
  getHeartAnchor,
  randomRange,
} from '../../utils/heartShape';
import { getCanvasDpr } from '../../utils/performance';
import styles from './HeartPulseCanvas.module.css';

const GATHER_END = 3.5;
const FLASH_END = 4.1;

function drawGlowDot(ctx, x, y, size, r, g, b, alpha, blur = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (blur > 0) {
    ctx.shadowBlur = blur;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
  }
  const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.8);
  grad.addColorStop(0, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}, 1)`);
  grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.85)`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function createMainParticles(width, height) {
  const baseScale = width < 480 ? 5.2 : width < 768 ? 6.5 : 8;
  const anchor = getHeartAnchor(width, height, baseScale);
  const count = width < 768 ? 520 : 1200;
  const targets = createDenseHeartFill(anchor.x, anchor.y, baseScale, count);

  return targets.map((target, index) => {
    const angle = randomRange(0, Math.PI * 2);
    const radius = randomRange(Math.max(width, height) * 0.4, Math.max(width, height) * 0.9);
    const startX = anchor.x + Math.cos(angle) * radius;
    const startY = anchor.y + Math.sin(angle) * radius;

    return {
      anchorX: anchor.x,
      anchorY: anchor.y,
      startX,
      startY,
      tx: target.x,
      ty: target.y,
      x: startX,
      y: startY,
      size: randomRange(1.2, 2.6),
      delay: (index % 60) * 0.006 + randomRange(0, 0.35),
      duration: randomRange(2.2, 3.2),
      twinkle: randomRange(0, Math.PI * 2),
      jitter: randomRange(0.2, 0.8),
    };
  });
}

export default function HeartPulseCanvas() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let mainParticles = [];
    let floorParticles = [];
    let centerX = 0;
    let centerY = 0;

    let liteDraw = false;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = getCanvasDpr(width);
      liteDraw = width < 768;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerX = width / 2;
      centerY = getHeartAnchor(width, height, width < 480 ? 5.2 : width < 768 ? 6.5 : 8).y;
      mainParticles = createMainParticles(width, height);
      floorParticles = createFloorParticles(width, height, width < 768 ? 200 : 480);
      startRef.current = null;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = (timestamp - startRef.current) / 1000;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const flashPhase =
        elapsed < GATHER_END ? 0 : Math.min((elapsed - GATHER_END) / (FLASH_END - GATHER_END), 1);
      const beatTime = Math.max(0, elapsed - FLASH_END);
      const isBeating = elapsed >= FLASH_END;
      const beatWave = isBeating ? Math.pow(Math.sin(beatTime * 2.6), 2) : 0;
      const beatScale = isBeating ? 1 + 0.1 * beatWave : 1;

      if (flashPhase > 0 && flashPhase < 1) {
        const flashAlpha = Math.sin(flashPhase * Math.PI) * 0.65;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
      }

      const floorCount = isBeating
        ? floorParticles.length
        : Math.floor(floorParticles.length * (0.15 + flashPhase * 0.5));
      const ambientFloorPulse = 0.5 + 0.5 * Math.sin(elapsed * 0.7);

      for (let i = 0; i < floorCount; i += 1) {
        const p = floorParticles[i];
        const ownPulse = 0.55 + 0.45 * Math.sin(elapsed * p.pulseSpeed + p.pulsePhase);
        const floatY =
          p.baseY +
          Math.sin(elapsed * p.bounceSpeed + p.phase) * p.bounceAmp +
          Math.cos(elapsed * p.speed * 0.7 + p.phase) * 4;
        const floatX =
          p.x +
          Math.sin(elapsed * p.wanderSpeed + p.phase) * 18 * p.drift +
          Math.cos(elapsed * p.speed + p.phase * 1.3) * 8 * p.drift;

        let r = 255;
        let g = 50;
        let b = 70;
        if (p.kind === 'pink') {
          r = 255;
          g = 140;
          b = 170;
        } else if (p.kind === 'white') {
          r = 255;
          g = 220;
          b = 230;
        }

        const colorMix = isBeating ? 1 : flashPhase;
        if (!isBeating && colorMix < 1) {
          g = Math.round(g + (220 - g) * (1 - colorMix));
          b = Math.round(b + (80 - b) * (1 - colorMix));
        }

        const twinkle = 0.45 + 0.55 * Math.sin(elapsed * 2.4 + p.phase * 1.7);
        const baseIntensity = isBeating ? 0.5 + ambientFloorPulse * 0.25 : 0.08 + flashPhase * 0.2;
        const alpha = p.opacity * baseIntensity * twinkle * ownPulse;
        const size = p.size * (0.85 + ownPulse * 0.35);
        const blur = liteDraw ? 0 : 3 + ownPulse * 5;
        drawGlowDot(ctx, floatX, floatY, size, r, g, b, alpha, blur);
      }

      if (isBeating) {
        const glowR = (width < 480 ? 140 : 190) * beatScale;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowR);
        gradient.addColorStop(0, `rgba(255, 40, 70, ${0.45 + beatWave * 0.25})`);
        gradient.addColorStop(0.35, `rgba(255, 20, 50, ${0.2 + beatWave * 0.15})`);
        gradient.addColorStop(0.7, 'rgba(180, 0, 40, 0.06)');
        gradient.addColorStop(1, 'rgba(255, 0, 40, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowR, 0, Math.PI * 2);
        ctx.fill();

        const floorGlow = ctx.createLinearGradient(0, height * 0.55, 0, height);
        const floorGlowPulse = 0.08 + ambientFloorPulse * 0.06;
        floorGlow.addColorStop(0, 'rgba(255, 30, 60, 0)');
        floorGlow.addColorStop(0.4, `rgba(255, 40, 70, ${floorGlowPulse})`);
        floorGlow.addColorStop(1, `rgba(255, 60, 90, ${floorGlowPulse * 1.6})`);
        ctx.fillStyle = floorGlow;
        ctx.fillRect(0, height * 0.55, width, height * 0.45);
      }

      mainParticles.forEach((particle) => {
        const local = Math.max(0, elapsed - particle.delay);
        const gather = easeOutCubic(Math.min(local / particle.duration, 1));

        const dx = particle.tx - particle.anchorX;
        const dy = particle.ty - particle.anchorY;
        const scaledTx = particle.anchorX + dx * beatScale;
        const scaledTy = particle.anchorY + dy * beatScale;
        const jitterX = isBeating ? Math.sin(elapsed * 4 + particle.twinkle) * particle.jitter : 0;
        const jitterY = isBeating ? Math.cos(elapsed * 3.5 + particle.twinkle) * particle.jitter : 0;

        particle.x = particle.startX + (scaledTx - particle.startX) * gather + jitterX;
        particle.y = particle.startY + (scaledTy - particle.startY) * gather + jitterY;

        const colorMix = isBeating ? 1 : flashPhase * flashPhase;
        const r = Math.round(255);
        const g = Math.round(220 + (35 - 220) * colorMix);
        const b = Math.round(80 + (65 - 80) * colorMix);

        const twinkle = 0.7 + 0.3 * Math.sin(elapsed * 3.5 + particle.twinkle);
        const alpha = Math.min(1, gather * 1.15) * twinkle;
        const size = particle.size * (isBeating ? 1.1 + beatWave * 0.35 : 1);
        const blur = liteDraw ? 0 : isBeating ? 8 + beatWave * 6 : 3 + gather * 3;

        drawGlowDot(ctx, particle.x, particle.y, size, r, g, b, alpha, blur);
      });

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.vignette} aria-hidden />
    </div>
  );
}
