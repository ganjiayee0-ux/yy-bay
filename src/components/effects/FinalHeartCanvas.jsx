import { useEffect, useRef } from 'react';
import { createDenseHeartFill, easeOutCubic, getHeartAnchor, randomRange } from '../../utils/heartShape';
import { getCanvasDpr } from '../../utils/performance';
import styles from './FinalHeartCanvas.module.css';

function drawParticle(ctx, x, y, size, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
  gradient.addColorStop(0, `rgba(255, 235, 245, ${alpha})`);
  gradient.addColorStop(0.45, `rgba(255, 150, 185, ${alpha * 0.9})`);
  gradient.addColorStop(1, 'rgba(255, 120, 165, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function createParticles(width, height) {
  const scale = width < 480 ? 4.8 : width < 768 ? 5.8 : 7;
  const anchor = getHeartAnchor(width, height, scale);
  const count = width < 768 ? 520 : 920;
  const targets = createDenseHeartFill(anchor.x, anchor.y, scale, count);
  const maxRadius = Math.max(width, height) * 0.9;
  const minRadius = Math.max(width, height) * 0.35;

  const particles = targets.map((target, index) => {
    const angle = randomRange(0, Math.PI * 2);
    const radius = randomRange(minRadius, maxRadius);
    const startX = anchor.x + Math.cos(angle) * radius;
    const startY = anchor.y + Math.sin(angle) * radius * 0.7;

    return {
      startX,
      startY,
      x: startX,
      y: startY,
      tx: target.x,
      ty: target.y,
      size: randomRange(1.2, 2.8),
      delay: (index % 70) * 0.008 + randomRange(0, 0.5),
      duration: randomRange(3.4, 5.4),
      twinkle: randomRange(0, Math.PI * 2),
    };
  });

  return { particles, anchor };
}

export default function FinalHeartCanvas() {
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

      ctx.clearRect(0, 0, width, height);

      const bgGradient = ctx.createRadialGradient(anchor.x, anchor.y, 0, anchor.x, anchor.y, width * 0.6);
      bgGradient.addColorStop(0, 'rgba(255, 145, 190, 0.2)');
      bgGradient.addColorStop(0.45, 'rgba(190, 150, 255, 0.12)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        const local = Math.max(0, elapsed - particle.delay);
        const gather = easeOutCubic(Math.min(local / particle.duration, 1));
        particle.x = particle.startX + (particle.tx - particle.startX) * gather;
        particle.y = particle.startY + (particle.ty - particle.startY) * gather;

        const twinkle = 0.72 + 0.28 * Math.sin(elapsed * 2.4 + particle.twinkle);
        const alpha = Math.min(1, gather * 1.2) * twinkle;
        drawParticle(ctx, particle.x, particle.y, particle.size, alpha);
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
