import { useEffect, useRef } from 'react';
import { letterContent } from '../../config/content';
import { easeInOutCubic, easeOutCubic, randomRange, sampleTextPoints } from '../../utils/heartTextPoints';
import styles from './HeartGatherCanvas.module.css';

const FONT_FAMILY = '"Noto Serif SC", "Cormorant Garamond", serif';

function heartCoords(t, scale, centerX, centerY) {
  const x = centerX + scale * 16 * Math.pow(Math.sin(t), 3);
  const y =
    centerY -
    scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x, y, t };
}

function createHeartShapePoints(centerX, centerY, scale, count = 80) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    const t = (i / count) * Math.PI * 2;
    points.push(heartCoords(t, scale, centerX, centerY));
  }
  return points;
}

function createFilledHeartLayers(centerX, centerY, baseScale) {
  const layers = [
    { scale: baseScale, count: 90, size: [11, 16], layer: 0, speed: 0.14 },
    { scale: baseScale * 0.82, count: 70, size: [9, 13], layer: 1, speed: -0.2 },
    { scale: baseScale * 0.62, count: 50, size: [7, 11], layer: 2, speed: 0.26 },
    { scale: baseScale * 0.42, count: 35, size: [5, 9], layer: 3, speed: -0.32 },
  ];

  const particles = [];

  layers.forEach((config) => {
    const points = createHeartShapePoints(centerX, centerY, config.scale, config.count);
    points.forEach((point, index) => {
      const scatterAngle = randomRange(0, Math.PI * 2);
      const scatterR = randomRange(180, 420);
      particles.push({
        type: 'heartLayer',
        layer: config.layer,
        x: centerX + Math.cos(scatterAngle) * scatterR,
        y: centerY + Math.sin(scatterAngle) * scatterR * 0.5,
        startX: centerX + Math.cos(scatterAngle) * scatterR,
        startY: centerY + Math.sin(scatterAngle) * scatterR * 0.5,
        tx: point.x,
        ty: point.y,
        angle: point.t,
        centerX,
        centerY,
        baseScale: config.scale,
        size: randomRange(config.size[0], config.size[1]),
        delay: config.layer * 0.35 + index * 0.028 + randomRange(0, 0.5),
        duration: randomRange(3.5, 5.2),
        hue: randomRange(300, 355),
        twinkle: randomRange(0, Math.PI * 2),
        rotationSpeed: config.speed,
      });
    });
  });

  return particles;
}

