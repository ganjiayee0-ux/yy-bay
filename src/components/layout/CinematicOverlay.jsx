import { motion } from 'framer-motion';
import styles from './CinematicOverlay.module.css';

export default function CinematicOverlay({ active }) {
  if (!active) return null;

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
