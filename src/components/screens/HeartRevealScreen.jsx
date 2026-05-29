import { motion } from 'framer-motion';
import HeartGatherCanvas from '../effects/HeartGatherCanvas';
import { letterContent } from '../../config/content';
import styles from './HeartRevealScreen.module.css';

export default function HeartRevealScreen({ onBack }) {
  return (
    <section className={styles.screen}>
      <div className={styles.gatherLayer}>
        <HeartGatherCanvas />
      </div>

      <motion.button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        initial={{ opacity: 0, y: 10, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ duration: 1.2, delay: 10, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.05, x: '-50%' }}
        whileTap={{ scale: 0.96, x: '-50%' }}
      >
        {letterContent.heartReveal.back}
      </motion.button>
    </section>
  );
}
