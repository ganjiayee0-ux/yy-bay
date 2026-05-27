export function sampleTextPoints(textOrLines, canvasWidth, canvasHeight, fontSize, fontFamily) {
  const lines = Array.isArray(textOrLines) ? textOrLines : [textOrLines];
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lineHeight = fontSize * 1.32;
  const blockHeight = lineHeight * (lines.length - 1);
  const firstY = canvasHeight / 2 - blockHeight / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, canvasWidth / 2, firstY + index * lineHeight);
  });

  const { data, width, height } = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const gap = window.innerWidth < 480 ? 4 : 5;
  const points = [];

  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 100) {
        points.push({ x, y });
      }
    }
  }

  return points;
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
