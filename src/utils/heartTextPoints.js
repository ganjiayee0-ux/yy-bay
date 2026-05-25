export function sampleTextPoints(text, canvasWidth, canvasHeight, fontSize, fontFamily) {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = `500 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

  const { data, width, height } = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const gap = window.innerWidth < 480 ? 7 : 5;
  const points = [];

  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 140) {
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
