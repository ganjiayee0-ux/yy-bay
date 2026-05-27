import { useMemo } from 'react';
import { isMobileViewport } from '../../utils/performance';
import styles from './Particles.module.css';

function createParticles(count, intensity = 1) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: (Math.random() * 3 + 1) * intensity,
    duration: Math.random() * 16 + 12,
    delay: Math.random() * 6,
    opacity: (Math.random() * 0.4 + 0.15) * intensity,
    driftX: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 10 + 4),
  }));
}

export default function Particles({ intensity = 1 }) {
  const count = isMobileViewport() ? 16 : 32;
  const particles = useMemo(() => createParticles(count, intensity), [count, intensity]);

  return (
    <div className={styles.container} aria-hidden>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={styles.particle}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            '--duration': `${particle.duration}s`,
            '--delay': `${particle.delay}s`,
            '--drift-x': `${particle.driftX}px`,
            '--opacity': particle.opacity,
            '--peak-opacity': particle.opacity * 1.35,
          }}
        />
      ))}
    </div>
  );
}
