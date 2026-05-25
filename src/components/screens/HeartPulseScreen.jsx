import { motion } from 'framer-motion';
import HeartPulseCanvas from '../effects/HeartPulseCanvas';
import { letterContent } from '../../config/content';
import styles from './HeartPulseScreen.module.css';

export default function HeartPulseScreen({ onBackToLetter }) {
  return (
    <section className={styles.screen}>
      <HeartPulseCanvas />
      <motion.button
        type="button"
        className={styles.backButton}
        onClick={onBackToLetter}
        initial={{ opacity: 0, y: 10, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ duration: 1.2, delay: 4.8, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.05, x: '-50%' }}
        whileTap={{ scale: 0.96, x: '-50%' }}
      >
        <span className={styles.heart}>❤️</span>
        <span className={styles.label}>{letterContent.heartPulse.backToLetter}</span>
      </motion.button>
    </section>
  );
}
