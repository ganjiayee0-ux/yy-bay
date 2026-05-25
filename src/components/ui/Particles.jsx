import { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './Particles.module.css';

function createParticles(count, intensity = 1) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: (Math.random() * 3 + 1) * intensity,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 8,
    opacity: (Math.random() * 0.4 + 0.15) * intensity,
  }));
}

export default function Particles({ intensity = 1 }) {
  const particles = useMemo(() => createParticles(48, intensity), [intensity]);

  return (
    <div className={styles.container} aria-hidden>
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className={styles.particle}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() > 0.5 ? 12 : -12, 0],
            opacity: [particle.opacity, particle.opacity * 1.4, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