function drawStarHeart(ctx, x, y, size, alpha, hue = 330, glow = 14) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.scale(size / 12, size / 12);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
  gradient.addColorStop(0, `hsla(${hue}, 95%, 92%, 1)`);
  gradient.addColorStop(0.4, `hsla(${hue}, 90%, 75%, 0.95)`);
  gradient.addColorStop(1, `hsla(${hue + 15}, 85%, 58%, 0.35)`);

  ctx.shadowBlur = glow;
  ctx.shadowColor = `hsla(${hue}, 100%, 78%, 0.9)`;
  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(0, 1, -6, 0, -6, 4);
  ctx.bezierCurveTo(-6, 8, 0, 12, 0, 16);
  ctx.bezierCurveTo(0, 12, 6, 8, 6, 4);
  ctx.bezierCurveTo(6, 0, 0, 1, 0, 4);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = `hsla(${hue}, 100%, 95%, ${alpha * 0.85})`;
  ctx.beginPath();
  ctx.arc(-2.5, -1, 1.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHeartNebula(ctx, centerX, centerY, scale, elapsed, rotation) {
  const pulse = 1 + 0.12 * Math.sin(elapsed * 1.1);
  const nebulaScale = scale * pulse;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * 0.3);

  const outer = ctx.createRadialGradient(0, 0, 0, 0, 0, nebulaScale * 22);
  outer.addColorStop(0, 'rgba(255, 160, 190, 0.22)');
  outer.addColorStop(0.35, 'rgba(200, 130, 255, 0.14)');
  outer.addColorStop(0.65, 'rgba(255, 120, 170, 0.06)');
  outer.addColorStop(1, 'rgba(255, 100, 150, 0)');
  ctx.fillStyle = outer;
  ctx.beginPath();
  ctx.arc(0, 0, nebulaScale * 22, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(0, -nebulaScale * 2, 0, 0, 0, nebulaScale * 10);
  core.addColorStop(0, 'rgba(255, 220, 235, 0.35)');
  core.addColorStop(0.5, 'rgba(255, 150, 190, 0.12)');
  core.addColorStop(1, 'rgba(255, 100, 160, 0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, -nebulaScale * 2, nebulaScale * 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawOrbitRing(ctx, centerX, centerY, rx, ry, rotation, alpha) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha * 0.35;
  ctx.strokeStyle = 'rgba(255, 180, 210, 0.5)';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 12;
  ctx.shadowColor = 'rgba(255, 150, 200, 0.6)';
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function createTextParticles(points, width, height) {
  return points.map((point, index) => {
    const angle = randomRange(0, Math.PI * 2);
    const radius = randomRange(Math.max(width, height) * 0.35, Math.max(width, height) * 0.65);
    const startX = width / 2 + Math.cos(angle) * radius;
    const startY = height * 0.34 + Math.sin(angle) * radius * 0.55;

    return {
      type: 'text',
      x: startX,
      y: startY,
      startX,
      startY,
      tx: point.x,
      ty: point.y,
      size: randomRange(3.5, 6),
      delay: (index % 40) * 0.012 + randomRange(0, 0.35),
      duration: randomRange(2.4, 3.8),
      hue: randomRange(310, 350),
      twinkle: randomRange(0, Math.PI * 2),
    };
  });
}

function createOrbitParticles(width, height) {
  const centerX = width / 2;
  const centerY = height * 0.72;
  const baseScale = width < 480 ? 3.4 : width < 768 ? 4.2 : 5.2;

  const particles = createFilledHeartLayers(centerX, centerY, baseScale);

  const rings = [
    { count: 28, rx: width * 0.16, ry: height * 0.048, size: [7, 10], speed: 0.22, delay: 1.0 },
    { count: 36, rx: width * 0.24, ry: height * 0.072, size: [8, 12], speed: -0.16, delay: 1.4 },
    { count: 44, rx: width * 0.32, ry: height * 0.095, size: [9, 14], speed: 0.12, delay: 1.8 },
    { count: 52, rx: width * 0.4, ry: height * 0.118, size: [10, 15], speed: -0.09, delay: 2.2 },
  ];

  rings.forEach((ring) => {
    for (let i = 0; i < ring.count; i += 1) {
      const angle = (i / ring.count) * Math.PI * 2;
      const tx = centerX + Math.cos(angle) * ring.rx;
      const ty = centerY + Math.sin(angle) * ring.ry;
      const scatterAngle = randomRange(0, Math.PI * 2);
      const scatterR = randomRange(120, 340);

      particles.push({
        type: 'orbit',
        x: centerX + Math.cos(scatterAngle) * scatterR,
        y: centerY + Math.sin(scatterAngle) * scatterR * 0.55,
        startX: centerX + Math.cos(scatterAngle) * scatterR,
        startY: centerY + Math.sin(scatterAngle) * scatterR * 0.55,
        tx,
        ty,
        angle,
        rx: ring.rx,
        ry: ring.ry,
        centerX,
        centerY,
        size: randomRange(ring.size[0], ring.size[1]),
        delay: ring.delay + i * 0.025 + randomRange(0, 0.3),
        duration: randomRange(3.2, 4.8),
        hue: randomRange(295, 350),
        twinkle: randomRange(0, Math.PI * 2),
        rotationSpeed: ring.speed,
      });
    }
  });

  return { particles, centerX, centerY, baseScale };
}

function createSparkles(width, height, count = 120) {
  return Array.from({ length: count }, () => ({
    type: 'sparkle',
    x: randomRange(0, width),
    y: randomRange(0, height),
    size: randomRange(0.5, 2.8),
    alpha: randomRange(0.12, 0.75),
    twinkle: randomRange(0, Math.PI * 2),
    speed: randomRange(0.3, 1.4),
  }));
}

function rotatePoint(x, y, cx, cy, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

export default function HeartGatherCanvas() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const animationStartedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let textParticles = [];
    let orbitParticles = [];
    let sparkles = [];
    let heartMeta = { centerX: 0, centerY: 0, baseScale: 4 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fontSize = width < 480 ? 48 : width < 768 ? 56 : 72;
      const textWidth = Math.min(width * 0.92, 760);
      const textHeight = Math.min(height * 0.3, 200);
      const points = sampleTextPoints(
        letterContent.heartReveal.lines,
        textWidth,
        textHeight,
        fontSize,
        FONT_FAMILY,
      );

      const offsetX = (width - textWidth) / 2;
      const offsetY = height * 0.2;
      const adjustedPoints = points.map((p) => ({
        x: p.x + offsetX,
        y: p.y + offsetY,
      }));

      textParticles = createTextParticles(adjustedPoints, width, height);
      const orbitData = createOrbitParticles(width, height);
      orbitParticles = orbitData.particles;
      heartMeta = {
        centerX: orbitData.centerX,
        centerY: orbitData.centerY,
        baseScale: orbitData.baseScale,
      };
      sparkles = createSparkles(width, height);
      if (!animationStartedRef.current) {
        startRef.current = null;
      }
    };

    resize();
    document.fonts?.ready?.then(resize).catch(() => {});
    window.addEventListener('resize', resize);

    const render = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      animationStartedRef.current = true;
      const elapsed = (timestamp - startRef.current) / 1000;

      ctx.clearRect(0, 0, width, height);

      sparkles.forEach((star) => {
        const alpha = star.alpha * (0.4 + 0.6 * Math.sin(elapsed * star.speed + star.twinkle));
        ctx.fillStyle = `rgba(255, 230, 245, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      const mainRotation = elapsed * 0.12;
      const nebulaAlpha = Math.min(1, Math.max(0, (elapsed - 2) / 2));

      if (nebulaAlpha > 0) {
        drawHeartNebula(
          ctx,
          heartMeta.centerX,
          heartMeta.centerY,
          heartMeta.baseScale,
          elapsed,
          mainRotation,
        );
      }

      const ringConfigs = [
        { rx: width * 0.16, ry: height * 0.048, speed: 0.22 },
        { rx: width * 0.24, ry: height * 0.072, speed: -0.16 },
        { rx: width * 0.32, ry: height * 0.095, speed: 0.12 },
        { rx: width * 0.4, ry: height * 0.118, speed: -0.09 },
      ];

      if (elapsed > 2.5) {
        ringConfigs.forEach((ring) => {
          drawOrbitRing(
            ctx,
            heartMeta.centerX,
            heartMeta.centerY,
            ring.rx,
            ring.ry,
            elapsed * ring.speed,
            Math.min(1, (elapsed - 2.5) / 2),
          );
        });
      }

      textParticles.forEach((particle) => {
        const local = Math.max(0, elapsed - particle.delay);
        const progress = easeOutCubic(Math.min(local / particle.duration, 1));
        particle.x = particle.startX + (particle.tx - particle.startX) * progress;
        particle.y = particle.startY + (particle.ty - particle.startY) * progress;

        const twinkle = 0.72 + 0.28 * Math.sin(elapsed * 2.2 + particle.twinkle);
        const alpha = Math.min(1, progress * 1.2) * twinkle;
        drawStarHeart(ctx, particle.x, particle.y, particle.size, alpha, particle.hue, 12);
      });

      orbitParticles.forEach((particle) => {
        const local = Math.max(0, elapsed - particle.delay);
        const gather = easeInOutCubic(Math.min(local / particle.duration, 1));
        const orbitTime = Math.max(0, local - particle.duration * 0.65);
        const breathe = 1 + 0.06 * Math.sin(elapsed * 1.3 + particle.layer * 0.5);

        if (particle.type === 'heartLayer') {
          const rotation =
            orbitTime * particle.rotationSpeed +
            mainRotation * (particle.layer % 2 === 0 ? 0.4 : -0.25);
          const scaledTx = particle.centerX + (particle.tx - particle.centerX) * breathe;
          const scaledTy = particle.centerY + (particle.ty - particle.centerY) * breathe;
          const rotated = rotatePoint(scaledTx, scaledTy, particle.centerX, particle.centerY, rotation);
          const gatherX = particle.startX + (particle.tx - particle.startX) * gather;
          const gatherY = particle.startY + (particle.ty - particle.startY) * gather;
          const blend = Math.min(orbitTime * 0.45, 1);
          particle.x = gatherX + (rotated.x - particle.tx) * blend;
          particle.y = gatherY + (rotated.y - particle.ty) * blend;

          const twinkle = 0.7 + 0.3 * Math.sin(elapsed * 2 + particle.twinkle);
          const alpha = Math.min(1, gather * 1.15) * twinkle;
          const glow = 16 + particle.layer * 4;
          drawStarHeart(ctx, particle.x, particle.y, particle.size, alpha, particle.hue, glow);
        } else {
          const orbitAngle = particle.angle + orbitTime * particle.rotationSpeed;
          const orbitX = particle.centerX + Math.cos(orbitAngle) * particle.rx;
          const orbitY = particle.centerY + Math.sin(orbitAngle) * particle.ry;
          const gatherX = particle.startX + (particle.tx - particle.startX) * gather;
          const gatherY = particle.startY + (particle.ty - particle.startY) * gather;
          const blend = Math.min(orbitTime * 0.4, 1);
          particle.x = gatherX + (orbitX - particle.tx) * blend;
          particle.y = gatherY + (orbitY - particle.ty) * blend;

          const twinkle = 0.65 + 0.35 * Math.sin(elapsed * 1.8 + particle.twinkle);
          const alpha = Math.min(1, gather * 1.1) * twinkle;
          drawStarHeart(ctx, particle.x, particle.y, particle.size, alpha, particle.hue, 18);
        }
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
      <div className={styles.glowTop} aria-hidden />
      <div className={styles.glowBottom} aria-hidden />
      <div className={styles.glowHeart} aria-hidden />
    </div>
  );
}
