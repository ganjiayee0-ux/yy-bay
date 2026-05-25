export function heartLocalXY(t, scale, scaleX = 1, scaleY = 1) {
  const x = scale * scaleX * 16 * Math.pow(Math.sin(t), 3);
  const y =
    -scale *
    scaleY *
    (13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t));
  return { x, y };
}

export function getHeartAnchor(width, height, scale) {
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i <= 360; i += 1) {
    const t = (i / 360) * Math.PI * 2;
    const { y } = heartLocalXY(t, scale, 1, 1);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const midY = (minY + maxY) / 2;

  return {
    x: width / 2,
    y: height * 0.4 - midY,
  };
}

export function createDenseHeartFill(anchorX, anchorY, scale, targetCount = 1400) {
  const points = [];
  const scaleX = 0.94;
  const scaleY = 1.02;

  while (points.length < targetCount) {
    const t = Math.random() * Math.PI * 2;
    const rho = Math.pow(Math.random(), 0.58);
    const { x, y } = heartLocalXY(t, scale, scaleX, scaleY);

    points.push({
      x: anchorX + x * rho,
      y: anchorY + y * rho,
    });
  }

  return points;
}

export function createFloorParticles(width, height, count = 520) {
  const floorTop = height * 0.58;
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: floorTop + Math.random() * (height - floorTop),
    baseY: floorTop + Math.random() * (height - floorTop),
    size: Math.random() * 2.8 + 0.8,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 1.8 + 0.5,
    drift: (Math.random() - 0.5) * 0.6,
    bounceSpeed: Math.random() * 2.2 + 0.8,
    bounceAmp: Math.random() * 10 + 4,
    pulseSpeed: Math.random() * 2.5 + 1,
    pulsePhase: Math.random() * Math.PI * 2,
    wanderSpeed: Math.random() * 0.9 + 0.3,
    kind: Math.random() > 0.65 ? 'white' : Math.random() > 0.4 ? 'pink' : 'red',
    opacity: Math.random() * 0.6 + 0.25,
  }));
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
