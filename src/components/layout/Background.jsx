import { motion } from 'framer-motion';
import Particles from '../ui/Particles';
import styles from './Background.module.css';

export default function Background({ brightness = 0, particleIntensity = 1 }) {
  return (
    <div className={styles.background}>
      <motion.div
        className={styles.gradient}
        animate={{ opacity: 0.35 + brightness * 0.45 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className={styles.purpleGlow}
        animate={{ opacity: 0.5 + brightness * 0.2 }}
        transition={{ duration: 2.5 }}
      />
      <motion.div
        className={styles.pinkGlow}
        animate={{ opacity: 0.35 + brightness * 0.25 }}
        transition={{ duration: 2.5 }}
      />
      <Particles intensity={particleIntensity} />
    </div>
  );
}
