import { motion } from 'framer-motion';
import styles from './MusicToggle.module.css';

export default function MusicToggle({ isPlaying, onToggle, visible = true }) {
  if (!visible) return null;

  return (
    <motion.button
      type="button"
      className={styles.toggle}
      onClick={onToggle}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-label={isPlaying ? 'Mute music' : 'Play music'}
    >
      <span className={styles.icon}>{isPlaying ? '🔊' : '🔇'}</span>
    </motion.button>
  );
}
