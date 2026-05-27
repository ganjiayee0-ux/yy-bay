import { useMemo } from 'react';
import { isMobileViewport } from '../../utils/performance';
import styles from './FallingHearts.module.css';

function HeartShape({ size, color }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={styles.shape}
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
      />
    </svg>
  );
}

function createHearts(count) {
  const colors = [
    'rgba(255, 182, 193, 0.55)',
    'rgba(184, 161, 255, 0.5)',
    'rgba(255, 204, 170, 0.45)',
    'rgba(255, 150, 180, 0.4)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 10 + 5,
    duration: Math.random() * 6 + 5,
    delay: Math.random() * 7,
    drift: (Math.random() - 0.5) * 90,
    rotate: (Math.random() - 0.5) * 40,
    opacity: Math.random() * 0.4 + 0.18,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export default function FallingHearts({ intensity = 1, visible = true }) {
  const baseCount = isMobileViewport() ? 22 : 44;
  const count = Math.round(baseCount * intensity);
  const hearts = useMemo(() => createHearts(count), [count]);

  if (!visible) return null;

  return (
    <div className={styles.container} aria-hidden>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className={styles.heart}
          style={{
            left: `${heart.x}%`,
            '--duration': `${heart.duration}s`,
            '--delay': `${heart.delay}s`,
            '--drift': `${heart.drift}px`,
            '--opacity': heart.opacity,
            '--rotate': `${heart.rotate}deg`,
          }}
        >
          <HeartShape size={heart.size} color={heart.color} />
        </div>
      ))}
    </div>
  );
}
