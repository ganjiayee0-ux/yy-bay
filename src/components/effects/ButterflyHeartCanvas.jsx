import { useEffect, useRef } from 'react';
import { createDenseHeartFill, easeOutCubic, getHeartAnchor, randomRange } from '../../utils/heartShape';
import { getCanvasDpr } from '../../utils/performance';
import styles from './ButterflyHeartCanvas.module.css';

const GATHER_DELAY = 0.45;

function drawButterfly(ctx, x, y, size, alpha, flap) {
  const wingOpen = 0.7 + flap * 0.35;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;

  const leftWing = ctx.createRadialGradient(-size * 0.6, 0, 0, -size * 0.6, 0, size * 1.2);
  leftWing.addColorStop(0, 'rgba(255, 245, 205, 0.95)');
  leftWing.addColorStop(0.5, 'rgba(255, 175, 120, 0.9)');
  leftWing.addColorStop(1, 'rgba(255, 120, 150, 0)');
  ctx.fillStyle = leftWing;
  ctx.beginPath();
  ctx.ellipse(-size * 0.55 * wingOpen, 0, size * 0.85, size * 0.55, -0.6, 0, Math.PI * 2);
  ctx.fill();

  const rightWing = ctx.createRadialGradient(size * 0.6, 0, 0, size * 0.6, 0, size * 1.2);
  rightWing.addColorStop(0, 'rgba(255, 245, 205, 0.95)');
  rightWing.addColorStop(0.5, 'rgba(255, 175, 120, 0.9)');
  rightWing.addColorStop(1, 'rgba(255, 120, 150, 0)');
  ctx.fillStyle = rightWing;
  ctx.beginPath();
  ctx.ellipse(size * 0.55 * wingOpen, 0, size * 0.85, size * 0.55, 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 250, 235, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.22, size * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function createParticles(width, height) {
  const scale = width < 480 ? 4.9 : width < 768 ? 5.8 : 7.2;
  const anchor = getHeartAnchor(width, height, scale);
  const count = width < 768 ? 280 : 460;
  const targets = createDenseHeartFill(anchor.x, anchor.y, scale, count);
  const minR = Math.max(width, height) * 0.32;
  const maxR = Math.max(width, height) * 0.88;

  return {
    anchor,
    particles: targets.map((target, index) => {
      const angle = randomRange(0, Math.PI * 2);
      const radius = randomRange(minR, maxR);
      const startX = anchor.x + Math.cos(angle) * radius;
      const startY = anchor.y + Math.sin(angle) * radius * 0.72;
      return {
        x: startX,
        y: startY,
        startX,
        startY,
        tx: target.x,
        ty: target.y,
        size: randomRange(4.5, 8.8),
        delay: (index % 55) * 0.018 + randomRange(0, 0.55),
        duration: randomRange(2.6, 4.2),
        twinkle: randomRange(0, Math.PI * 2),
        flutter: randomRange(0, Math.PI * 2),
      };
    }),
  };
}

export default function ButterflyHeartCanvas() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let particles = [];
    let anchor = { x: 0, y: 0 };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = getCanvasDpr(width);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const data = createParticles(width, height);
      particles = data.particles;
      anchor = data.anchor;
      startRef.current = null;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = (timestamp - startRef.current) / 1000;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const aura = ctx.createRadialGradient(anchor.x, anchor.y, 0, anchor.x, anchor.y, width * 0.65);
      aura.addColorStop(0, 'rgba(255, 165, 125, 0.18)');
      aura.addColorStop(0.35, 'rgba(255, 135, 160, 0.12)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        const local = Math.max(0, elapsed - GATHER_DELAY - p.delay);
        const gather = easeOutCubic(Math.min(local / p.duration, 1));
        p.x = p.startX + (p.tx - p.startX) * gather;
        p.y = p.startY + (p.ty - p.startY) * gather;
        const flap = Math.sin(elapsed * 9 + p.flutter);
        const alpha = Math.min(1, gather * 1.2) * (0.75 + 0.25 * Math.sin(elapsed * 2.6 + p.twinkle));
        drawButterfly(ctx, p.x, p.y, p.size, alpha, flap);
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
    <div className={styles.wrapper} aria-hidden>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
